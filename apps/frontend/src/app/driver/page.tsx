'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { useAuthStore } from '@/store/auth.store';
import { useSocket } from '@/hooks/use-socket';
import { driverService } from '@/services/driver.service';
import { authService } from '@/services/auth.service';

const Map = dynamic(() => import('@/components/map/map').then((m) => m.Map), { ssr: false });

type DriverState = 'offline' | 'available' | 'arriving' | 'waiting' | 'in_progress' | 'completed';

const stateConfig: Record<DriverState, { label: string; color: string; icon: string; next?: DriverState; nextLabel?: string; rideStatus?: string }> = {
  offline: { label: 'Desconectado', color: 'bg-gray-600', icon: '⏸️' },
  available: { label: 'Disponible', color: 'bg-green-600', icon: '✅' },
  arriving: { label: 'En camino a recoger', color: 'bg-blue-600', icon: '🚗', next: 'waiting', nextLabel: 'Llegué al punto', rideStatus: 'WAITING_PASSENGER' },
  waiting: { label: 'Esperando pasajero', color: 'bg-orange-600', icon: '⏳', next: 'in_progress', nextLabel: 'Pasajero recogido', rideStatus: 'IN_PROGRESS' },
  in_progress: { label: 'En camino al destino', color: 'bg-purple-600', icon: '🛣️', next: 'completed', nextLabel: 'Viaje finalizado', rideStatus: 'COMPLETED' },
  completed: { label: 'Viaje finalizado', color: 'bg-green-700', icon: '🎉' },
};

export default function DriverPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { socket, joinRide } = useSocket();

  const [driverState, setDriverState] = useState<DriverState>('offline');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [incomingRide, setIncomingRide] = useState<any>(null);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const watchRef = useRef<number | null>(null);
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cargar perfil y obtener driverId
  useEffect(() => {
    if (!isAuthenticated) { router.replace('/login'); return; }

    const loadProfile = async () => {
      try {
        const profile = await authService.getProfile();
        if (profile.role?.name !== 'DRIVER') {
          router.replace('/dashboard');
          return;
        }
        if (profile.driver?.id) {
          setDriverId(profile.driver.id);
        }
      } catch {
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [isAuthenticated, router]);

  // Escuchar solicitudes de viaje via Socket
  useEffect(() => {
    if (!socket) return;
    const handler = (data: any) => {
      if (driverState === 'available') {
        setIncomingRide(data);
      }
    };
    socket.on('ride:requested', handler);
    return () => { socket.off('ride:requested', handler); };
  }, [socket, driverState]);

  // GPS tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      null,
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
  }, []);

  const stopTracking = () => {
    if (watchRef.current !== null) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
      locationIntervalRef.current = null;
    }
  };

  // Enviar ubicación cada 5s
  useEffect(() => {
    if (driverState === 'offline' || !driverId || !currentLocation) return;

    locationIntervalRef.current = setInterval(() => {
      driverService.updateLocation(driverId, currentLocation.lat, currentLocation.lng);
      if (activeRide && socket) {
        socket.emit('driver:location', { rideId: activeRide.id, lat: currentLocation.lat, lng: currentLocation.lng });
      }
    }, 5000);

    return () => { if (locationIntervalRef.current) clearInterval(locationIntervalRef.current); };
  }, [driverState, driverId, currentLocation, activeRide, socket]);

  const toggleOnline = async () => {
    if (!driverId) return;

    if (driverState === 'offline') {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          await driverService.goOnline(driverId, latitude, longitude);
          setDriverState('available');
          startTracking();
        },
        () => alert('Necesitas activar el GPS para conectarte'),
        { enableHighAccuracy: true, timeout: 10000 },
      );
    } else {
      await driverService.goOffline(driverId);
      setDriverState('offline');
      setActiveRide(null);
      setIncomingRide(null);
      stopTracking();
    }
  };

  const acceptRide = async () => {
    if (!incomingRide || !driverId) return;
    try {
      const rideId = incomingRide.id || incomingRide.ride?.id;
      const ride = await driverService.acceptRide(rideId, driverId);
      setActiveRide(ride);
      setIncomingRide(null);
      setDriverState('arriving');
      joinRide(ride.id);
    } catch {
      setIncomingRide(null);
    }
  };

  const advanceState = async () => {
    if (!activeRide) return;
    const config = stateConfig[driverState];
    if (!config.next || !config.rideStatus) return;

    await driverService.updateRideStatus(activeRide.id, config.rideStatus);
    setDriverState(config.next);

    if (config.next === 'completed') {
      setTimeout(() => { setActiveRide(null); setDriverState('available'); }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <p className="text-gray-400">Cargando panel de conductor...</p>
      </div>
    );
  }

  if (!driverId) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center p-6">
        <div className="glass rounded-2xl p-8 text-center max-w-md">
          <span className="text-4xl">⚠️</span>
          <h2 className="text-white font-bold text-xl mt-4">Perfil de conductor no encontrado</h2>
          <p className="text-gray-400 mt-2">Tu cuenta no tiene un perfil de conductor asociado. Contacta al administrador.</p>
          <button onClick={() => router.push('/dashboard')} className="mt-6 gradient-primary text-white px-6 py-3 rounded-xl font-semibold">
            Volver al Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentConfig = stateConfig[driverState];

  const allMarkers = [
    ...(currentLocation ? [{ lat: currentLocation.lat, lng: currentLocation.lng, label: 'Tú', color: '#0ea5e9' }] : []),
    ...(activeRide ? [
      { lat: activeRide.originLat, lng: activeRide.originLng, label: 'Recoger', color: '#22c55e' },
      { lat: activeRide.destinationLat, lng: activeRide.destinationLng, label: 'Destino', color: '#ef4444' },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      {/* Map */}
      <div className="h-[40vh] relative">
        <Map
          center={currentLocation ? [currentLocation.lat, currentLocation.lng] : [40.4168, -3.7038]}
          zoom={15}
          markers={allMarkers}
          route={activeRide ? [[activeRide.originLat, activeRide.originLng], [activeRide.destinationLat, activeRide.destinationLng]] : undefined}
          driverLocation={currentLocation}
        />
        {/* Back button */}
        <div className="absolute top-4 left-4 z-[1000]">
          <button onClick={() => router.push('/dashboard')} className="glass px-3 py-2 rounded-lg text-white text-sm hover:bg-white/10 transition-colors">
            ← Volver
          </button>
        </div>
        {/* Status badge */}
        <div className="absolute top-4 right-4 z-[1000]">
          <div className={`${currentConfig.color} px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2 shadow-lg`}>
            <span>{currentConfig.icon}</span>
            <span>{currentConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 p-6 -mt-6 relative z-10 space-y-4">

        {/* Incoming ride alert */}
        {incomingRide && (
          <div className="glass rounded-2xl p-5 border border-primary-500/30 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🔔</span>
              <div>
                <p className="text-white font-semibold">¡Nuevo viaje disponible!</p>
                <p className="text-gray-400 text-sm">
                  {incomingRide.originAddress || incomingRide.ride?.originAddress || 'Pasajero cercano'}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={acceptRide} className="flex-1 gradient-primary text-white py-3 rounded-xl font-semibold">
                ✅ Aceptar
              </button>
              <button onClick={() => setIncomingRide(null)} className="flex-1 border border-red-500/30 text-red-400 py-3 rounded-xl font-medium">
                ❌ Rechazar
              </button>
            </div>
          </div>
        )}

        {/* Active ride info */}
        {activeRide && (
          <div className="glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-semibold">Viaje activo</p>
              <span className="text-primary-400 font-bold">${activeRide.price}</span>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <p className="text-gray-300 text-sm truncate">{activeRide.originAddress}</p>
              </div>
              <div className="flex gap-2 items-center">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <p className="text-gray-300 text-sm truncate">{activeRide.destinationAddress}</p>
              </div>
            </div>
            {activeRide.client && (
              <p className="text-gray-400 text-sm">👤 {activeRide.client.firstName} {activeRide.client.lastName}</p>
            )}
          </div>
        )}

        {/* Advance state button */}
        {activeRide && currentConfig.next && (
          <button onClick={advanceState} className="w-full gradient-primary text-white py-4 rounded-xl font-semibold text-lg">
            {currentConfig.nextLabel}
          </button>
        )}

        {/* Online/Offline toggle */}
        {!activeRide && (
          <button
            onClick={toggleOnline}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              driverState === 'offline'
                ? 'gradient-primary text-white hover:opacity-90'
                : 'border border-red-500/30 text-red-400 hover:bg-red-500/10'
            }`}
          >
            {driverState === 'offline' ? '🟢 Conectarse' : '🔴 Desconectarse'}
          </button>
        )}

        {/* GPS info */}
        {currentLocation && (
          <div className="glass rounded-xl p-3 flex items-center justify-between">
            <span className="text-gray-400 text-sm">📡 GPS activo</span>
            <span className="text-gray-500 text-xs">{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</span>
          </div>
        )}

        {/* No GPS warning when offline */}
        {driverState === 'offline' && !currentLocation && (
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Toca "Conectarse" para activar GPS y recibir viajes</p>
          </div>
        )}
      </div>
    </div>
  );
}

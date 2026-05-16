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
  arriving: { label: 'Ir a recoger pasajero', color: 'bg-blue-600', icon: '🚗', next: 'waiting', nextLabel: '📍 Llegué al punto de recogida', rideStatus: 'WAITING_PASSENGER' },
  waiting: { label: 'Esperando al pasajero', color: 'bg-orange-600', icon: '⏳', next: 'in_progress', nextLabel: '👤 Pasajero a bordo - Iniciar viaje', rideStatus: 'IN_PROGRESS' },
  in_progress: { label: 'Rumbo al destino', color: 'bg-purple-600', icon: '🛣️', next: 'completed', nextLabel: '🏁 Viaje finalizado', rideStatus: 'COMPLETED' },
  completed: { label: 'Viaje completado', color: 'bg-green-700', icon: '🎉' },
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

  const [gpsError, setGpsError] = useState<string | null>(null);

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
      if (!navigator.geolocation) {
        setGpsError('GPS no disponible en este navegador');
        return;
      }
      setGpsError(null);
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          await driverService.goOnline(driverId, latitude, longitude);
          setDriverState('available');
          startTracking();
          setGpsError(null);
        },
        (err) => {
          if (err.code === 1) setGpsError('Permiso GPS denegado. Actívalo en la configuración del navegador.');
          else if (err.code === 2) setGpsError('GPS no disponible. Verifica que esté activado.');
          else setGpsError('No se pudo obtener ubicación. Intenta de nuevo.');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
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
      // Cambiar a DRIVER_ARRIVING inmediatamente
      await driverService.updateRideStatus(ride.id, 'DRIVER_ARRIVING');
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

            {/* Progress steps */}
            <div className="flex items-center gap-1 mb-4">
              {['arriving', 'waiting', 'in_progress', 'completed'].map((s, i) => (
                <div key={s} className="flex-1 flex items-center">
                  <div className={`h-1.5 w-full rounded-full ${
                    ['arriving', 'waiting', 'in_progress', 'completed'].indexOf(driverState) >= i
                      ? 'bg-primary-500'
                      : 'bg-gray-700'
                  }`} />
                </div>
              ))}
            </div>

            {/* Current instruction */}
            <div className="bg-white/5 rounded-xl p-4 mb-3">
              <p className="text-primary-400 text-xs font-medium uppercase mb-1">Instrucción</p>
              <p className="text-white font-medium">
                {driverState === 'arriving' && '🚗 Dirígete al punto de recogida del pasajero'}
                {driverState === 'waiting' && '⏳ Espera a que el pasajero suba al vehículo'}
                {driverState === 'in_progress' && '🛣️ Lleva al pasajero a su destino'}
                {driverState === 'completed' && '🎉 ¡Viaje completado con éxito!'}
              </p>
            </div>

            {/* Route info */}
            <div className="space-y-2 mb-3">
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-green-400 border-2 border-green-600" />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Recoger en</p>
                  <p className="text-gray-300 text-sm truncate">{activeRide.originAddress}</p>
                </div>
              </div>
              <div className="border-l-2 border-dashed border-gray-600 ml-1.5 h-3" />
              <div className="flex gap-2 items-center">
                <span className="w-3 h-3 rounded-full bg-red-400 border-2 border-red-600" />
                <div className="flex-1">
                  <p className="text-gray-500 text-xs">Destino</p>
                  <p className="text-gray-300 text-sm truncate">{activeRide.destinationAddress}</p>
                </div>
              </div>
            </div>

            {/* Client info */}
            {activeRide.client && (
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {activeRide.client.firstName?.[0]}{activeRide.client.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{activeRide.client.firstName} {activeRide.client.lastName}</p>
                  {activeRide.client.phone && <p className="text-gray-400 text-xs">{activeRide.client.phone}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advance state button */}
        {activeRide && currentConfig.next && (
          <button
            onClick={advanceState}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              driverState === 'in_progress'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'gradient-primary text-white hover:opacity-90'
            }`}
          >
            {currentConfig.nextLabel}
          </button>
        )}

        {/* Completed message */}
        {driverState === 'completed' && (
          <div className="glass rounded-2xl p-6 text-center border border-green-500/20">
            <span className="text-4xl">🎉</span>
            <p className="text-white font-semibold mt-3">¡Viaje completado!</p>
            <p className="text-gray-400 text-sm mt-1">Volviendo a disponible...</p>
          </div>
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

        {/* GPS error */}
        {gpsError && (
          <div className="glass rounded-xl p-4 border border-yellow-500/30">
            <p className="text-yellow-400 text-sm">⚠️ {gpsError}</p>
          </div>
        )}

        {/* No GPS warning when offline */}
        {driverState === 'offline' && !currentLocation && !gpsError && (
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-gray-400 text-sm">Toca "Conectarse" para activar GPS y recibir viajes</p>
          </div>
        )}
      </div>
    </div>
  );
}

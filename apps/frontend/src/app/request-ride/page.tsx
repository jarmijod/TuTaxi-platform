'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ridesService, RequestRidePayload } from '@/services/rides.service';
import { useRideStore } from '@/store/ride.store';
import { useAuthStore } from '@/store/auth.store';

const Map = dynamic(() => import('@/components/map/map').then((m) => m.Map), { ssr: false });

interface Location {
  address: string;
  lat: number;
  lng: number;
}

export default function RequestRidePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setActiveRide } = useRideStore();

  const [origin, setOrigin] = useState<Location>({ address: '', lat: 0, lng: 0 });
  const [destination, setDestination] = useState<Location>({ address: '', lat: 0, lng: 0 });
  const [step, setStep] = useState<'origin' | 'destination'>('origin');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([40.4168, -3.7038]);

  const stepRef = useRef(step);
  stepRef.current = step;

  // GPS: obtener ubicación actual al cargar
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!navigator.geolocation) {
      setGpsError('GPS no disponible en este navegador');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setOrigin({ address: `Mi ubicación (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, lat: latitude, lng: longitude });
        setMapCenter([latitude, longitude]);
        setStep('destination');
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === 1) setGpsError('Permiso GPS denegado. Toca el mapa para seleccionar.');
        else if (err.code === 2) setGpsError('GPS no disponible. Toca el mapa para seleccionar.');
        else setGpsError('No se pudo obtener ubicación. Toca el mapa.');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }, []);

  const { mutate: requestRide, isPending, data: estimate } = useMutation({
    mutationFn: (payload: RequestRidePayload) => ridesService.request(payload),
    onSuccess: (data) => {
      setActiveRide(data.ride.id);
      router.push(`/ride/${data.ride.id}`);
    },
  });

  const handleMapClick = (lat: number, lng: number) => {
    const addr = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    if (stepRef.current === 'origin') {
      setOrigin({ address: addr, lat, lng });
      setStep('destination');
    } else {
      setDestination({ address: addr, lat, lng });
    }
  };

  if (!isAuthenticated) { router.replace('/login'); return null; }

  const markers = [
    ...(origin.lat ? [{ lat: origin.lat, lng: origin.lng, label: 'Origen', color: '#22c55e' }] : []),
    ...(destination.lat ? [{ lat: destination.lat, lng: destination.lng, label: 'Destino', color: '#ef4444' }] : []),
  ];

  const route = origin.lat && destination.lat
    ? [[origin.lat, origin.lng], [destination.lat, destination.lng]] as [number, number][]
    : undefined;

  const canRequest = origin.lat !== 0 && destination.lat !== 0;

  const handleRequest = () => {
    if (!canRequest) return;
    requestRide({
      originAddress: origin.address || `${origin.lat}, ${origin.lng}`,
      destinationAddress: destination.address || `${destination.lat}, ${destination.lng}`,
      originLat: origin.lat,
      originLng: origin.lng,
      destinationLat: destination.lat,
      destinationLng: destination.lng,
    });
  };

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      {/* Map */}
      <div className="h-[45vh] relative">
        <Map
          center={mapCenter}
          zoom={14}
          markers={markers}
          route={route}
          onMapClick={handleMapClick}
        />
        <div className="absolute top-4 left-4 z-[1000]">
          <button onClick={() => router.back()} className="glass px-3 py-2 rounded-lg text-white text-sm">
            ← Volver
          </button>
        </div>
        <div className="absolute top-4 right-4 z-[1000]">
          <div className={`glass px-3 py-2 rounded-lg text-sm font-medium ${step === 'origin' ? 'text-green-400 border border-green-500/30' : 'text-red-400 border border-red-500/30'}`}>
            {step === 'origin' ? '📍 Selecciona origen' : '📌 Selecciona destino'}
          </div>
        </div>
        {gpsLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] glass px-4 py-2 rounded-lg text-primary-400 text-sm">
            📡 Obteniendo tu ubicación...
          </div>
        )}
        {gpsError && !gpsLoading && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1000] glass px-4 py-2 rounded-lg text-yellow-400 text-sm max-w-[90%] text-center">
            ⚠️ {gpsError}
          </div>
        )}
      </div>

      {/* Panel */}
      <div className="flex-1 p-6 -mt-6 relative z-10">
        <div className="glass rounded-2xl p-6 space-y-4">
          {/* Origin */}
          <div>
            <label className="text-sm text-gray-300 mb-1 flex items-center justify-between">
              <span>📍 Origen</span>
              {origin.lat !== 0 && <span className="text-green-400 text-xs">✓ Seleccionado</span>}
            </label>
            <div className="flex gap-2">
              <input
                value={origin.address}
                onChange={(e) => setOrigin({ ...origin, address: e.target.value })}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
                placeholder="Toca el mapa o usa GPS"
                onFocus={() => setStep('origin')}
              />
              <button
                onClick={() => {
                  setGpsError(null);
                  setGpsLoading(true);
                  navigator.geolocation?.getCurrentPosition(
                    (pos) => {
                      const { latitude, longitude } = pos.coords;
                      setOrigin({ address: `Mi ubicación (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`, lat: latitude, lng: longitude });
                      setMapCenter([latitude, longitude]);
                      setStep('destination');
                      setGpsLoading(false);
                      setGpsError(null);
                    },
                    (err) => {
                      setGpsLoading(false);
                      setGpsError('No se pudo obtener GPS. Selecciona en el mapa.');
                    },
                    { enableHighAccuracy: true, timeout: 15000 },
                  );
                }}
                className="glass px-3 rounded-lg text-primary-400 hover:bg-white/10 transition-colors"
                title="Usar mi ubicación"
              >
                📡
              </button>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="text-sm text-gray-300 mb-1 flex items-center justify-between">
              <span>📌 Destino</span>
              {destination.lat !== 0 && <span className="text-red-400 text-xs">✓ Seleccionado</span>}
            </label>
            <input
              value={destination.address}
              onChange={(e) => setDestination({ ...destination, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Toca el mapa para seleccionar destino"
              onFocus={() => setStep('destination')}
            />
          </div>

          {/* Estimate */}
          {estimate && (
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center glass rounded-lg p-3">
                <p className="text-gray-400 text-xs">Distancia</p>
                <p className="text-white font-bold">{estimate.estimate.distance} km</p>
              </div>
              <div className="text-center glass rounded-lg p-3">
                <p className="text-gray-400 text-xs">Tiempo</p>
                <p className="text-white font-bold">{estimate.estimate.duration} min</p>
              </div>
              <div className="text-center glass rounded-lg p-3">
                <p className="text-gray-400 text-xs">Precio</p>
                <p className="text-primary-400 font-bold">${estimate.estimate.price}</p>
              </div>
            </div>
          )}

          {/* Button */}
          <button
            onClick={handleRequest}
            disabled={isPending || !canRequest}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${
              canRequest
                ? 'gradient-primary text-white hover:opacity-90'
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isPending ? '🔍 Buscando conductor...' : canRequest ? '🚕 Solicitar Viaje' : 'Selecciona origen y destino'}
          </button>
        </div>
      </div>
    </div>
  );
}

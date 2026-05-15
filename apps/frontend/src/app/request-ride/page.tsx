'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ridesService, RequestRidePayload } from '@/services/rides.service';
import { useRideStore } from '@/store/ride.store';
import { useAuthStore } from '@/store/auth.store';

const Map = dynamic(() => import('@/components/map/map').then((m) => m.Map), { ssr: false });

export default function RequestRidePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setActiveRide } = useRideStore();

  const [origin, setOrigin] = useState({ address: '', lat: 0, lng: 0 });
  const [destination, setDestination] = useState({ address: '', lat: 0, lng: 0 });
  const [selectingOrigin, setSelectingOrigin] = useState(true);

  const { mutate: requestRide, isPending, data: estimate } = useMutation({
    mutationFn: (payload: RequestRidePayload) => ridesService.request(payload),
    onSuccess: (data) => {
      setActiveRide(data.ride.id);
      router.push(`/ride/${data.ride.id}`);
    },
  });

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (selectingOrigin) {
      setOrigin({ address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
      setSelectingOrigin(false);
    } else {
      setDestination({ address: `${lat.toFixed(4)}, ${lng.toFixed(4)}`, lat, lng });
    }
  }, [selectingOrigin]);

  if (!isAuthenticated) { router.replace('/login'); return null; }

  const markers = [
    ...(origin.lat ? [{ lat: origin.lat, lng: origin.lng, label: 'Origen', color: '#22c55e' }] : []),
    ...(destination.lat ? [{ lat: destination.lat, lng: destination.lng, label: 'Destino', color: '#ef4444' }] : []),
  ];

  const route = origin.lat && destination.lat
    ? [[origin.lat, origin.lng], [destination.lat, destination.lng]] as [number, number][]
    : undefined;

  const canRequest = origin.lat && destination.lat && origin.address && destination.address;

  const handleRequest = () => {
    if (!canRequest) return;
    requestRide({
      originAddress: origin.address,
      destinationAddress: destination.address,
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
          center={[40.4168, -3.7038]}
          zoom={13}
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
          <div className={`glass px-3 py-2 rounded-lg text-sm ${selectingOrigin ? 'text-green-400' : 'text-red-400'}`}>
            {selectingOrigin ? '📍 Toca para origen' : '📌 Toca para destino'}
          </div>
        </div>
      </div>

      {/* Panel */}
      <div className="flex-1 p-6 -mt-6 relative z-10">
        <div className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">📍 Origen</label>
            <input
              value={origin.address}
              onChange={(e) => setOrigin({ ...origin, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500 transition-colors"
              placeholder="Toca el mapa o escribe dirección"
              onFocus={() => setSelectingOrigin(true)}
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1 block">📌 Destino</label>
            <input
              value={destination.address}
              onChange={(e) => setDestination({ ...destination, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
              placeholder="Toca el mapa o escribe dirección"
              onFocus={() => setSelectingOrigin(false)}
            />
          </div>

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

          <button
            onClick={handleRequest}
            disabled={isPending || !canRequest}
            className="w-full gradient-primary text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isPending ? '🔍 Buscando conductor...' : '🚕 Solicitar Viaje'}
          </button>
        </div>
      </div>
    </div>
  );
}

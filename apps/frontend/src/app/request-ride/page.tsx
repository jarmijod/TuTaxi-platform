'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ridesService, RequestRidePayload } from '@/services/rides.service';
import { useRideStore } from '@/store/ride.store';
import { useAuthStore } from '@/store/auth.store';

export default function RequestRidePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { setActiveRide } = useRideStore();
  const [origin, setOrigin] = useState({ address: '', lat: 40.4168, lng: -3.7038 });
  const [destination, setDestination] = useState({ address: '', lat: 40.4530, lng: -3.6883 });

  const { mutate: requestRide, isPending, data: estimate } = useMutation({
    mutationFn: (payload: RequestRidePayload) => ridesService.request(payload),
    onSuccess: (data) => {
      setActiveRide(data.ride.id);
      router.push(`/ride/${data.ride.id}`);
    },
  });

  if (!isAuthenticated) {
    router.replace('/login');
    return null;
  }

  const handleRequest = () => {
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
    <div className="min-h-screen bg-dark-500 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-2xl font-bold text-white">Solicitar Viaje</h1>
        </div>

        {/* Map placeholder */}
        <div className="glass rounded-2xl h-64 mb-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-dark-500" />
          <div className="relative text-center">
            <span className="text-4xl">🗺️</span>
            <p className="text-gray-400 mt-2 text-sm">Mapa interactivo</p>
            <p className="text-gray-500 text-xs">Integra Google Maps o Mapbox API key</p>
          </div>
        </div>

        {/* Form */}
        <div className="glass rounded-2xl p-6 space-y-4 mb-6">
          <div>
            <label className="text-sm text-gray-300 mb-1 block">📍 Origen</label>
            <input
              value={origin.address}
              onChange={(e) => setOrigin({ ...origin, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="¿Dónde estás?"
            />
          </div>
          <div>
            <label className="text-sm text-gray-300 mb-1 block">📌 Destino</label>
            <input
              value={destination.address}
              onChange={(e) => setDestination({ ...destination, address: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              placeholder="¿A dónde vas?"
            />
          </div>
        </div>

        {/* Estimate */}
        {estimate && (
          <div className="glass rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gray-400 text-xs">Distancia</p>
                <p className="text-white text-lg font-bold">{estimate.estimate.distance} km</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Tiempo</p>
                <p className="text-white text-lg font-bold">{estimate.estimate.duration} min</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Precio</p>
                <p className="text-primary-400 text-lg font-bold">${estimate.estimate.price}</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleRequest}
          disabled={isPending || !origin.address || !destination.address}
          className="w-full gradient-primary text-white py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? 'Buscando conductor...' : 'Solicitar Viaje'}
        </button>
      </div>
    </div>
  );
}

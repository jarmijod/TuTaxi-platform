'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { ridesService } from '@/services/rides.service';
import { useSocket } from '@/hooks/use-socket';
import { useRideStore } from '@/store/ride.store';

const Map = dynamic(() => import('@/components/map/map').then((m) => m.Map), { ssr: false });

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  SEARCHING_DRIVER: { label: 'Buscando conductor', color: 'text-yellow-400', icon: '🔍' },
  DRIVER_ASSIGNED: { label: 'Conductor asignado', color: 'text-blue-400', icon: '✅' },
  DRIVER_ARRIVING: { label: 'Conductor en camino', color: 'text-blue-400', icon: '🚗' },
  WAITING_PASSENGER: { label: 'Esperando pasajero', color: 'text-orange-400', icon: '⏳' },
  IN_PROGRESS: { label: 'En viaje', color: 'text-green-400', icon: '🛣️' },
  COMPLETED: { label: 'Completado', color: 'text-green-500', icon: '🎉' },
  CANCELLED: { label: 'Cancelado', color: 'text-red-400', icon: '❌' },
};

export default function RideTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { joinRide } = useSocket();
  const { driverLocation } = useRideStore();

  const { data: ride, refetch } = useQuery({
    queryKey: ['ride', id],
    queryFn: () => ridesService.getRide(id),
    refetchInterval: 5000,
  });

  const { mutate: cancelRide } = useMutation({
    mutationFn: () => ridesService.cancel(id, 'User cancelled'),
    onSuccess: () => refetch(),
  });

  useEffect(() => {
    if (id) joinRide(id);
  }, [id, joinRide]);

  if (!ride) {
    return (
      <div className="min-h-screen bg-dark-500 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Cargando viaje...</div>
      </div>
    );
  }

  const status = statusLabels[ride.status] || statusLabels.SEARCHING_DRIVER;
  const isActive = !['COMPLETED', 'CANCELLED'].includes(ride.status);

  const markers = [
    { lat: ride.originLat, lng: ride.originLng, label: 'Origen', color: '#22c55e' },
    { lat: ride.destinationLat, lng: ride.destinationLng, label: 'Destino', color: '#ef4444' },
  ];

  const route: [number, number][] = [
    [ride.originLat, ride.originLng],
    [ride.destinationLat, ride.destinationLng],
  ];

  return (
    <div className="min-h-screen bg-dark-500 flex flex-col">
      {/* Map */}
      <div className="h-[40vh] relative">
        <Map
          center={[ride.originLat, ride.originLng]}
          zoom={13}
          markers={markers}
          route={route}
          driverLocation={driverLocation}
        />
        <div className="absolute top-4 left-4 z-[1000]">
          <button onClick={() => router.push('/dashboard')} className="glass px-3 py-2 rounded-lg text-white text-sm">
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <div className="flex-1 p-6 -mt-6 relative z-10 space-y-4">
        {/* Status */}
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">{status.icon}</span>
            <p className={`font-semibold text-lg ${status.color}`}>{status.label}</p>
          </div>
          <div className="space-y-1">
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-gray-300 text-sm truncate">{ride.originAddress}</p>
            </div>
            <div className="flex gap-2 items-center">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <p className="text-gray-300 text-sm truncate">{ride.destinationAddress}</p>
            </div>
          </div>
        </div>

        {/* Driver */}
        {ride.driver && (
          <div className="glass rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center shrink-0">
              <span className="text-white font-bold">{ride.driver.user.firstName[0]}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">
                {ride.driver.user.firstName} {ride.driver.user.lastName}
              </p>
              {ride.driver.vehicles?.[0] && (
                <p className="text-gray-400 text-sm truncate">
                  {ride.driver.vehicles[0].brand} {ride.driver.vehicles[0].model} • {ride.driver.vehicles[0].plateNumber}
                </p>
              )}
            </div>
            <span className="text-yellow-400 text-sm">⭐ {ride.driver.rating}</span>
          </div>
        )}

        {/* Price */}
        <div className="glass rounded-2xl p-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-gray-400 text-xs">Distancia</p>
              <p className="text-white font-bold">{ride.distance} km</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Tiempo</p>
              <p className="text-white font-bold">{ride.duration} min</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Precio</p>
              <p className="text-primary-400 font-bold text-lg">${ride.price}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        {isActive && ride.status !== 'IN_PROGRESS' && (
          <button
            onClick={() => cancelRide()}
            className="w-full border border-red-500/30 text-red-400 py-3 rounded-xl font-medium hover:bg-red-500/10 transition-colors"
          >
            Cancelar Viaje
          </button>
        )}

        {!isActive && (
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full gradient-primary text-white py-3 rounded-xl font-semibold"
          >
            Volver al inicio
          </button>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ridesService } from '@/services/rides.service';
import { useSocket } from '@/hooks/use-socket';
import { useRideStore } from '@/store/ride.store';

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

  return (
    <div className="min-h-screen bg-dark-500 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Map area */}
        <div className="glass rounded-2xl h-56 mb-6 flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/20 to-dark-500" />
          <div className="relative text-center">
            <span className="text-5xl">{status.icon}</span>
            {driverLocation && (
              <p className="text-gray-400 text-xs mt-2">
                Driver: {driverLocation.lat.toFixed(4)}, {driverLocation.lng.toFixed(4)}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        <div className="glass rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{status.icon}</span>
            <div>
              <p className={`font-semibold ${status.color}`}>{status.label}</p>
              <p className="text-gray-500 text-sm">ID: {ride.id.slice(0, 8)}...</p>
            </div>
          </div>

          {/* Route info */}
          <div className="space-y-2 border-t border-white/10 pt-4">
            <div className="flex gap-2">
              <span className="text-green-400">●</span>
              <p className="text-gray-300 text-sm">{ride.originAddress}</p>
            </div>
            <div className="flex gap-2">
              <span className="text-red-400">●</span>
              <p className="text-gray-300 text-sm">{ride.destinationAddress}</p>
            </div>
          </div>
        </div>

        {/* Driver info */}
        {ride.driver && (
          <div className="glass rounded-2xl p-6 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-white font-bold">
                  {ride.driver.user.firstName[0]}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold">
                  {ride.driver.user.firstName} {ride.driver.user.lastName}
                </p>
                {ride.driver.vehicles?.[0] && (
                  <p className="text-gray-400 text-sm">
                    {ride.driver.vehicles[0].brand} {ride.driver.vehicles[0].model} • {ride.driver.vehicles[0].plateNumber}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-yellow-400">⭐ {ride.driver.rating}</p>
              </div>
            </div>
          </div>
        )}

        {/* Price */}
        <div className="glass rounded-2xl p-6 mb-4">
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
              <p className="text-primary-400 font-bold">${ride.price}</p>
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

'use client';

import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ridesService } from '@/services/rides.service';
import { useAuthStore } from '@/store/auth.store';

export default function HistoryPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ['rides-history'],
    queryFn: () => ridesService.getHistory(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) { router.replace('/login'); return null; }

  return (
    <div className="min-h-screen bg-dark-500 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">←</button>
          <h1 className="text-2xl font-bold text-white">Historial de Viajes</h1>
        </div>

        {isLoading && <p className="text-gray-400">Cargando...</p>}

        {data?.rides?.length === 0 && (
          <div className="glass rounded-2xl p-8 text-center">
            <span className="text-4xl">🚕</span>
            <p className="text-gray-400 mt-4">No tienes viajes aún</p>
          </div>
        )}

        <div className="space-y-3">
          {data?.rides?.map((ride: any) => (
            <button
              key={ride.id}
              onClick={() => router.push(`/ride/${ride.id}`)}
              className="w-full glass rounded-xl p-4 text-left hover:bg-white/10 transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  ride.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' :
                  ride.status === 'CANCELLED' ? 'bg-red-500/20 text-red-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {ride.status}
                </span>
                <span className="text-primary-400 font-bold">${ride.price}</span>
              </div>
              <p className="text-white text-sm truncate">{ride.originAddress}</p>
              <p className="text-gray-400 text-sm truncate">→ {ride.destinationAddress}</p>
              <p className="text-gray-500 text-xs mt-1">
                {new Date(ride.createdAt).toLocaleDateString('es-ES')}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

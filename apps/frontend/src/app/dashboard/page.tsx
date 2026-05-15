'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const isDriver = user?.role?.name === 'DRIVER';

  return (
    <div className="min-h-screen bg-dark-500 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold">T</span>
            </div>
            <span className="text-xl font-bold text-white">TuTaxi</span>
          </div>
          <button onClick={() => logout()} className="text-gray-400 hover:text-white transition-colors text-sm">
            Cerrar sesión
          </button>
        </div>

        {/* Welcome */}
        <div className="glass rounded-2xl p-8 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Hola, {user?.firstName} 👋</h1>
              <p className="text-gray-400">
                {isDriver ? 'Conductor' : user?.role?.name === 'ADMIN' ? 'Administrador' : 'Pasajero'}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {isDriver ? (
            <>
              <Link href="/driver" className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group border border-primary-500/20">
                <span className="text-3xl">🚗</span>
                <h3 className="text-white font-semibold mt-3 group-hover:text-primary-400 transition-colors">
                  Panel de Conductor
                </h3>
                <p className="text-gray-400 text-sm mt-1">Conectarse y recibir viajes</p>
              </Link>

              <Link href="/history" className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
                <span className="text-3xl">📋</span>
                <h3 className="text-white font-semibold mt-3 group-hover:text-primary-400 transition-colors">
                  Mis Viajes
                </h3>
                <p className="text-gray-400 text-sm mt-1">Historial de viajes realizados</p>
              </Link>
            </>
          ) : (
            <>
              <Link href="/request-ride" className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
                <span className="text-3xl">🚕</span>
                <h3 className="text-white font-semibold mt-3 group-hover:text-primary-400 transition-colors">
                  Solicitar Viaje
                </h3>
                <p className="text-gray-400 text-sm mt-1">Pide un taxi ahora</p>
              </Link>

              <Link href="/history" className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
                <span className="text-3xl">📋</span>
                <h3 className="text-white font-semibold mt-3 group-hover:text-primary-400 transition-colors">
                  Historial
                </h3>
                <p className="text-gray-400 text-sm mt-1">Ver viajes anteriores</p>
              </Link>
            </>
          )}

          <Link href="/profile" className="glass rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <span className="text-3xl">👤</span>
            <h3 className="text-white font-semibold mt-3 group-hover:text-primary-400 transition-colors">
              Mi Perfil
            </h3>
            <p className="text-gray-400 text-sm mt-1">Editar información</p>
          </Link>

          <div className="glass rounded-2xl p-6">
            <span className="text-3xl">📊</span>
            <h3 className="text-white font-semibold mt-3">Estado</h3>
            <p className="text-gray-400 text-sm mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1" />
              {user?.status === 'ACTIVE' ? 'Activo' : 'Pendiente verificación'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useAuthStore } from '@/store/auth.store';
import { useLogout } from '@/hooks/use-auth';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();

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
          <button
            onClick={() => logout()}
            className="text-gray-400 hover:text-white transition-colors text-sm"
          >
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
              <h1 className="text-2xl font-bold text-white">
                Hola, {user?.firstName} 👋
              </h1>
              <p className="text-gray-400">
                {user?.role?.name === 'DRIVER' ? 'Conductor' : user?.role?.name === 'ADMIN' ? 'Administrador' : 'Pasajero'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-6">
            <p className="text-gray-400 text-sm">Estado</p>
            <p className="text-white text-lg font-semibold mt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
              {user?.status === 'ACTIVE' ? 'Activo' : 'Pendiente'}
            </p>
          </div>
          <div className="glass rounded-xl p-6">
            <p className="text-gray-400 text-sm">Rol</p>
            <p className="text-white text-lg font-semibold mt-1">{user?.role?.name}</p>
          </div>
          <div className="glass rounded-xl p-6">
            <p className="text-gray-400 text-sm">Email verificado</p>
            <p className="text-white text-lg font-semibold mt-1">
              {user?.status === 'ACTIVE' ? '✅ Sí' : '⏳ Pendiente'}
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Información de la cuenta</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Email</span>
              <span className="text-white">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Teléfono</span>
              <span className="text-white">{user?.phone || 'No registrado'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Miembro desde</span>
              <span className="text-white">
                {new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long' })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

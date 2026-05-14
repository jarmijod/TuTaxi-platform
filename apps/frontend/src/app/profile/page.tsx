'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth.store';
import { api } from '@/lib/axios';

interface ProfileForm {
  firstName: string;
  lastName: string;
  phone: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated, setUser } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, reset } = useForm<ProfileForm>();

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login');
    if (user) reset({ firstName: user.firstName, lastName: user.lastName, phone: user.phone || '' });
  }, [isAuthenticated, user, router, reset]);

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: (data: ProfileForm) => api.patch('/users/me', data).then((r) => r.data),
    onSuccess: (data) => setUser(data),
  });

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-dark-500 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white">
            ← Volver
          </button>
        </div>

        <div className="glass rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Mi Perfil</h1>
              <p className="text-gray-400">{user?.email}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit((data) => updateProfile(data))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Nombre</label>
                <input
                  {...register('firstName')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Apellido</label>
                <input
                  {...register('lastName')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Teléfono</label>
              <input
                {...register('phone')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="gradient-primary text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

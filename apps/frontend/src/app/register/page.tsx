'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { registerSchema, RegisterFormData } from '@/lib/validations';
import { useRegister } from '@/hooks/use-auth';

export default function RegisterPage() {
  const { mutate: registerUser, isPending, error } = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, phone, ...rest } = data;
    const payload = { ...rest, ...(phone ? { phone } : {}) };
    registerUser(payload);
  };

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-2xl font-bold text-white">TuTaxi</span>
          </Link>
        </div>

        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Crear cuenta</h1>
          <p className="text-gray-400 mb-6">Únete a la plataforma</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">
                {(error as any)?.response?.data?.message || 'Error al registrarse'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Nombre</label>
                <input
                  {...register('firstName')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-400 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">Apellido</label>
                <input
                  {...register('lastName')}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-400 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Email</label>
              <input
                {...register('email')}
                type="email"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Teléfono (opcional)</label>
              <input
                {...register('phone')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="+34 600 000 000"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Contraseña</label>
              <input
                {...register('password')}
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Confirmar contraseña</label>
              <input
                {...register('confirmPassword')}
                type="password"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                placeholder="••••••••"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-1 block">Tipo de cuenta</label>
              <select
                {...register('role')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
              >
                <option value="CLIENT" className="bg-dark-400">Pasajero</option>
                <option value="DRIVER" className="bg-dark-400">Conductor</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            ¿Ya tienes cuenta?{' '}
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

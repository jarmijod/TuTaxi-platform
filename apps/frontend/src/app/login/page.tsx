'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { loginSchema, LoginFormData } from '@/lib/validations';
import { useLogin } from '@/hooks/use-auth';

export default function LoginPage() {
  const { mutate: login, isPending, error } = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = (data: LoginFormData) => login(data);

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-2xl font-bold text-white">TuTaxi</span>
          </Link>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Bienvenido de vuelta</h1>
          <p className="text-gray-400 mb-6">Inicia sesión en tu cuenta</p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-400 text-sm">
                {(error as any)?.response?.data?.message || 'Error al iniciar sesión'}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-primary-400 hover:text-primary-300">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isPending ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

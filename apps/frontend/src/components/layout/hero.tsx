'use client';

import Link from 'next/link';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-950/20 via-dark-500 to-dark-500" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-700/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
        <div className="animate-fade-in">
          <span className="inline-block px-4 py-1.5 rounded-full glass text-primary-400 text-sm font-medium mb-6">
            🚀 La nueva forma de moverte
          </span>

          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Tu viaje, tu{' '}
            <span className="gradient-text">control</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Reserva tu taxi en segundos. Conductores verificados, precios transparentes
            y la tecnología más avanzada para llevarte a donde necesites.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="gradient-primary text-white px-8 py-4 rounded-full text-lg font-semibold hover:opacity-90 transition-all hover:scale-105 animate-glow"
            >
              Solicitar Viaje
            </Link>
            <Link
              href="/register?role=DRIVER"
              className="glass text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/10 transition-all"
            >
              Ser Conductor
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            <div className="text-center">
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-gray-400 text-sm">Viajes diarios</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">5K+</p>
              <p className="text-gray-400 text-sm">Conductores</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-white">4.9</p>
              <p className="text-gray-400 text-sm">Rating</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

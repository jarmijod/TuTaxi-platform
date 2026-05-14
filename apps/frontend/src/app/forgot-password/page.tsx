'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement password reset
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
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
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-white mb-2">Recuperar contraseña</h1>
              <p className="text-gray-400 mb-6">
                Ingresa tu email y te enviaremos instrucciones
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 mb-1 block">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                    placeholder="tu@email.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full gradient-primary text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Enviar instrucciones
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Email enviado</h2>
              <p className="text-gray-400 mb-6">
                Revisa tu bandeja de entrada para restablecer tu contraseña
              </p>
            </div>
          )}

          <p className="text-center text-gray-400 mt-6 text-sm">
            <Link href="/login" className="text-primary-400 hover:text-primary-300 font-medium">
              ← Volver al login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

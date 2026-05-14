'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-white">TuTaxi</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Características
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Precios
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="gradient-primary text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-gray-300 hover:text-white transition-colors px-4 py-2">
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="gradient-primary text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <Link href="/dashboard" className="block text-white py-2 font-medium">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="block text-gray-300 hover:text-white py-2">Iniciar Sesión</Link>
                <Link href="/register" className="block gradient-primary text-white px-6 py-2 rounded-full font-medium mt-2 text-center">
                  Registrarse
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

'use client';

import { useState } from 'react';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">T</span>
            </div>
            <span className="text-xl font-bold text-white">TuTaxi</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">
              Características
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Precios
            </a>
            <a href="#contact" className="text-gray-300 hover:text-white transition-colors">
              Contacto
            </a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="text-gray-300 hover:text-white transition-colors px-4 py-2">
              Iniciar Sesión
            </button>
            <button className="gradient-primary text-white px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity">
              Registrarse
            </button>
          </div>

          <button
            className="md:hidden text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
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
            <a href="#features" className="block text-gray-300 hover:text-white py-2">Características</a>
            <a href="#pricing" className="block text-gray-300 hover:text-white py-2">Precios</a>
            <a href="#contact" className="block text-gray-300 hover:text-white py-2">Contacto</a>
            <button className="w-full gradient-primary text-white px-6 py-2 rounded-full font-medium mt-2">
              Registrarse
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

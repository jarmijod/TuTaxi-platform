const features = [
  {
    icon: '🛡️',
    title: 'Seguridad Total',
    description: 'Conductores verificados, seguimiento en tiempo real y botón de emergencia.',
  },
  {
    icon: '⚡',
    title: 'Ultra Rápido',
    description: 'Encuentra un conductor en menos de 3 minutos, sin importar la hora.',
  },
  {
    icon: '💰',
    title: 'Precios Justos',
    description: 'Tarifas transparentes calculadas antes del viaje. Sin sorpresas.',
  },
  {
    icon: '📱',
    title: 'App Intuitiva',
    description: 'Interfaz moderna y fácil de usar. Reserva en solo 3 toques.',
  },
  {
    icon: '🌍',
    title: 'Cobertura Total',
    description: 'Disponible en toda la ciudad, 24 horas al día, 7 días a la semana.',
  },
  {
    icon: '⭐',
    title: 'Calidad Premium',
    description: 'Vehículos en excelente estado y conductores profesionales.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            ¿Por qué elegir <span className="gradient-text">TuTaxi</span>?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            La plataforma más completa para tus viajes urbanos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group"
            >
              <span className="text-4xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

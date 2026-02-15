
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-red-500 selection:text-white">
      {/* Nav */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="font-bold text-2xl tracking-tighter">Stocky<span className="text-red-500">.</span></div>
        <div className="space-x-4 text-sm font-medium text-gray-400">
          <a href="#features" className="hover:text-white transition-colors">Características</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          <Link href="/demo" className="text-white hover:text-red-400">Ver Demo</Link>
        </div>
      </nav>

      {/* Hero */}
      <header className="text-center pt-20 pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-red-600/20 rounded-full blur-3xl -z-10 opacity-50"></div>
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight tight-shadow text-white">
          Tu stock bajo control,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">tus pedidos en orden.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          La plataforma definitiva para gestionar casas de empanadas, pizzerías y negocios de comida rápida con alta rotación.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/empresa01" className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-red-500/30">
            Probar Cliente
          </Link>
          <Link href="/empresa01/admin" className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm">
            Probar Admin
          </Link>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-800/50 border-t border-gray-700/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            title="Menú QR Digital"
            desc="Tus clientes escanean y piden. Sin instalar nada. Interfaz rápida diseñada para la venta."
          />
          <FeatureCard
            title="Gestión por Docenas"
            desc="Logic de venta específica para empanadas. ½ docenas, docenas enteras y promociones automáticas."
          />
          <FeatureCard
            title="Alertas de Stock"
            desc="El sistema te avisa cuando te quedan menos unidades de una variedad. Nunca digas 'no hay'."
          />
          <FeatureCard
            title="Reportes Excel"
            desc="Cierra la caja tranquilo. Exporta todas tus ventas y movimientos de stock con un solo clic."
          />
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl font-bold text-center mb-16 tracking-tight">Planes Flexibles para tu Negocio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Plan Emprendedor */}
          <div className="bg-gray-800 p-8 rounded-3xl border border-gray-700 hover:border-gray-500 transition-colors">
            <h3 className="text-xl font-bold text-gray-400 mb-2">Plan Emprendedor</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-white">$20</span>
              <span className="text-lg text-gray-400">/mes</span>
            </div>
            <div className="text-sm text-gray-500 mb-6 font-medium">+ $35 USD Setup Inicial</div>

            <ul className="space-y-4 mb-8 text-gray-300 text-sm">
              <li className="flex gap-3 items-center"><span className="text-green-400">✓</span> Menú QR dinámico</li>
              <li className="flex gap-3 items-center"><span className="text-green-400">✓</span> Gestión de stock por docenas</li>
              <li className="flex gap-3 items-center"><span className="text-green-400">✓</span> Panel de control diario</li>
              <li className="flex gap-3 items-center"><span className="text-green-400">✓</span> Soporte por Email</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold border border-white/10 transition-colors">
              Elegir Emprendedor
            </button>
          </div>

          {/* Plan Business */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-3xl border-2 border-red-600 relative shadow-2xl shadow-red-900/20 transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-red-600 px-4 py-1 rounded-bl-xl rounded-tr-2xl text-xs font-bold text-white uppercase tracking-wider">Recomendado</div>
            <h3 className="text-xl font-bold text-red-400 mb-2">Plan Business</h3>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-5xl font-bold text-white">$30</span>
              <span className="text-lg text-gray-400">/mes</span>
            </div>
            <div className="text-sm text-gray-500 mb-6 font-medium">+ $55 USD Setup Inicial</div>

            <ul className="space-y-4 mb-8 text-gray-200 text-sm font-medium">
              <li className="flex gap-3 items-center"><span className="text-red-500">✓</span> Todo lo del Plan Emprendedor</li>
              <li className="flex gap-3 items-center"><span className="text-red-500">✓</span> Reportes con exportación a Excel</li>
              <li className="flex gap-3 items-center"><span className="text-red-500">✓</span> Alertas de stock críticas</li>
              <li className="flex gap-3 items-center"><span className="text-red-500">✓</span> Personalización de colores</li>
              <li className="flex gap-3 items-center"><span className="text-red-500">✓</span> Soporte prioritario por WhatsApp</li>
            </ul>
            <button className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg hover:shadow-red-500/40">
              Obtener Plan Business
            </button>
          </div>

        </div>
      </section>

      <footer className="py-12 text-center text-gray-500 text-sm border-t border-gray-800">
        © 2026 Stocky SaaS. Built for <a href="https://vynex.ar" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors font-bold">VYNEX</a>.
      </footer>
    </div>
  );
}

const FeatureCard = ({ title, desc }: { title: string, desc: string }) => (
  <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-red-500/30 transition-colors group">
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

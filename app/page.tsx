"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { LeadCaptureModal } from '@/components/marketing/LeadCaptureModal';
import { StockyLogo } from '@/components/ui/StockyLogo';
import { Smartphone, LayoutDashboard, ArrowRight, CheckCircle } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [hasLeadCaptured, setHasLeadCaptured] = useState(false);

  // Animation State
  const [showIntro, setShowIntro] = useState(true);
  const [introFading, setIntroFading] = useState(false);

  useEffect(() => {
    // Check if lead was captured previously
    if (typeof window !== 'undefined') {
      const captured = localStorage.getItem('stocky_lead_captured');
      if (captured === 'true') {
        setHasLeadCaptured(true);
      }

      // Start Intro Animation Sequence
      const timer1 = setTimeout(() => {
        setIntroFading(true); // Start fade out
      }, 3500); // 3.5s total animation

      const timer2 = setTimeout(() => {
        setShowIntro(false); // Remove from DOM
      }, 4200); // +0.7s transition

      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, []);

  const handleDemoAccess = () => {
    if (hasLeadCaptured) {
      router.push('/demo');
    } else {
      // Close other modals if open
      setIsClientModalOpen(false);
      setIsAdminModalOpen(false);
      // Open Lead Modal
      setIsLeadModalOpen(true);
    }
  };

  const handleLeadSuccess = () => {
    setIsLeadModalOpen(false);
    setHasLeadCaptured(true);
    router.push('/demo');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans selection:bg-red-500 selection:text-white relative">

      {/* --- INTRO ANIMATION OVERLAY --- */}
      {showIntro && (
        <div
          className={`fixed inset-0 z-[100] bg-gray-900 flex items-center justify-center transition-opacity duration-700 ease-in-out ${introFading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <div className="relative flex items-center justify-center h-32 w-auto">
            <style jsx>{`
                    @keyframes revealSquare {
                        0% { opacity: 0; transform: translateY(20px) scale(0.8); }
                        100% { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    @keyframes slideLeft {
                        0% { transform: translateX(0); }
                        100% { transform: translateX(-90px); }
                    }
                     @keyframes revealText {
                        0% { opacity: 0; transform: translateX(-20px); filter: blur(10px); }
                        100% { opacity: 1; transform: translateX(0); filter: blur(0); }
                    }
                    @keyframes popDot {
                        0% { transform: scale(0); opacity: 0; }
                        50% { transform: scale(1.5); opacity: 1; background-color: white; box-shadow: 0 0 20px white; }
                        100% { transform: scale(1); opacity: 1; background-color: #DC2626; box-shadow: none; }
                    }

                    .sq-1 { animation: revealSquare 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.2s; opacity: 0; }
                    .sq-2 { animation: revealSquare 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.4s; opacity: 0; }
                    .sq-3 { animation: revealSquare 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.6s; opacity: 0; }
                    .sq-4 { animation: revealSquare 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.8s; opacity: 0; }
                    
                    .logo-container {
                        animation: slideLeft 0.8s cubic-bezier(0.25, 1, 0.5, 1) forwards 1.4s;
                    }

                    .text-reveal {
                        animation: revealText 0.8s ease-out forwards 1.6s;
                        opacity: 0;
                    }

                    .dot-reveal {
                        animation: popDot 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards 2.2s;
                        opacity: 0;
                    }
                `}</style>

            {/* Logo Container */}
            <div className="logo-container absolute flex gap-[6px]">
              {/* Left Col */}
              <div className="flex flex-col gap-[6px]">
                <div className="w-[18px] h-[30px] border-[4px] border-red-600 rounded-[6px] sq-1"></div>
                <div className="w-[18px] h-[14px] border-[4px] border-red-600 rounded-[5px] sq-3"></div>
              </div>
              {/* Right Col */}
              <div className="flex flex-col gap-[6px]">
                <div className="w-[18px] h-[14px] border-[4px] border-red-600 rounded-[5px] sq-2"></div>
                <div className="w-[18px] h-[30px] border-[4px] border-red-600 rounded-[6px] sq-4"></div>
              </div>
            </div>

            {/* Text Container */}
            <div className="ml-16 pl-4 flex items-baseline">
              <h1 className="text-6xl font-black tracking-tighter text-white drop-shadow-md text-reveal">
                Stocky
              </h1>
              <div className="w-3 h-3 rounded-full bg-red-600 ml-1 mb-2 dot-reveal"></div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className={`flex justify-between items-center p-6 max-w-7xl mx-auto z-50 relative transition-opacity duration-1000 ${showIntro ? 'opacity-0' : 'opacity-100'}`}>
        <div className="font-bold text-2xl tracking-tighter flex items-center gap-3 group cursor-pointer">
          <div className="bg-gray-800 p-2 rounded-lg group-hover:bg-gray-700 transition-colors border border-gray-700">
            <StockyLogo className="w-6 h-6" />
          </div>
          <span>Stocky<span className="text-red-600">.</span></span>
        </div>
        <div className="space-x-4 text-sm font-medium text-gray-400 flex items-center">
          <a href="#features" className="hover:text-white transition-colors">Características</a>
          <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          <button
            onClick={handleDemoAccess}
            className="text-white hover:text-red-400 font-medium transition-colors"
          >
            Ver Demo
          </button>
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
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={() => setIsClientModalOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105 shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
          >
            <Smartphone size={20} /> Probar Cliente
          </button>
          <button
            onClick={() => setIsAdminModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-8 py-4 rounded-full font-bold text-lg transition-all backdrop-blur-sm flex items-center justify-center gap-2"
          >
            <LayoutDashboard size={20} /> Probar Admin
          </button>
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
            desc="Lógica de venta específica para empanadas. ½ docenas, docenas enteras y promociones automáticas."
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

      {/* --- MODALS --- */}

      <LeadCaptureModal
        isOpen={isLeadModalOpen}
        onClose={() => setIsLeadModalOpen(false)}
        onSuccess={handleLeadSuccess}
      />

      {/* Modal Cliente */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Experiencia para tus Clientes">
        <div className="text-gray-900">
          <div className="mb-6 bg-red-50 p-4 rounded-xl flex items-start gap-3">
            <Smartphone className="text-red-600 shrink-0 mt-1" />
            <p className="text-sm text-gray-700">
              Así es como tus clientes verán tu menú. Una interfaz rápida, limpia y diseñada para que pidan más.
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CheckCircle size={16} className="text-green-500" /> Sin descargar aplicaciones
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CheckCircle size={16} className="text-green-500" /> Cálculo automático de docenas
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CheckCircle size={16} className="text-green-500" /> Carga instantánea con QR
            </li>
          </ul>
          <button
            onClick={handleDemoAccess}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 transition-colors"
          >
            Ver Tour Guiado <ArrowRight size={18} />
          </button>
          <p className="text-center mt-3 text-xs text-gray-400">
            Podrás probar la app interactiva en el siguiente paso.
          </p>
        </div>
      </Modal>

      {/* Modal Admin */}
      <Modal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} title="Panel de Control Dueño">
        <div className="text-gray-900">
          <div className="mb-6 bg-blue-50 p-4 rounded-xl flex items-start gap-3">
            <LayoutDashboard className="text-blue-600 shrink-0 mt-1" />
            <p className="text-sm text-gray-700">
              El centro de comando de tu negocio. Controla todo lo que pasa sin estar en el local.
            </p>
          </div>
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CheckCircle size={16} className="text-green-500" /> Edición de stock y precios en vivo
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CheckCircle size={16} className="text-green-500" /> Reportes de caja y ventas
            </li>
            <li className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <CheckCircle size={16} className="text-green-500" /> Recepción de pedidos en tiempo real
            </li>
          </ul>
          <button
            onClick={handleDemoAccess}
            className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors"
          >
            Ver Tour Guiado <ArrowRight size={18} />
          </button>
        </div>
      </Modal>
    </div>
  );
}

const FeatureCard = ({ title, desc }: { title: string, desc: string }) => (
  <div className="p-6 bg-gray-900 rounded-2xl border border-gray-800 hover:border-red-500/30 transition-colors group">
    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{desc}</p>
  </div>
);

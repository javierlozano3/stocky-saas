"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LayoutDashboard,
    Smartphone,
    ShoppingCart,
    ArrowRight,
    CheckCircle,
    TrendingUp,
    Package,
    Users,
    Bell,
    CreditCard,
    Menu
} from 'lucide-react';
import { StockyLogo } from '@/components/ui/StockyLogo';

export default function DemoPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white font-sans overflow-x-hidden selection:bg-red-500 selection:text-white">
            <nav className="fixed top-0 w-full z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link href="/" className="font-bold text-2xl tracking-tighter hover:scale-105 transition-transform flex items-center gap-2">
                        <StockyLogo className="w-8 h-8" />
                        <span>Stocky<span className="text-red-500">.</span></span>
                    </Link>
                    <Link
                        href="/"
                        className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto space-y-32">

                {/* Header Demo */}
                <div className="text-center max-w-3xl mx-auto mb-20">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
                        El Sistema Operativo de tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Fast Food</span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        Gestiona pedidos en tiempo real, controla tu stock y ofrece una experiencia de compra premium a tus clientes. Todo en uno.
                    </p>
                </div>

                {/* 1. Experiencia Cliente (Animada) */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                <Smartphone size={24} />
                            </span>
                            <span className="text-red-500 font-bold uppercase tracking-wider text-sm">Cliente</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Pedidos Rápidos y Visuales</h2>
                        <ul className="space-y-4 mb-8 text-gray-400 text-lg">
                            <li className="flex gap-4 items-start">
                                <CheckCircle className="text-red-500 shrink-0 mt-1" size={20} />
                                <span>Tus clientes eligen sus empanadas o pizzas favoritas visualmente. 1, 2, 1/2 docenas y docenas se calculan solas.</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <CheckCircle className="text-red-500 shrink-0 mt-1" size={20} />
                                <span>Carrito de compras intuitivo que aumenta el ticket promedio.</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <CheckCircle className="text-red-500 shrink-0 mt-1" size={20} />
                                <span>Sin descargar ninguna app. Escanean QR y listo.</span>
                            </li>
                        </ul>
                        <Link
                            href="/empresademo"
                            className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-white/10"
                        >
                            <Smartphone size={20} /> Probar como Cliente Demo
                        </Link>
                    </div>

                    {/* Animación Telefono */}
                    <div className="relative mx-auto border-gray-800 bg-gray-900 border-[8px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl flex flex-col overflow-hidden">
                        <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[10px] top-[72px] rounded-l-lg"></div>
                        <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[10px] top-[124px] rounded-l-lg"></div>
                        <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[10px] top-[142px] rounded-r-lg"></div>
                        <div className="rounded-[2rem] overflow-hidden w-full h-full bg-gray-50 relative">
                            {/* Simulator Screen */}
                            <div className="bg-white p-4 h-full flex flex-col relative">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="w-8 h-8 bg-gray-100 rounded-full animate-pulse"></div>
                                    <div className="font-bold text-gray-800 text-sm">Demo Food</div>
                                    <Menu size={18} className="text-gray-400" />
                                </div>
                                <div className="space-y-3 flex-1 overflow-visible">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="bg-white border text-black border-gray-100 p-3 rounded-xl shadow-sm relative overflow-hidden group hover:border-red-200 transition-colors">
                                            <div className="flex gap-3">
                                                <div className="w-16 h-16 bg-gray-100 text-gray-300 rounded-lg flex items-center justify-center text-xs font-bold">Foto</div>
                                                <div className="flex-1">
                                                    <div className="h-4 w-24 bg-gray-100 rounded mb-2"></div>
                                                    <div className="h-3 w-12 bg-gray-50 rounded"></div>
                                                </div>
                                                <div className="absolute bottom-3 right-3">
                                                    <button className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Animated Hand/Cursor simulation manually via keyframes? Maybe simpler to just animate cards sliding in */}
                                </div>
                                <div className="bg-red-600 text-white p-4 rounded-xl shadow-lg mt-auto animate-bounce cursor-pointer">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span>Ver Pedido (3)</span>
                                        <span>$4.500</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 2. Experiencia Admin (Animada) */}
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Animación Dashboard */}
                    <div className="order-2 lg:order-1 relative bg-gray-800 rounded-2xl p-4 md:p-8 shadow-2xl border border-gray-700">
                        {/* Fake Dashboard Header */}
                        <div className="flex justify-between items-center mb-8 border-b border-gray-700 pb-4">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-gray-500 text-xs font-mono">admin.stocky.com</div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                                <div className="text-gray-400 text-xs mb-1">Ventas Hoy</div>
                                <div className="text-2xl font-bold text-white flex items-end gap-2">
                                    $145k <TrendingUp size={16} className="text-green-500 mb-1" />
                                </div>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                                <div className="text-gray-400 text-xs mb-1">Pedidos</div>
                                <div className="text-2xl font-bold text-white">24</div>
                            </div>
                            <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600">
                                <div className="text-gray-400 text-xs mb-1">Stock Bajo</div>
                                <div className="text-2xl font-bold text-orange-500 flex items-center gap-2">
                                    2 <span className="text-xs font-normal text-gray-500">items</span>
                                </div>
                            </div>
                        </div>

                        {/* New Order Notification Animation */}
                        <div className="relative bg-white rounded-xl p-4 shadow-lg overflow-hidden mb-4 animate-pulse border-l-4 border-yellow-400">
                            <div className="flex justify-between items-start">
                                <div>
                                    <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full uppercase">Nuevo Pedido</span>
                                    <h4 className="font-bold text-gray-900 mt-2 text-lg">Juan Perez</h4>
                                    <p className="text-sm text-gray-500">3x Carne Suave, 2x Jamón y Queso...</p>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-xl text-gray-900">$5.200</div>
                                    <span className="text-xs text-gray-400">Hace 1 min</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 opacity-50 blur-[1px]">
                            {[1, 2].map(i => (
                                <div key={i} className="bg-gray-700 p-4 rounded-xl flex justify-between items-center">
                                    <div className="h-4 w-32 bg-gray-600 rounded"></div>
                                    <div className="h-4 w-12 bg-gray-600 rounded"></div>
                                </div>
                            ))}
                        </div>

                        {/* Floating Notification Toast */}
                        <div className="absolute top-10 right-10 bg-green-500 text-white p-4 rounded-lg shadow-xl flex items-center gap-3 animate-bounce">
                            <Bell size={20} />
                            <div>
                                <div className="font-bold text-sm">¡Nuevo Pedido!</div>
                                <div className="text-xs opacity-90">+$5.200</div>
                            </div>
                        </div>
                    </div>

                    <div className="order-1 lg:order-2">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <LayoutDashboard size={24} />
                            </span>
                            <span className="text-blue-500 font-bold uppercase tracking-wider text-sm">Admin</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Control Total en Tiempo Real</h2>
                        <ul className="space-y-4 mb-8 text-gray-400 text-lg">
                            <li className="flex gap-4 items-start">
                                <CheckCircle className="text-blue-500 shrink-0 mt-1" size={20} />
                                <span>Recibe pedidos al instante con notificaciones por Whatsapp.</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <CheckCircle className="text-blue-500 shrink-0 mt-1" size={20} />
                                <span>Edita precios y stock en segundos. Si se acaba un sabor, apágalo con un click.</span>
                            </li>
                            <li className="flex gap-4 items-start">
                                <CheckCircle className="text-blue-500 shrink-0 mt-1" size={20} />
                                <span>Métricas clave: ventas del día, ticket promedio y productos más vendidos.</span>
                            </li>
                        </ul>
                        <Link
                            href="/empresademo/admin"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all hover:scale-105 shadow-lg shadow-blue-500/30"
                        >
                            <LayoutDashboard size={20} /> Probar Panel Admin Demo
                        </Link>
                    </div>
                </section>

                {/* CTA Final */}
                <section className="text-center py-20 bg-gray-800/30 rounded-3xl border border-gray-700">
                    <h2 className="text-4xl font-bold mb-6">¿Listo para modernizar tu negocio?</h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Deja de usar papel y lápiz. Pásate al sistema que usan los mejores.
                    </p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <a href="https://wa.me/5492646275291" target="_blank" className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-transform hover:scale-105">
                            Contactar Ventas
                        </a>
                        <Link href="/" className="bg-transparent border border-gray-600 hover:bg-gray-800 text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
                            Volver al Inicio
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}

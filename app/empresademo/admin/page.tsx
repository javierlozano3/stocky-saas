"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Package, Utensils, BarChart, Plus, LayoutDashboard, Search, Clock, Users, X, Menu, DollarSign, CreditCard } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

// Simplified demo orders
const DEMO_ORDERS = [
    {
        id: 'DEMO-802',
        cliente: 'María García',
        telefono: '11 4455 6677',
        items: [
            { id: '1', nombre: 'Jamón y Queso', cantidad: 1.0, precio: 8500 }
        ],
        total: 8500,
        estado: 'Pendiente',
        createdAt: { seconds: Date.now() / 1000 }
    },
    {
        id: 'DEMO-755',
        cliente: 'Carlos Lopez',
        telefono: '11 9988 7766',
        items: [
            { id: '2', nombre: 'Carne Suave', cantidad: 0.5, precio: 9000, precioMedia: 4800 }
        ],
        total: 4800,
        estado: 'PAGADO EFECTIVO',
        createdAt: { seconds: (Date.now() / 1000) - 3600 }
    }
];

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default function AdminDemoPage() {
    const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'reports'>('orders');
    const [orders, setOrders] = useState(DEMO_ORDERS);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
            {/* Banner Demo */}
            <div className="md:hidden bg-gray-900 text-white text-center py-2 px-4 shadow-md sticky top-0 z-50">
                <p className="text-xs font-medium">VERSIÓN DEMO - Datos Ficticios</p>
            </div>

            {/* Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 sticky top-0 h-screen">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <LayoutDashboard className="text-red-600" />
                    <span className="font-bold text-xl tracking-tight text-gray-900">Stocky<span className="text-red-600">.</span> Demo</span>
                </div>

                <nav className="space-y-2">
                    <NavItem icon={<Package size={20} />} label="Pedidos" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                    <NavItem icon={<Utensils size={20} />} label="Inventario" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                    <NavItem icon={<BarChart size={20} />} label="Reportes" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                </nav>

                <div className="mt-auto pt-8 border-t border-gray-100">
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <p className="text-xs text-blue-800 font-bold mb-2">¿Te gusta el panel?</p>
                        <Link href="/" className="text-xs bg-blue-600 text-white px-3 py-2 rounded-lg block text-center hover:bg-blue-700 font-medium">
                            Contratar Stocky
                        </Link>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 capitalize tracking-tight">
                            {activeTab === 'orders' ? 'Pedidos (Demo)' : activeTab === 'inventory' ? 'Inventario (Demo)' : 'Reportes (Demo)'}
                        </h1>
                        <p className="text-sm text-gray-500 font-medium">Panel de Control Simulado</p>
                    </div>
                </header>

                {activeTab === 'orders' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <div key={order.id} className={`group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all border-l-4 flex flex-col relative overflow-hidden ${order.estado === 'Pendiente' ? 'border-l-yellow-400' : 'border-l-green-500'}`}>
                                <div className="flex justify-between items-start mb-4">
                                    <span className="font-mono text-xl text-gray-900 font-black tracking-tighter bg-gray-100 px-2 py-1 rounded">
                                        #{order.id}
                                    </span>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                                        {order.estado}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 mb-1">{order.cliente}</h3>
                                <div className="bg-gray-50 p-3 rounded-lg mb-4 flex-1">
                                    {order.items.map((item, i) => (
                                        <div key={i} className="flex justify-between text-xs py-0.5 border-b border-gray-100 last:border-0">
                                            <span className="font-bold">{item.cantidad}x</span>
                                            <span>{item.nombre}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between items-end">
                                    <div className="font-black text-xl">${order.total.toLocaleString()}</div>
                                    {order.estado === 'Pendiente' && (
                                        <div className="flex gap-2">
                                            <button className="bg-green-100 text-green-700 p-2 rounded-lg hover:bg-green-200">
                                                <DollarSign size={16} />
                                            </button>
                                            <button className="bg-blue-100 text-blue-700 p-2 rounded-lg hover:bg-blue-200">
                                                <CreditCard size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Fake "New Order" card that implies activity */}
                        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center text-gray-400">
                            <Clock className="mb-2 opacity-50" />
                            <p className="font-medium text-sm">Esperando nuevos pedidos...</p>
                            <p className="text-xs mt-1">En la versión real, esto se actualiza solo.</p>
                        </div>
                    </div>
                )}

                {activeTab !== 'orders' && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-400 mb-4">Esta sección es solo una vista previa.</p>
                        <Link href="/" className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black">
                            Volver al Inicio
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}

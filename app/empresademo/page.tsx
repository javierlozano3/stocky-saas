"use client";

import React, { useState, useEffect } from 'react';
import { CartItem, Variety } from '@/types';
import { ShoppingBag, ChevronRight, CheckCircle, LayoutDashboard, Trash2, Smartphone } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

// Demo Data - Simplified to 2 Varieties as requested
const DEMO_VARIETIES: Variety[] = [
    {
        id: 'demo-1',
        nombre: 'Jamón y Queso',
        precio: 8500,
        precioMedia: 4500,
        stock: 12.0,
        categoria: 'Clásicas',
        disponible: true
    },
    {
        id: 'demo-2',
        nombre: 'Carne Suave',
        precio: 9000,
        precioMedia: 4800,
        stock: 5.5,
        categoria: 'Clásicas',
        disponible: true
    }
];

const MenuRow = ({ variety, onAdd, qtyInCart }: { variety: Variety, onAdd: (qty: number) => void, qtyInCart: number }) => {
    return (
        <div className={`p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md ${!variety.disponible || variety.stock <= 0 ? 'opacity-60 grayscale' : ''}`}>
            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{variety.nombre}</h3>
                    {variety.stock <= 5 && <span className="text-[10px] font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Demo Stock: {variety.stock.toFixed(1)}</span>}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                    <span className="text-gray-900 font-bold">${variety.precioMedia}</span> (½ Doc) • <span className="text-gray-900 font-bold">${variety.precio}</span> (1 Doc)
                </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                    onClick={() => onAdd(0.5)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-bold rounded-lg transition-colors active:scale-95 border border-orange-200"
                    disabled={qtyInCart + 0.5 > variety.stock}
                >
                    + ½ Doc
                </button>

                <button
                    onClick={() => onAdd(1.0)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-red-200 transition-colors active:scale-95"
                    disabled={qtyInCart + 1.0 > variety.stock}
                >
                    + 1 Doc
                </button>
            </div>
        </div>
    );
};

export default function EmpresaDemoPage() {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lastOrderCode, setLastOrderCode] = useState('');
    // Local stock state just for the demo session
    const [demoStock, setDemoStock] = useState<Record<string, number>>({
        'demo-1': 12.0,
        'demo-2': 5.5
    });

    const addToCart = (variety: Variety, qtyAddedInDozens: number) => {
        const currentStock = demoStock[variety.id] || 0;

        // Check local demo stock
        const currentInCart = cart.find(i => i.id === variety.id)?.cantidad || 0;
        if (currentInCart + qtyAddedInDozens > currentStock) {
            alert("No hay suficiente stock en esta demo para esa cantidad.");
            return;
        }

        setCart(prev => {
            const existing = prev.find(item => item.id === variety.id);
            if (existing) {
                return prev.map(item =>
                    item.id === variety.id
                        ? { ...item, cantidad: item.cantidad + qtyAddedInDozens }
                        : item
                );
            }
            return [...prev, {
                id: variety.id,
                nombre: variety.nombre,
                cantidad: qtyAddedInDozens,
                precio: variety.precio,
                precioMedia: variety.precioMedia
            }];
        });
    };

    const totalDozens = cart.reduce((acc, item) => acc + item.cantidad, 0);
    const calculateTotal = () => {
        return cart.reduce((acc, item) => {
            const integerDozens = Math.floor(item.cantidad);
            const hasHalf = item.cantidad % 1 >= 0.4;
            return acc + (integerDozens * (item.precio || 0)) + (hasHalf ? (item.precioMedia || 0) : 0);
        }, 0);
    };

    const handleCheckout = () => {
        if (!customerName || !customerPhone) {
            alert("Por favor completa los datos ficticios para la demo");
            return;
        }

        // Simular proceso
        const newCode = `DEMO-${Math.floor(100 + Math.random() * 900)}`;
        setLastOrderCode(newCode);

        // Actualizar stock ficticio
        const newStock = { ...demoStock };
        cart.forEach(item => {
            if (newStock[item.id]) newStock[item.id] -= item.cantidad;
        });
        setDemoStock(newStock);

        setIsCheckoutOpen(false);
        setIsSuccessModalOpen(true);
    };

    return (
        <div className="min-h-screen pb-24 bg-orange-50/30 font-sans">
            {/* Banner Demo */}
            <div className="bg-gray-900 text-white text-center py-2 px-4 shadow-md sticky top-0 z-50">
                <p className="text-xs md:text-sm font-medium flex justify-center items-center gap-2">
                    <Smartphone size={16} className="text-red-500" />
                    Estás navegando una <strong>VERSIÓN DEMO</strong>. Los pedidos no son reales.
                </p>
            </div>

            {/* Header */}
            <header className="text-center py-8 relative">
                <Link href="/demo" className="absolute top-4 left-4 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <LayoutDashboard className="text-red-600" size={20} />
                    <span className="font-bold text-xl tracking-tight text-gray-900">Mandor<span className="text-red-600">.</span> Demo</span>
                </Link>
                <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-red-200">
                    D
                </div>
                <h1 className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                    Empanadas Demo
                </h1>
                <p className="text-gray-500 font-medium mt-1">Simulación de tu futuro negocio</p>
            </header>

            {/* Menu List */}
            <main className="max-w-2xl mx-auto p-4 pt-6 space-y-8">
                <section className="space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <h2 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase border-b-2 border-red-500 pb-1">
                            Clásicas (Demo)
                        </h2>
                        <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="space-y-3">
                        {DEMO_VARIETIES.map(variety => (
                            <MenuRow
                                key={variety.id}
                                variety={{ ...variety, stock: demoStock[variety.id] || 0 }}
                                onAdd={(qty) => addToCart(variety, qty)}
                                qtyInCart={cart.find(item => item.id === variety.id)?.cantidad || 0}
                            />
                        ))}
                    </div>
                </section>

                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                    <h3 className="font-bold text-blue-900 mb-2">¿Te gusta lo que ves?</h3>
                    <p className="text-sm text-blue-700 mb-4">
                        Imagina esto con TU logo, TUS colores y TUS sabores.
                    </p>
                    <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                        Obtener mi propio sitio
                    </Link>
                </div>
            </main>

            {/* Floating Cart */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-40">
                    <div className="max-w-2xl mx-auto flex gap-3 items-stretch">
                        <button
                            onClick={() => setCart([])}
                            className="bg-white text-red-500 border-2 border-red-100 rounded-2xl px-4 shadow-xl flex items-center justify-center hover:bg-red-50 transition-colors active:scale-95"
                        >
                            <Trash2 size={24} />
                        </button>

                        <div className="flex-1 bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform ring-4 ring-orange-100"
                            onClick={() => setIsCheckoutOpen(true)}>
                            <div className="flex items-center gap-3">
                                <div className="bg-gray-800 p-2 rounded-xl">
                                    <ShoppingBag className="text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">
                                        {totalDozens % 1 === 0 ? totalDozens : totalDozens.toFixed(1).replace('.', ',')} Docenas
                                    </p>
                                    <p className="text-xl font-bold tracking-tight">${calculateTotal().toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 font-bold text-orange-400">
                                Finalizar <ChevronRight size={18} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Finalizar Demo">
                <div className="space-y-6">
                    <div className="bg-orange-50 space-y-3 p-4 rounded-xl border border-orange-100">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm border-b border-orange-200/50 pb-2 last:border-0 last:pb-0">
                                <div>
                                    <span className="font-bold text-gray-800">
                                        {item.cantidad}x Docenas
                                    </span>
                                    <span className="text-gray-600 block text-xs">{item.nombre}</span>
                                </div>
                                <span className="font-bold text-gray-900">
                                    ${((Math.floor(item.cantidad) * (item.precio || 0)) + (item.cantidad % 1 >= 0.4 ? (item.precioMedia || 0) : 0)).toLocaleString()}
                                </span>
                            </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 text-lg font-bold border-t border-orange-200">
                            <span>Total Demo</span>
                            <span className="text-red-600">${calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <p className="text-xs text-gray-500 text-center bg-gray-100 p-2 rounded-lg">
                            Ingresa datos ficticios para probar el flujo.
                        </p>
                        <input
                            type="text"
                            value={customerName}
                            onChange={e => setCustomerName(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200"
                            placeholder="Nombre Demo"
                        />
                        <input
                            type="tel"
                            value={customerPhone}
                            onChange={e => setCustomerPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-200"
                            placeholder="Celular Demo"
                        />
                    </div>

                    <Button fullWidth onClick={handleCheckout} className="h-12 text-lg">
                        Simular Pedido
                    </Button>
                </div>
            </Modal>

            {/* Success Modal */}
            <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Pedido Simulado">
                <div className="text-center p-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Funciona!</h2>
                    <p className="text-gray-600 mb-4">
                        En un negocio real, este pedido llegaría instantáneamente al panel de administración y al WhatsApp del dueño.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Link href="/" className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                            Volver al Inicio
                        </Link>
                        <button onClick={() => { setCart([]); setIsSuccessModalOpen(false); }} className="text-sm text-gray-500 hover:text-red-500">
                            Hacer otro pedido de prueba
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

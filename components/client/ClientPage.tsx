
"use client";

import React, { useState, useEffect } from 'react'; // Agregamos useEffect
import { CartItem, Variety } from '@/types';
import { ShoppingBag, ChevronRight, CheckCircle, Loader2, LayoutDashboard } from 'lucide-react'; // Loader para el estado de carga
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { addDoc, doc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

// Updated MenuRow to support dynamic pricing display
const MenuRow = ({ variety, onAdd, qtyInCart }: { variety: Variety, onAdd: (qty: number) => void, qtyInCart: number }) => {
    return (
        <div className={`p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-orange-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:shadow-md ${!variety.disponible || variety.stock <= 0 ? 'opacity-60 grayscale' : ''}`}>

            <div className="flex-1">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-800">{variety.nombre}</h3>
                    {variety.stock <= 2 && variety.disponible && <span className="text-[10px] font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Poco Stock: {variety.stock.toFixed(1)}</span>}
                </div>
                <p className="text-sm text-gray-500 font-medium">
                    <span className="text-gray-900 font-bold">${variety.precioMedia}</span> (½ Doc) • <span className="text-gray-900 font-bold">${variety.precio}</span> (1 Doc)
                </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                    onClick={() => onAdd(0.5)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-text-orange-700 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-bold rounded-lg transition-colors active:scale-95 border border-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!variety.disponible || (qtyInCart + 0.5 > variety.stock)}
                >
                    + ½ Doc
                </button>

                <button
                    onClick={() => onAdd(1.0)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-lg shadow-sm shadow-red-200 transition-colors active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!variety.disponible || (qtyInCart + 1.0 > variety.stock)}
                >
                    + 1 Doc
                </button>
            </div>
        </div>
    );
};


export const ClientPage = ({ negocioId }: { negocioId: string }) => {
    const [variedades, setVariedades] = useState<Variety[]>([]);
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [lastOrderCode, setLastOrderCode] = useState('');

    const [businessConfig, setBusinessConfig] = useState({
        whatsapp: '',
        logoUrl: '',
        abierto: true,
        nombre: '',
        subtitulo: ''
    });

    useEffect(() => {
        // Referencia a: empresas > [negocioId] > productos
        const productosRef = collection(db, 'empresas', negocioId, 'productos');
        const unsub = onSnapshot(doc(db, 'empresas', negocioId), (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setBusinessConfig({
                    whatsapp: data.whatsapp || '',
                    logoUrl: data.logoUrl || '',
                    abierto: data.abierto ?? true,
                    nombre: data.nombre || '',
                    subtitulo: data.subtitulo || ''
                });
            }
        });
        const unsubscribe = onSnapshot(productosRef, (snapshot) => {
            const lista = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    nombre: data.nombre || 'Sin nombre',
                    precio: data.precio || 0,
                    precioMedia: data.precioMedia || (data.precio / 2) + 500,
                    stock: data.stock || 0,
                    disponible: (data.stock || 0) > 0 && data.disponible === true,
                    categoria: data.categoria || 'Clásicas'
                } as Variety;
            });
            setVariedades(lista);
            setLoading(false);
        });

        return () => { unsubscribe(); unsub(); };
    }, [negocioId]);

    const addToCart = (variety: Variety, qtyAddedInDozens: number) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === variety.id);
            if (existing) {
                if (existing.cantidad + qtyAddedInDozens > variety.stock) return prev;
                return prev.map(item =>
                    item.id === variety.id
                        ? { ...item, cantidad: item.cantidad + qtyAddedInDozens }
                        : item
                );
            }
            if (qtyAddedInDozens > variety.stock) return prev;
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
            const remainder = item.cantidad % 1; // Should vary around 0.0 or 0.5
            // Fix floating point issues
            const hasHalf = remainder >= 0.4;

            return acc + (integerDozens * (item.precio || 0)) + (hasHalf ? (item.precioMedia || 0) : 0);
        }, 0);
    };

    const generateShortCode = () => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const randomLetters = letters[Math.floor(Math.random() * letters.length)] + letters[Math.floor(Math.random() * letters.length)];
        const randomNumbers = Math.floor(100 + Math.random() * 900);
        return `${randomLetters}-${randomNumbers}`;
    };

    const handleCheckout = async () => {
        if (!customerName || !customerPhone) {
            alert("Por favor completa tus datos");
            return;
        }

        const orderCode = generateShortCode();
        const total = calculateTotal();

        try {
            const pedidoData = {
                codigo: orderCode,
                cliente: customerName,
                telefono: customerPhone,
                items: cart.map(item => ({
                    id: item.id,
                    nombre: item.nombre,
                    cantidad: item.cantidad
                })),
                total: total,
                estado: 'Pendiente',
                createdAt: serverTimestamp()
            };

            // 1. Guardar en Firebase
            const pedidosRef = collection(db, 'empresas', negocioId, 'pedidos');
            await addDoc(pedidosRef, pedidoData);

            // 2. Descontar Stock
            for (const item of cart) {
                const productoRef = doc(db, 'empresas', negocioId, 'productos', item.id);
                await updateDoc(productoRef, {
                    stock: increment(-item.cantidad)
                });
            }

            // 3. Preparar el modal de éxito
            setLastOrderCode(orderCode);
            setIsCheckoutOpen(false); // Cierra el modal de datos
            setIsSuccessModalOpen(true); // Abre el nuevo modal de éxito

        } catch (error) {
            console.error("Error al procesar pedido:", error);
            alert("Hubo un error al procesar tu pedido. Intenta nuevamente.");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50/30">
                <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Cargando el menú de {negocioId}...</p>
            </div>
        );
    }

    // Agrupamos las variedades por categoría
    const varietiesByCategory = variedades.reduce((acc, variety) => {
        // Ahora 'variety.categoria' ya vendrá con el dato real de Firebase
        const category = variety.categoria || 'Clásicas';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(variety);
        return acc;
    }, {} as Record<string, Variety[]>);

    // Ordenar las categorías para que siempre aparezcan en el mismo orden
    const categories = Object.keys(varietiesByCategory).sort((a, b) => {
        const order: Record<string, number> = { 'Clásicas': 1, 'Gourmet': 2, 'Vegetarianas': 3, 'Especiales': 4 };
        return (order[a] || 99) - (order[b] || 99);
    });

    return (
        <div className="min-h-screen pb-24 bg-orange-50/30 font-sans">
            {/* Header */}
            <header className="text-center py-8 relative">
                <Link href="/" className="absolute top-4 left-4 flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                    <LayoutDashboard className="text-red-600" size={20} />
                    <span className="font-bold text-xl tracking-tight text-gray-900">Stocky<span className="text-red-600">.</span></span>
                </Link>
                {businessConfig.logoUrl ? (
                    <img
                        src={businessConfig.logoUrl}
                        alt="Logo del negocio"
                        className="mx-auto h-20 w-auto mb-4 object-contain"
                    />
                ) : (
                    <div className="w-16 h-16 bg-red-600 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold">
                        {negocioId.charAt(0).toUpperCase()}
                    </div>
                )}
                <h1 className="text-3xl font-black text-gray-900 capitalize tracking-tight">
                    {businessConfig.nombre || negocioId.replace('-', ' ')}
                </h1>
                <p className="text-gray-500 font-medium mt-1">{businessConfig.subtitulo || "Fábrica de Empanadas"}</p>
            </header>

            {/* Menu List */}
            <main className="max-w-2xl mx-auto p-4 pt-6 space-y-8">
                {categories.length > 0 ? (
                    categories.map(category => (
                        <section key={category} className="space-y-4">
                            {/* Título de la Categoría */}
                            <div className="flex items-center gap-3 px-2">
                                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight uppercase border-b-2 border-red-500 pb-1">
                                    {category}
                                </h2>
                                <div className="h-px bg-gray-200 flex-1"></div>
                            </div>

                            {/* Lista de variedades de esta categoría */}
                            <div className="space-y-3">
                                {varietiesByCategory[category].map(variety => (
                                    <MenuRow
                                        key={variety.id}
                                        variety={variety}
                                        onAdd={(qty) => addToCart(variety, qty)}
                                        qtyInCart={cart.find(item => item.id === variety.id)?.cantidad || 0}
                                    />
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-400">
                        No hay variedades disponibles en este momento.
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="text-center py-8 pb-32 text-gray-400 text-xs font-medium">
                <p>© 2026 Powered by <a href="https://vynex.ar" target="_blank" rel="noopener noreferrer" className="font-bold text-gray-500 hover:text-red-500 transition-colors">VYNEX</a></p>
            </footer>

            {/* Floating Cart */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent z-40">
                    <div className="max-w-2xl mx-auto bg-gray-900 text-white rounded-2xl p-4 shadow-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-transform ring-4 ring-orange-100"
                        onClick={() => setIsCheckoutOpen(true)}>
                        <div className="flex items-center gap-3">
                            <div className="bg-gray-800 p-2 rounded-xl">
                                <ShoppingBag className="text-orange-400" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-medium">
                                    {totalDozens % 1 === 0 ? totalDozens : totalDozens.toFixed(1).replace('.', ',')} Docenas en total
                                </p>
                                <p className="text-xl font-bold tracking-tight">${calculateTotal().toLocaleString()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 font-bold text-orange-400">
                            Finalizar <ChevronRight size={18} />
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Tu Pedido">
                <div className="space-y-6">
                    <div className="bg-orange-50 space-y-3 p-4 rounded-xl border border-orange-100">
                        {cart.map((item, idx) => {
                            const integerDozens = Math.floor(item.cantidad);
                            const hasHalf = item.cantidad % 1 >= 0.4;
                            const cost = (integerDozens * (item.precio || 0)) + (hasHalf ? (item.precioMedia || 0) : 0);
                            const formattedQty = item.cantidad % 1 === 0 ? item.cantidad.toString() : item.cantidad.toFixed(1).replace('.', ',');

                            return (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-orange-200/50 pb-2 last:border-0 last:pb-0">
                                    <div>
                                        <span className="font-bold text-gray-800">
                                            {formattedQty} Docenas
                                        </span>
                                        <span className="text-gray-600 block text-xs">{item.nombre}</span>
                                    </div>
                                    <span className="font-bold text-gray-900">
                                        ${cost.toLocaleString()}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="flex justify-between items-center pt-2 text-lg font-bold border-t border-orange-200">
                            <span>Total a Pagar</span>
                            <span className="text-red-600">${calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre para retirar</label>
                            <input
                                type="text"
                                value={customerName}
                                onChange={e => setCustomerName(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                placeholder="Ej: Juan Perez"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Celular</label>
                            <input
                                type="tel"
                                value={customerPhone}
                                onChange={e => setCustomerPhone(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                                placeholder="Ej: 11 1234 5678"
                            />
                        </div>
                    </div>

                    <Button fullWidth onClick={handleCheckout} className="h-12 text-lg">
                        Confirmar Pedido
                    </Button>
                    <p className="text-center text-xs text-gray-400">
                        Al confirmar, se generará un codigo de pedido único.
                    </p>
                </div>
            </Modal>

            {/* Confirm Modal */}
            <Modal
                isOpen={isSuccessModalOpen}
                onClose={() => setIsSuccessModalOpen(false)}
                title="¡Pedido Confirmado!"
            >
                <div className="text-center p-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={40} className="text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">¡Pedido tomado!</h2>
                    <p className="text-gray-600 mb-4">
                        Tu código de pedido es: <span className="font-mono font-bold text-red-600">{lastOrderCode}</span>
                    </p>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 text-sm text-blue-800 text-left">
                        <strong>⚠️ Paso importante:</strong> Envianos el detalle por WhatsApp. <p>Los pedidos se retiran y se pagan en el local</p>
                    </div>

                    <Button
                        fullWidth
                        onClick={() => {
                            // Aquí movemos la lógica de generar el link de WhatsApp
                            const total = calculateTotal();
                            let msg = `*NUEVO PEDIDO: ${lastOrderCode}*\n\n`;
                            msg += `*Cliente:* ${customerName}\n`;
                            msg += `*Items:*\n`;
                            cart.forEach(item => {
                                msg += `- ${item.cantidad} x ${item.nombre}\n`;
                            });
                            msg += `\n*Total: $${total}*`;

                            const whatsappUrl = `https://wa.me/${businessConfig.whatsapp}?text=${encodeURIComponent(msg)}`;
                            window.open(whatsappUrl, '_blank');

                            // Limpiar carrito y cerrar
                            setCart([]);
                            setIsSuccessModalOpen(false);
                        }}
                        className="h-14 bg-green-600 hover:bg-green-700 text-lg font-bold"
                    >
                        Enviar por WhatsApp
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

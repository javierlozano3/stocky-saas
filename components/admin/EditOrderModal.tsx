"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, AlertCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { Order, OrderItem, Variety } from '@/types';

interface Props {
    negocioId: string;
    pedido: Order; // Cambiado de any
    onClose: () => void;
}

export default function EditOrderModal({ negocioId, pedido, onClose }: Props) {
    const [items, setItems] = useState<OrderItem[]>(pedido.items || []);
    const [variedadesDisponibles, setVariedadesDisponibles] = useState<Variety[]>([]); 
    const [precioManual, setPrecioManual] = useState<number>(pedido.total);
    const [motivo, setMotivo] = useState("");

    // Cargar todas las variedades para poder agregar nuevas al pedido
    useEffect(() => {
        const fetchVariedades = async () => {
            const querySnapshot = await getDocs(collection(db, 'empresas', negocioId, 'productos'));
            const lista = querySnapshot.docs.map(doc => ({ 
                id: doc.id, 
                ...doc.data() 
            })) as Variety[]; 
            setVariedadesDisponibles(lista);
        };
        fetchVariedades();
    }, [negocioId]);

    // Calcular precio sugerido basado en las reglas del negocio
    const precioCalculado = items.reduce((acc, item) => {
        const varInfo = variedadesDisponibles.find(v => v.id === item.id || v.nombre === item.nombre);
        if (!varInfo) return acc;
        
        const entero = Math.floor(item.cantidad);
        const tieneMedia = item.cantidad % 1 !== 0;
        const precioDoz = varInfo.precio || 0;
        const precioMedia = (precioDoz / 2) + 500; // Tu lógica de recargo por media
        
        return acc + (entero * precioDoz) + (tieneMedia ? precioMedia : 0);
    }, 0);

    const updateCantidad = (id: string, delta: number) => {
        setItems(prev => prev.map(item => 
            item.id === id ? { ...item, cantidad: Math.max(0, item.cantidad + delta) } : item
        ).filter(item => item.cantidad > 0));
    };

    const handleGuardar = async () => {
        const huboCambioPrecio = precioManual !== precioCalculado;
        if (huboCambioPrecio && !motivo.trim()) {
            return alert("Es obligatorio indicar el motivo por el cambio de precio (Descuento/Ajuste).");
        }

        try {
            const pedidoRef = doc(db, 'empresas', negocioId, 'pedidos', pedido.id);
            await updateDoc(pedidoRef, {
                items: items,
                total: precioManual,
                editado: true
            });

            // Registrar en Auditoría
            await addDoc(collection(db, 'empresas', negocioId, 'auditoria'), {
                tipo: 'MODIFICACION',
                pedidoId: pedido.id,
                motivo: motivo || "Ajuste de cantidades",
                precioAnterior: pedido.total,
                precioNuevo: precioManual,
                fecha: serverTimestamp()
            });

            onClose();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-slate-800 italic">Modificar Pedido</h3>
                        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{pedido.codigo} • {pedido.cliente}</p>
                    </div>
                    <button aria-label="Aumentar cantidad" onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X /></button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto flex-1 space-y-6">
                    <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Variedades en el pedido</p>
                        {items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <span className="font-bold text-slate-700">{item.nombre}</span>
                                <div className="flex items-center gap-4">
                                    <button aria-label="Aumentar cantidad" onClick={() => updateCantidad(item.id, -0.5)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Minus size={16}/></button>
                                    <span className="font-black text-slate-800 w-12 text-center">{item.cantidad.toString().replace('.',',')}</span>
                                    <button aria-label="Aumentar cantidad" onClick={() => updateCantidad(item.id, 0.5)} className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-emerald-500 hover:bg-emerald-50 transition-colors"><Plus size={16}/></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Sección de Precio y Descuento */}
                    <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Precio Calculado</p>
                            <p className="text-2xl font-black text-slate-300 italic">${precioCalculado.toLocaleString()}</p>
                        </div>
                        <div>
                            {/* Cambiamos 'p' por 'label' y lo vinculamos con el id */}
                            <label 
                                htmlFor="edit-precio-manual" 
                                className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 block"
                            >
                                Precio Final (Editable)
                            </label>
                            <input 
                                id="edit-precio-manual" // Agregamos el id
                                type="number" 
                                title="Ajustar el precio final del pedido manualmente" // Requerido por el linter
                                placeholder="0" // Requerido por el linter
                                value={precioManual}
                                onChange={(e) => setPrecioManual(Number(e.target.value))}
                                className="text-3xl font-black text-slate-800 bg-red-50 w-full p-2 rounded-xl outline-none border-b-4 border-red-200"
                            />
                        </div>
                    </div>

                    {/* Motivo de Auditoría */}
                    {(precioManual !== precioCalculado) && (
                        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 animate-pulse">
                            <div className="flex items-center gap-2 text-amber-700 font-black text-xs uppercase mb-2">
                                <AlertCircle size={14}/> Motivo del ajuste obligatorio
                            </div>
                            <textarea 
                                className="w-full p-3 bg-white border border-amber-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400"
                                placeholder="Ej: Se aplicó descuento por ser cliente frecuente..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
                    <button onClick={onClose} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors">Cancelar</button>
                    <button onClick={handleGuardar} className="flex-[2] bg-red-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-red-200 uppercase tracking-widest hover:bg-red-700 active:scale-95 transition-all">Guardar Cambios</button>
                </div>
            </div>
        </div>
    );
}
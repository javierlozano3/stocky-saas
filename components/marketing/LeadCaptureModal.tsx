"use client";

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ArrowRight, Loader2, Rocket } from 'lucide-react';

interface LeadCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const LeadCaptureModal = ({ isOpen, onClose, onSuccess }: LeadCaptureModalProps) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !phone) return;

        setLoading(true);
        try {
            // Guardar en Firestore
            await addDoc(collection(db, 'leads'), {
                name,
                email,
                phone,
                createdAt: serverTimestamp(),
                source: 'demo_request'
            });

            // Guardar flag local para no volver a pedir
            localStorage.setItem('stocky_lead_captured', 'true');

            onSuccess();
        } catch (error) {
            console.error("Error saving lead:", error);
            alert("Hubo un error al procesar tus datos. Por favor intenta nuevamente.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Acceso a la Demo">
            <div className="text-center mb-6">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Rocket className="text-red-600" size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">¡Estás a un paso!</h3>
                <p className="text-gray-500 text-sm">
                    Completa tus datos para acceder a la demostración interactiva completa de Stocky.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                    <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900"
                        placeholder="Tu nombre"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Profesional</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900"
                        placeholder="tu@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Celular</label>
                    <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all text-gray-900"
                        placeholder="Para contactarte"
                    />
                </div>

                <div className="pt-2">
                    <Button
                        fullWidth
                        type="submit"
                        disabled={loading}
                        className="h-14 font-bold text-lg shadow-lg shadow-red-500/30"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>Ver Demo Ahora <ArrowRight size={20} className="ml-2" /></>
                        )}
                    </Button>
                    <p className="text-xs text-center text-gray-400 mt-4">
                        Tus datos están seguros. Solo los usaremos para contactarte sobre Stocky.
                    </p>
                </div>
            </form>
        </Modal>
    );
};

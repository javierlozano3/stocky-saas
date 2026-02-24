'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Lock, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';

export default function SuperAdminLogin() {
    const router = useRouter();
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/superadmin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pin }),
            });

            if (res.ok) {
                router.push('/superadmin');
            } else {
                setError('PIN Incorrecto');
            }
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="bg-slate-900 p-8 text-center border-b border-slate-800">
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                        <ShieldCheck className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Super Admin</h2>
                    <p className="text-slate-400 text-sm mt-1 font-medium">Gestión Avanzada de Entorno</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-xl font-bold text-center flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">
                            PIN de Acceso Maestro
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3.5 text-slate-400" size={18} />
                            <input
                                type="password"
                                value={pin}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-slate-900/10 focus:border-slate-900 transition-all outline-none font-mono text-lg text-slate-900"
                                placeholder="••••••••••••"
                            />
                        </div>
                    </div>

                    <Button fullWidth type="submit" disabled={loading} className="py-4 text-base bg-red-600 hover:bg-red-700 shadow-lg shadow-red-600/20">
                        {loading ? <Loader2 className="animate-spin" /> : 'Acceder al Core'}
                    </Button>
                </form>
            </div>
        </div>
    );
}



"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, updatePassword, User as FirebaseUser } from 'firebase/auth';

interface AdminLoginProps {
    onLogin: (user: FirebaseUser) => void;
    empresaId: string;
}

export const AdminLogin = ({ onLogin, empresaId }: AdminLoginProps) => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');

    const [showPass, setShowPass] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // 1. Intentar Loguear
            const userCredential = await signInWithEmailAndPassword(auth, email, pass);
            const user = userCredential.user;

            // 2. Verificar si es el primer login (aprox) para forzar cambio de clave
            // En un sistema real, esto se maneja con un campo en DB, pero usaremos metadata por ahora
            const isFirstLogin = user.metadata.creationTime === user.metadata.lastSignInTime;

            if (isFirstLogin) {
                setCurrentUser(user);
                setIsChangePasswordMode(true);
                setLoading(false);
            } else {
                onLogin(user);
            }

        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError('Usuario o contraseña incorrectos.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Intenta más tarde.');
            } else {
                setError('Error al iniciar sesión. Verifica tu conexión.');
            }
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPass !== confirmPass) {
            setError("Las contraseñas no coinciden.");
            return;
        }
        if (newPass.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres.");
            return;
        }

        setLoading(true);
        try {
            if (currentUser) {
                await updatePassword(currentUser, newPass);
                alert("Contraseña actualizada correctamente. Por seguridad, inicia sesión con tu nueva clave.");
                setIsChangePasswordMode(false);
                setPass('');
                setNewPass('');
                setConfirmPass('');
                // Forzamos re-login para confirmar que saben la nueva clave
                setCurrentUser(null);
            }
        } catch (err: any) {
            console.error(err);
            setError("Error al actualizar la contraseña: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (isChangePasswordMode) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-yellow-500 p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                            <Lock className="text-white" size={32} />
                        </div>
                        <h2 className="text-2xl font-bold text-white tracking-tight">Cambio de Clave Requerido</h2>
                        <p className="text-yellow-100 text-sm mt-1">Es tu primer ingreso. Por seguridad, define tu clave personal.</p>
                    </div>

                    <form onSubmit={handleChangePassword} className="p-8 space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium text-center flex items-center justify-center gap-2">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Nueva Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={newPass}
                                        onChange={(e) => setNewPass(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Confirmar Contraseña</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        value={confirmPass}
                                        onChange={(e) => setConfirmPass(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all outline-none"
                                        placeholder="Repite la contraseña"
                                    />
                                </div>
                            </div>
                        </div>

                        <Button fullWidth type="submit" disabled={loading} className="h-12 text-lg bg-yellow-600 hover:bg-yellow-700">
                            {loading ? <Loader2 className="animate-spin" /> : 'Guardar y Continuar'}
                        </Button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-red-600 p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm mb-4">
                        <Lock className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Acceso Restringido</h2>
                    <p className="text-red-100 text-sm mt-1">Panel de Administración de {empresaId}</p>
                </div>

                <form onSubmit={handleLogin} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg font-medium text-center animate-pulse flex items-center justify-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Email de Usuario</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                                    placeholder="usuario@empresa.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                <input
                                    type={showPass ? "text" : "password"}
                                    value={pass}
                                    onChange={(e) => setPass(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button fullWidth type="submit" disabled={loading} className="h-12 text-lg">
                        {loading ? <Loader2 className="animate-spin" /> : 'Ingresar al Dashboard'}
                    </Button>

                    <p className="text-center text-xs text-gray-400 mt-4">
                        © 2026 Powered by <a href="https://vynex.ar" target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors font-bold">VYNEX</a>
                    </p>
                </form>
            </div>
        </div>
    );
};

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Lock, LogOut, Users, Plus, ShieldCheck, Mail, Save, X, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [companies, setCompanies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [showNewModal, setShowNewModal] = useState(false);
    const [newComp, setNewComp] = useState({ id: '', name: '', email: '', password: '' });

    const [editingUser, setEditingUser] = useState<any>(null);
    const [editData, setEditData] = useState({ password: '' });

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/superadmin/companies/list');
            if (res.status === 401) {
                router.push('/superadmin/login');
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) setCompanies(data);
        } catch { }
        setLoading(false);
    };

    useEffect(() => {
        fetchCompanies();
    }, []);

    const logout = async () => {
        await fetch('/api/superadmin/auth', { method: 'DELETE' });
        router.push('/superadmin/login');
    };

    const handleCreateCompany = async () => {
        try {
            const res = await fetch('/api/superadmin/companies', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    companyId: newComp.id,
                    companyName: newComp.name,
                    email: newComp.email,
                    password: newComp.password
                })
            });
            if (res.ok) {
                alert('Empresa creada con éxito');
                setShowNewModal(false);
                fetchCompanies();
            } else {
                const err = await res.json();
                alert(err.error || 'Error al crear');
            }
        } catch { }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;
        try {
            const res = await fetch(`/api/superadmin/users/${editingUser.uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: editData.password || undefined })
            });
            if (res.ok) {
                alert('Usuario actualizado');
                setEditingUser(null);
                setEditData({ password: '' });
                fetchCompanies();
            } else {
                alert('Error al actualizar');
            }
        } catch { }
    };

    const handleDeleteUser = async (uid: string) => {
        if (!confirm('¿Seguro que quieres borrar este usuario entero?')) return;
        try {
            await fetch(`/api/superadmin/users/${uid}`, { method: 'DELETE' });
            fetchCompanies();
        } catch { }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Cargando datos de firebase...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 h-screen fixed top-0 left-0 p-6 flex flex-col items-start shadow-2xl z-50">
                <div className="flex items-center gap-3 text-white mb-10 w-full border-b border-slate-800 pb-6">
                    <ShieldCheck size={32} className="text-red-500" />
                    <div>
                        <h2 className="font-bold tracking-wider leading-none">STOCKY</h2>
                        <span className="text-xs text-slate-400 font-medium">SUPER ADMIN</span>
                    </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                    <button className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-800 w-full p-3 rounded-lg transition-colors font-medium">
                        <Users size={18} />
                        Empresas y Cuentas
                    </button>
                </div>

                <button onClick={logout} className="flex items-center gap-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 w-full p-3 rounded-lg transition-colors font-medium mt-auto">
                    <LogOut size={18} />
                    Cerrar Sesión
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-64 p-8">
                <div className="max-w-6xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Gestión de Clientes</h1>
                            <p className="text-slate-500 font-medium">Administra las cuentas de las empresas dadas de alta.</p>
                        </div>
                        <Button onClick={() => setShowNewModal(true)} className="gap-2 bg-slate-900 hover:bg-slate-800 px-6 font-bold shadow-lg shadow-slate-900/20">
                            <Plus size={18} /> Crear Empresa
                        </Button>
                    </div>

                    <div className="grid gap-6">
                        {companies.map((company, index) => (
                            <div key={index} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                                        Empresa ID: <span className="text-red-600 font-mono tracking-wide bg-red-50 px-2 py-0.5 rounded">{company.id}</span>
                                    </h3>
                                    <span className="text-xs font-bold text-slate-500 uppercase">{company.asignedUsers?.length || 0} Usuarios</span>
                                </div>
                                <div className="p-4 overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                            <tr>
                                                <th className="px-4 py-3 font-bold">Email (Login)</th>
                                                <th className="px-4 py-3 font-bold">Nombre Mostrado</th>
                                                <th className="px-4 py-3 font-bold">UID Firebase</th>
                                                <th className="px-4 py-3 font-bold text-right">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {company.asignedUsers?.map((user: any) => (
                                                <tr key={user.uid} className="border-b last:border-0 hover:bg-slate-50/50">
                                                    <td className="px-4 py-3 font-medium text-slate-900">{user.email}</td>
                                                    <td className="px-4 py-3 text-slate-600">{user.displayName || 'Sin nombre'}</td>
                                                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{user.uid}</td>
                                                    <td className="px-4 py-3 text-right">
                                                        <button
                                                            onClick={() => setEditingUser(user)}
                                                            className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg mr-2 font-bold text-xs inline-flex items-center gap-1"
                                                        >
                                                            <Edit size={14} /> Cambiar Clave
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteUser(user.uid)}
                                                            className="text-red-600 hover:text-red-800 p-2 bg-red-50 rounded-lg font-bold text-xs inline-flex items-center gap-1"
                                                        >
                                                            <Trash2 size={14} /> Borrar
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* MODAL CREAR */}
            {showNewModal && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[90]">
                    <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                        <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-900">Crear Nueva Empresa</h3>
                            <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">ID Unico (URL Ej: pizzeria-pepe)</label>
                                <input className="w-full border rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 outline-none"
                                    value={newComp.id} onChange={e => setNewComp({ ...newComp, id: e.target.value })} placeholder="mi-empresa-x" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre Comercial</label>
                                <input className="w-full border rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 outline-none"
                                    value={newComp.name} onChange={e => setNewComp({ ...newComp, name: e.target.value })} placeholder="Pizzería Pepe" />
                            </div>
                            <div className="pt-4 border-t border-slate-100">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email del Admin</label>
                                <input className="w-full border rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 outline-none"
                                    type="email" value={newComp.email} onChange={e => setNewComp({ ...newComp, email: e.target.value })} placeholder="admin@..." />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contraseña provisoria</label>
                                <input className="w-full border rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 outline-none"
                                    type="password" value={newComp.password} onChange={e => setNewComp({ ...newComp, password: e.target.value })} />
                            </div>

                            <Button fullWidth onClick={handleCreateCompany} className="mt-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-500/30">
                                Guardar y Crear
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDITAR USUARIO */}
            {editingUser && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center p-4 z-[90]">
                    <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
                        <div className="p-5 border-b flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-900">Editar Usuario</h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-sm font-bold text-slate-700">{editingUser.email}</p>
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nueva Contraseña (Opcional)</label>
                                <input className="w-full border rounded-lg p-2.5 text-sm bg-slate-50 focus:bg-white focus:ring-2 outline-none"
                                    type="text" value={editData.password} onChange={e => setEditData({ password: e.target.value })} placeholder="Escribir para cambiarla..." />
                            </div>
                            <Button fullWidth onClick={handleUpdateUser} className="mt-4 bg-slate-900 hover:bg-slate-800 py-3 text-white font-bold rounded-xl shadow-lg">
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}



"use client";

import React, { useState, useEffect } from 'react';
import { Order, Variety } from '@/types';
import { Button } from '@/components/ui/Button';
import { Package, Utensils, BarChart, Plus, ToggleLeft, ToggleRight, LayoutDashboard, Search, FileDown, Edit, X, Save, AlertTriangle, Users, Clock, TrendingUp, AlertCircle, DollarSign } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { db, storage } from '@/lib/firebase';
import { deleteDoc, serverTimestamp, addDoc, collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Link from 'next/link';

const NavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${active ? 'bg-red-50 text-red-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

interface FirebaseTimestamp {
    seconds: number;
    nanoseconds: number;
}

// Actualizamos la interfaz localmente o asegúrate de que tu Order la tenga
interface OrderWithTimestamp extends Omit<Order, 'createdAt'> {
    createdAt: FirebaseTimestamp;
}

export const AdminDashboard = ({ negocioId }: { negocioId: string }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'reports' | 'settings'>('orders');
    const [varieties, setVarieties] = useState<Variety[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [orders, setOrders] = useState<OrderWithTimestamp[]>([]);
    const [orderSubTab, setOrderSubTab] = useState<'active' | 'paid' | 'cancelled'>('active');
    const [businessConfig, setBusinessConfig] = useState({
        whatsapp: '',
        logoUrl: '',
        abierto: true,
        nombre: '',
        subtitulo: ''
    });

    // File Upload State
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Modals state
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [selectedOrderForCancel, setSelectedOrderForCancel] = useState<string | null>(null);
    const [cancelReason, setCancelReason] = useState('');

    // Edit Order Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [editReason, setEditReason] = useState('');
    const [varietyToAdd, setVarietyToAdd] = useState<string>('');

    // Inventory Modal State
    const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
    const [editingVariety, setEditingVariety] = useState<Variety | null>(null);
    const [newVariety, setNewVariety] = useState<Partial<Variety>>({ nombre: '', precio: 0, precioMedia: 0, stock: 0, disponible: true, categoria: 'Clásicas' });

    // Stock Audit Modal State
    const [isStockAuditModalOpen, setIsStockAuditModalOpen] = useState(false);
    const [stockAction, setStockAction] = useState<{ id: string, delta: number, current: number } | null>(null);
    const [stockReason, setStockReason] = useState('');
    const [reportPeriod, setReportPeriod] = useState<'today' | 'week' | 'month'>('today');

    const openEditModal = (variety: Variety) => {
        setEditingVariety(variety); // Esto le dice al sistema que estamos EDITANDO, no creando
        setNewVariety({
            nombre: variety.nombre,
            precio: variety.precio,
            precioMedia: variety.precioMedia,
            stock: variety.stock,
            categoria: variety.categoria || 'Clásicas',
            disponible: variety.disponible
        });
        setInventoryModalOpen(true);
    };

    useEffect(() => {
        if (!negocioId || !isAuthenticated) return;

        // Cargar Variedades
        const unsubVar = onSnapshot(collection(db, 'empresas', negocioId, 'productos'), (snap) => {
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as unknown as Variety[];
            setVarieties(list);
        });

        // Cargar Pedidos
        const qOrders = query(collection(db, 'empresas', negocioId, 'pedidos'), orderBy('createdAt', 'desc'));
        const unsubOrders = onSnapshot(qOrders, (snap) => {
            const list = snap.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as unknown as OrderWithTimestamp[];
            setOrders(list);
        });

        const unsubConfig = onSnapshot(doc(db, 'empresas', negocioId), (docSnap) => {
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

        return () => { unsubVar(); unsubOrders(); unsubConfig(); };
    }, [negocioId, isAuthenticated]);



    const calculateTotal = (items: Order['items']) => { // Usamos el tipo real de los items del pedido
        return items.reduce((acc, curr) => {
            const integerDozens = Math.floor(curr.cantidad);
            const hasHalf = curr.cantidad % 1 >= 0.4;

            // Buscamos la info de la variedad para tener el precio fresco
            const vInfo = varieties.find(v => v.id === curr.id);

            // Priorizamos el precio de la base de datos, si no, el que ya traía el item
            const pDocena = vInfo?.precio || curr.precio || 0;
            const pMedia = vInfo?.precioMedia || curr.precioMedia || 0;

            return acc + (integerDozens * pDocena) + (hasHalf ? pMedia : 0);
        }, 0);
    };


    const handleAddItemToOrder = () => {
        if (!editingOrder || !varietyToAdd) return;

        const variety = varieties.find(v => v.id === varietyToAdd);
        if (!variety) return;

        // Check if already exists in order
        const exists = editingOrder.items.find(i => i.id === variety.id);

        let updatedItems = [...editingOrder.items];
        if (exists) {
            // If exists, just increment by 1.0 (or 0.5?) Let's add 0.5 as basic unit
            updatedItems = updatedItems.map(i => i.id === variety.id ? { ...i, quantity: i.cantidad + 0.5 } : i);
        } else {
            // New item, start with 0.5 as safe default or 1.0? Let's do 1.0 Dozen.
            updatedItems.push({
                id: variety.id,
                nombre: variety.nombre,
                cantidad: 1.0,
                precio: variety.precio,
                precioMedia: variety.precioMedia
            });
        }

        // Recalculate Total
        const newTotal = updatedItems.reduce((acc, curr) => {
            const integerDozens = Math.floor(curr.cantidad);
            const hasHalf = curr.cantidad % 1 >= 0.4;
            const pDocena = curr.precio || 0;
            const pMedia = curr.precioMedia || 0;
            return acc + (integerDozens * pDocena) + (hasHalf ? pMedia : 0);
        }, 0);

        setEditingOrder({ ...editingOrder, items: updatedItems, total: newTotal });
        setVarietyToAdd('');
    };


    // --- Orders Logic ---
    const handleStatusChange = async (orderId: string, newStatus: string) => {
        try {
            const orderRef = doc(db, 'empresas', negocioId, 'pedidos', orderId);
            await updateDoc(orderRef, { estado: newStatus });
        } catch (error) {
            console.error("Error actualizando estado:", error);
        }
    };

    const handleSaveEditOrder = async () => {
        if (!editingOrder || !editReason) {
            alert("Debes indicar un motivo para la modificación.");
            return;
        }

        try {
            const orderRef = doc(db, 'empresas', negocioId, 'pedidos', editingOrder.id);
            await updateDoc(orderRef, {
                items: editingOrder.items,
                total: editingOrder.total,
                motivoAudit: `Modificado: ${editReason}`,
                editado: true
            });
            setIsEditModalOpen(false);
            setEditingOrder(null);
            setEditReason('');
        } catch (error) {
            console.error("Error al guardar cambios:", error);
        }
    };

    const handleCancelOrder = async () => {
        if (!selectedOrderForCancel || !cancelReason) return;
        try {
            const orderRef = doc(db, 'empresas', negocioId, 'pedidos', selectedOrderForCancel);
            await updateDoc(orderRef, {
                estado: 'CANCELADO',
                motivoAudit: cancelReason // Usamos el nombre de campo correcto
            });
            setIsCancelModalOpen(false);
            setCancelReason('');
            setSelectedOrderForCancel(null);
        } catch (error) {
            console.error("Error cancelando:", error);
        }
    };

    // ORDENAMIENTO
    const sortedOrders = orders.filter(o => {
        const search = searchQuery.toLowerCase();
        return o.id.toLowerCase().includes(search) || o.cliente.toLowerCase().includes(search);
    }).sort((a, b) => {
        const priority: Record<string, number> = {
            'Pendiente': 3,
            'CANCELADO': 2,
            'PAGADO EFECTIVO': 1,
            'PAGADO TRANSF': 1
        };
        const scoreA = priority[a.estado] || 0;
        const scoreB = priority[b.estado] || 0;

        if (scoreA !== scoreB) return scoreB - scoreA;

        // Acceso seguro al timestamp
        const timeA = (a.createdAt as unknown as FirebaseTimestamp)?.seconds || 0;
        const timeB = (b.createdAt as unknown as FirebaseTimestamp)?.seconds || 0;
        return timeB - timeA;
    });

    // --- Inventory Logic ---
    const toggleAvailability = async (id: string, currentStatus: boolean) => {
        try {
            const productRef = doc(db, 'empresas', negocioId, 'productos', id);
            // Cambiamos el estado al opuesto en la base de datos
            await updateDoc(productRef, { disponible: !currentStatus });
        } catch (error) {
            console.error("Error al cambiar disponibilidad:", error);
        }
    };

    // Esta función ahora solo abre el modal
    const openStockAudit = (id: string, delta: number, currentStock: number) => {
        setStockAction({ id, delta, current: currentStock });
        setIsStockAuditModalOpen(true);
    };

    // Esta función guarda el cambio y el motivo
    const confirmStockUpdate = async () => {
        if (!stockAction || !stockReason) return;

        try {
            const productRef = doc(db, 'empresas', negocioId, 'productos', stockAction.id);
            const newStock = Math.max(0, stockAction.current + stockAction.delta);

            await updateDoc(productRef, {
                stock: newStock,
                ultimaMejoraMotivo: stockReason, // Registro para auditoría
                fechaEdicion: serverTimestamp()
            });

            setIsStockAuditModalOpen(false);
            setStockReason('');
            setStockAction(null);
        } catch (error) {
            console.error("Error en auditoría de stock:", error);
        }
    };

    const handleQuickStockUpdate = async (id: string, delta: number, currentStock: number) => {
        try {
            const productRef = doc(db, 'empresas', negocioId, 'productos', id);
            const newStock = Math.max(0, currentStock + delta);

            await updateDoc(productRef, {
                stock: newStock,
                ultimaMejoraMotivo: 'Actualización rápida',
                fechaEdicion: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating stock:", error);
        }
    };

    const handleSaveVariety = async () => {
        // Validación básica
        if (!newVariety.nombre || !newVariety.precio) {
            alert("El nombre y el precio son obligatorios");
            return;
        }

        try {
            const productosRef = collection(db, 'empresas', negocioId, 'productos');

            if (editingVariety) {
                // Lógica para EDITAR producto existente
                const docRef = doc(db, 'empresas', negocioId, 'productos', editingVariety.id);
                await updateDoc(docRef, {
                    nombre: newVariety.nombre,
                    precio: newVariety.precio,
                    precioMedia: newVariety.precioMedia,
                    stock: newVariety.stock,
                    categoria: newVariety.categoria,
                    disponible: newVariety.disponible
                });
            } else {
                // Lógica para CREAR nuevo producto
                await addDoc(productosRef, {
                    nombre: newVariety.nombre,
                    precio: newVariety.precio,
                    precioMedia: newVariety.precioMedia || (newVariety.precio / 2) + 500,
                    stock: newVariety.stock || 0,
                    categoria: newVariety.categoria || 'Clásicas',
                    disponible: true, // Por defecto habilitado
                    createdAt: serverTimestamp()
                });
            }

            // Limpiar y cerrar
            setInventoryModalOpen(false);
            setEditingVariety(null);
            setNewVariety({ nombre: '', precio: 0, precioMedia: 0, stock: 0, disponible: true, categoria: 'Clásicas' });

        } catch (error) {
            console.error("Error al guardar la variedad:", error);
            alert("No se pudo guardar la variedad. Revisa la consola.");
        }
    };

    const handleDeleteVariety = async (id: string) => {
        if (confirm('¿Seguro quieres eliminar esta variedad permanentemente?')) {
            try {
                const docRef = doc(db, 'empresas', negocioId, 'productos', id);
                await deleteDoc(docRef);
            } catch (error) {
                console.error("Error al eliminar:", error);
            }
        }
    };

    // --- Reports Logic ---
    const downloadReport = () => {
        const paidOrders = orders.filter(o => o.estado.startsWith('PAGADO'));
        if (paidOrders.length === 0) {
            alert("No hay datos para exportar");
            return;
        }

        const reportData = paidOrders.map(order => ({
            Fecha: new Date(order.createdAt.seconds * 1000).toLocaleDateString(),
            Codigo: order.codigo || order.id.slice(0, 5),
            Cliente: order.cliente,
            Total: order.total
        }));

        // Lógica de descarga simplificada
        const csv = "data:text/csv;charset=utf-8,\uFEFF" +
            Object.keys(reportData[0]).join(",") + "\n" +
            reportData.map(r => Object.values(r).join(",")).join("\n");
        window.open(encodeURI(csv));
    };


    useEffect(() => {
        if (!negocioId) return;
        const q = query(
            collection(db, 'empresas', negocioId, 'pedidos'),
            orderBy('createdAt', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const pedidosFirebase = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as unknown as OrderWithTimestamp[];
            setOrders(pedidosFirebase);
        });

        return () => unsubscribe();
    }, [negocioId]);

    if (!isAuthenticated) {
        return <AdminLogin onLogin={() => setIsAuthenticated(true)} empresaId={negocioId} />;
    }

    const generateExcelReport = () => {
        // 1. Filtramos solo los pedidos pagados
        const paidOrders = orders.filter(o =>
            o.estado === 'PAGADO EFECTIVO' || o.estado === 'PAGADO TRANSF'
        );

        if (paidOrders.length === 0) {
            alert("No hay pedidos pagados para exportar en este momento.");
            return;
        }

        // 2. Aplanamos los datos para el formato de tabla (Excel)
        const reportData = paidOrders.map(order => ({
            Fecha: new Date(order.createdAt.seconds * 1000).toLocaleString(),
            Código: order.codigo || order.id.slice(0, 5),
            Cliente: order.cliente,
            Teléfono: order.telefono,
            Método: order.estado.replace('PAGADO ', ''),
            Total: order.total,
            Detalle: order.items.map(i => `${i.cantidad}x ${i.nombre}`).join(', ')
        }));

        // 3. Lógica de descarga (formato CSV compatible con Excel)
        const headers = Object.keys(reportData[0]).join(",");
        const rows = reportData.map(row =>
            Object.values(row).map(value => `"${value}"`).join(",")
        ).join("\n");

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + "\n" + rows;
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `reporte_ventas_${negocioId}_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getFilteredOrders = () => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Calculamos el inicio de la semana correctamente
        const tempDate = new Date(startOfToday);
        const startOfWeek = new Date(tempDate.setDate(tempDate.getDate() - tempDate.getDay()));

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        return orders.filter(order => {
            // Usamos la interfaz OrderWithTimestamp para evitar el error de 'any'
            const orderDate = new Date(order.createdAt.seconds * 1000);
            if (reportPeriod === 'today') return orderDate >= startOfToday;
            if (reportPeriod === 'week') return orderDate >= startOfWeek;
            return orderDate >= startOfMonth;
        });
    };

    const filteredOrders = getFilteredOrders();
    const paidFilteredOrders = filteredOrders.filter(o => o.estado.startsWith('PAGADO'));
    const totalCash = filteredOrders.filter(o => o.estado === 'PAGADO EFECTIVO').reduce((acc, curr) => acc + curr.total, 0);
    const totalTransf = filteredOrders.filter(o => o.estado === 'PAGADO TRANSF').reduce((acc, curr) => acc + curr.total, 0);

    // --- Enhanced Metrics Calculation ---

    // 1. KPIs
    const totalSales = totalCash + totalTransf;
    const orderCount = paidFilteredOrders.length;
    const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;

    // 2. Inventory Logic
    const inventoryValue = varieties.reduce((acc, v) => acc + (v.stock * v.precio), 0);
    const criticalStockVarieties = varieties.filter(v => v.stock <= 2 && v.disponible);

    // Slow Movers Logic: Available, Stock > 3, but Sales in period < 1
    // First, map sales by variety using filtered orders
    const salesByVariety: Record<string, number> = {};
    paidFilteredOrders.forEach(o => o.items.forEach(i => salesByVariety[i.nombre] = (salesByVariety[i.nombre] || 0) + i.cantidad));

    const slowMovers = varieties.filter(v =>
        v.disponible &&
        v.stock > 3 &&
        (!salesByVariety[v.nombre] || salesByVariety[v.nombre] < 1)
    );

    // 3. Peak Hours
    const getPeakHours = () => {
        const hours: Record<number, number> = {};
        paidFilteredOrders.forEach(o => {
            const date = new Date(o.createdAt.seconds * 1000);
            const hour = date.getHours();
            hours[hour] = (hours[hour] || 0) + 1;
        });
        return Object.entries(hours).sort((a, b) => parseInt(a[0]) - parseInt(b[0]));
    };
    const peakHours = getPeakHours();
    const maxHourCount = Math.max(...Object.values(peakHours).map(v => typeof v === 'number' ? v : 0), 1);

    // 4. Top Clients
    const getTopClients = () => {
        const clients: Record<string, { name: string, count: number, total: number }> = {};
        // We use ALL orders for lifetime value, or filtered? 
        // Usually loyalty is lifetime, but let's stick to period for "Desempeño".
        // Actually, user wants "Fidelización... al momento de cobrarle". 
        // For REPORTS, let's show top clients of the PERIOD.
        paidFilteredOrders.forEach(o => {
            const key = o.telefono || o.cliente;
            if (!clients[key]) clients[key] = { name: o.cliente, count: 0, total: 0 };
            clients[key].count += 1;
            clients[key].total += o.total;
        });
        return Object.values(clients).sort((a, b) => b.count - a.count).slice(0, 5);
    };
    const topClients = getTopClients();

    // 1. Obtener ranking de variedades (para los filtros Hoy/Semana/Mes)
    const getVarietyStats = () => {
        const stats: Record<string, number> = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                stats[item.nombre] = (stats[item.nombre] || 0) + item.cantidad;
            });
        });
        // Convertir a array y ordenar de mayor a menor
        return Object.entries(stats)
            .map(([nombre, cantidad]) => ({ nombre, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad);
    };

    // 2. Obtener resumen anual (Top por mes)
    const getAnnualStats = () => {
        const currentYear = new Date().getFullYear();
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        // Filtramos los pagados de todo el año una sola vez
        const paidOrdersThisYear = orders.filter(o =>
            o.estado.startsWith('PAGADO') &&
            new Date(o.createdAt.seconds * 1000).getFullYear() === currentYear
        );
        return months.map((monthName, index) => {
            const monthlyStats: Record<string, number> = {};
            paidOrdersThisYear.forEach(order => {
                const date = new Date(order.createdAt.seconds * 1000);
                if (date.getMonth() === index) {
                    order.items.forEach(item => {
                        monthlyStats[item.nombre] = (monthlyStats[item.nombre] || 0) + item.cantidad;
                    });
                }
            });
            const entries = Object.entries(monthlyStats);
            const top = entries.sort((a, b) => (b[1] as number) - (a[1] as number))[0];

            return {
                mes: monthName,
                variedad: top ? top[0] : '---',
                cantidad: top ? (top[1] as number) : 0
            };
        });
    };

    const varietyRanking = (() => {
        const stats: Record<string, number> = {};
        paidFilteredOrders.forEach(order => {
            order.items.forEach(item => {
                stats[item.nombre] = (stats[item.nombre] || 0) + item.cantidad;
            });
        });
        return Object.entries(stats)
            .map(([nombre, cantidad]) => ({ nombre, cantidad })) // Aquí se convierte en objeto
            .sort((a, b) => b.cantidad - a.cantidad); // CAMBIO: Usar .cantidad en lugar de [1]
    })();

    const annualStats = getAnnualStats();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-white border-r border-gray-200 p-6 flex-shrink-0 sticky top-0 h-auto md:h-screen overflow-y-auto">
                <Link href="/" className="flex items-center gap-2 mb-8 px-2 hover:opacity-80 transition-opacity">
                    <LayoutDashboard className="text-red-600" />
                    <span className="font-bold text-xl tracking-tight text-gray-900">Stocky<span className="text-red-600">.</span></span>
                </Link>

                <nav className="space-y-2">
                    <NavItem icon={<Package size={20} />} label="Pedidos" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} />
                    <NavItem icon={<Utensils size={20} />} label="Inventario" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
                    <NavItem icon={<BarChart size={20} />} label="Reportes" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
                    <NavItem icon={<X size={20} />} label="Ajustes" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
                </nav>

                <div className="mt-auto pt-8 border-t border-gray-100">
                    <div className="bg-gray-50 p-4 rounded-xl flex items-center gap-3">
                        {businessConfig.logoUrl ? (
                            <img src={businessConfig.logoUrl} alt="Logo" className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-200 p-1" />
                        ) : (
                            <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 font-bold text-xs">
                                {negocioId.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="overflow-hidden">
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-0.5">Empresa</p>
                            <p className="font-bold text-gray-900 truncate text-sm">{businessConfig.nombre || negocioId}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsAuthenticated(false)} className="text-xs text-red-500 mt-3 font-medium hover:underline w-full text-left px-4">Cerrar Sesión</button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 capitalize tracking-tight">{activeTab === 'orders' ? 'Pedidos del Día' : activeTab}</h1>
                        <p className="text-sm text-gray-500 font-medium">Panel de Control</p>
                    </div>
                    {activeTab === 'orders' && (
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Buscar por código..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full md:w-64 bg-white border border-gray-200 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                            />
                        </div>
                    )}
                    {activeTab === 'inventory' && (
                        <Button onClick={() => { setEditingVariety(null); setInventoryModalOpen(true); }}>
                            <Plus size={18} className="mr-2" /> Nueva Variedad
                        </Button>
                    )}
                </header>

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        {/* Sub-Tabs for Orders */}
                        <div className="flex bg-gray-100 p-1 rounded-xl w-fit">
                            <button
                                onClick={() => setOrderSubTab('active')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderSubTab === 'active' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Pendientes del Día
                            </button>
                            <button
                                onClick={() => setOrderSubTab('paid')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderSubTab === 'paid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Historial Pagados
                            </button>
                            <button
                                onClick={() => setOrderSubTab('cancelled')}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${orderSubTab === 'cancelled' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                    }`}
                            >
                                Cancelados
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedOrders
                                .filter(order => {
                                    if (orderSubTab === 'active') return order.estado === 'Pendiente';
                                    if (orderSubTab === 'paid') return order.estado.startsWith('PAGADO');
                                    if (orderSubTab === 'cancelled') return order.estado === 'CANCELADO';
                                    return true;
                                })
                                .map(order => {
                                    const clientOrderCount = orders.filter(o => (o.telefono && o.telefono === order.telefono) || o.cliente === order.cliente).length;
                                    const isLoyal = clientOrderCount >= 3;

                                    return (
                                        <div key={order.codigo || order.id.slice(0, 5)} className={`group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all border-l-4 flex flex-col ${order.estado === 'CANCELADO' ? 'border-l-gray-400 opacity-60' : order.estado === 'Pendiente' ? 'border-l-yellow-400' : 'border-l-green-500'}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-mono text-xs text-gray-400 font-bold bg-gray-50 px-2 py-1 rounded"> {order.codigo || order.id.slice(0, 5)} </span>
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700' :
                                                    order.estado === 'CANCELADO' ? 'bg-gray-100 text-gray-500' :
                                                        'bg-green-100 text-green-700'
                                                    }`}>
                                                    {order.estado.replace('-', ' ')}
                                                </span>
                                            </div>
                                            <h3 className="font-bold text-lg text-gray-900 mb-1 flex items-center gap-2">
                                                {order.cliente}
                                                {isLoyal && (
                                                    <span title={`Cliente Fiel (${clientOrderCount} pedidos)`} className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 border border-yellow-200">
                                                        <Users size={10} /> Fiel
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-xs text-gray-500 mb-4 font-medium">📞 {order.telefono}</p>

                                            {/* Order Summary Compact */}
                                            <div className="bg-gray-50 p-3 rounded-lg mb-4 flex-1">
                                                {order.items.map((item, i) => (
                                                    <div key={i} className="flex justify-between text-xs py-0.5 border-b border-gray-100 last:border-0 last:pb-0">
                                                        <span className="text-gray-700 font-medium">
                                                            {item.cantidad % 1 === 0 ? item.cantidad : item.cantidad.toFixed(1).replace('.', ',')}x {item.nombre}
                                                        </span>
                                                    </div>
                                                ))}
                                                {order.motivoAudit && (
                                                    <div className="mt-2 text-[10px] italic text-red-500 bg-red-50 p-1 rounded">
                                                        Nota: {order.motivoAudit}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-between items-end pt-2 border-t border-gray-50">
                                                <div>
                                                    <span className="text-xs text-gray-400 font-semibold uppercase">Total</span>
                                                    <div className="text-xl font-bold text-gray-900">${order.total.toLocaleString()}</div>
                                                </div>
                                                {order.estado !== 'CANCELADO' && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => { setEditingOrder(order); setIsEditModalOpen(true); }}
                                                            className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-xs font-bold"
                                                        >
                                                            Modificar
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {order.estado === 'CANCELADO' ? (
                                                <div className="mt-4 pt-3 border-t border-gray-100">
                                                    <button
                                                        onClick={() => handleStatusChange(order.id, 'Pendiente')}
                                                        className="w-full py-2 bg-orange-50 text-orange-600 rounded-lg text-xs font-bold uppercase hover:bg-orange-100 transition-colors border border-orange-200 flex items-center justify-center gap-2"
                                                    >
                                                        <Plus size={14} /> Reactivar
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100">
                                                    <button onClick={() => handleStatusChange(order.id, 'Pendiente')} className={`py-1.5 rounded-lg text-[10px] font-bold uppercase ${order.estado === 'Pendiente' ? 'bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300' : 'bg-gray-50 text-gray-400 hover:bg-yellow-50'}`}>Pendiente</button>
                                                    <button onClick={() => handleStatusChange(order.id, 'PAGADO EFECTIVO')} className={`py-1.5 rounded-lg text-[10px] font-bold uppercase ${order.estado === 'PAGADO EFECTIVO' ? 'bg-green-100 text-green-700 ring-1 ring-green-300' : 'bg-gray-50 text-gray-400 hover:bg-green-50'}`}>Efectivo</button>
                                                    <button onClick={() => handleStatusChange(order.id, 'PAGADO TRANSF')} className={`py-1.5 rounded-lg text-[10px] font-bold uppercase ${order.estado === 'PAGADO TRANSF' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300' : 'bg-gray-50 text-gray-400 hover:bg-blue-50'}`}>Transf</button>
                                                </div>
                                            )}

                                            {order.estado !== 'CANCELADO' && (
                                                <button
                                                    onClick={() => { setSelectedOrderForCancel(order.id); setIsCancelModalOpen(true); }}
                                                    className="w-full mt-2 py-1 text-xs text-red-300 hover:text-red-500 font-medium"
                                                >
                                                    Cancelar Pedido
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Variedad</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-center">Estado</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Precios (Doz/Med)</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Stock (Docenas)</th>
                                    <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {varieties.map(variety => (
                                    <tr key={variety.id}
                                        className={`hover:bg-gray-50/50 transition-colors ${variety.stock <= 0 ? 'bg-red-50' :
                                            variety.stock <= 2 ? 'bg-orange-50' :
                                                ''
                                            }`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {variety.stock <= 2.0 && variety.disponible && (
                                                    <span title="Stock Bajo">
                                                        <AlertTriangle size={16} className="text-red-500 animate-pulse" />
                                                    </span>
                                                )}
                                                <div>
                                                    <div className="font-bold text-gray-900">{variety.nombre}</div>
                                                    <div className="text-xs text-gray-500 font-medium">{variety.categoria}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button onClick={() => toggleAvailability(variety.id, variety.disponible)}>
                                                {variety.disponible ? <ToggleRight className="text-green-500" size={32} /> : <ToggleLeft className="text-gray-300" size={32} />}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-gray-700 text-sm">
                                            ${variety.precio} / ${variety.precioMedia}
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono font-medium text-gray-700">
                                            {variety.stock.toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleQuickStockUpdate(variety.id, -1, variety.stock)}
                                                    className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 font-bold text-sm transition-colors"
                                                >
                                                    -1
                                                </button>
                                                <button
                                                    onClick={() => handleQuickStockUpdate(variety.id, 1, variety.stock)}
                                                    className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 font-bold text-sm transition-colors"
                                                >
                                                    +1
                                                </button>
                                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                                <button
                                                    aria-label="Editar variedad"
                                                    onClick={() => openEditModal(variety)}
                                                    className="p-2 text-gray-400 hover:text-blue-600"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    aria-label="Eliminar variedad"
                                                    onClick={() => handleDeleteVariety(variety.id)}
                                                    className="p-2 text-gray-400 hover:text-red-600"
                                                >
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'reports' && (
                    <div className="space-y-8 pb-12 max-w-7xl mx-auto">

                        {/* Header & Controls */}
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl border border-gray-100 shadow-sm gap-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BarChart className="text-red-600" /> Reporte de Rendimiento
                            </h2>
                            <div className="flex gap-2">
                                {(['today', 'week', 'month'] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => setReportPeriod(period)}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all capitalize ${reportPeriod === period ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        {period === 'today' ? 'Hoy' : period === 'week' ? 'Semana' : 'Mes'}
                                    </button>
                                ))}
                                <Button onClick={downloadReport} className="bg-green-600 hover:bg-green-700 ml-2">
                                    <FileDown size={18} />
                                </Button>
                            </div>
                        </div>

                        {/* 1. KPIs Section */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ventas Totales</span>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="p-3 bg-green-50 rounded-xl text-green-600"><DollarSign size={24} /></div>
                                    <span className="text-3xl font-black text-gray-900">${totalSales.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Ticket Promedio</span>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="p-3 bg-blue-50 rounded-xl text-blue-600"><TrendingUp size={24} /></div>
                                    <span className="text-3xl font-black text-gray-900">${avgTicket.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Volumen Pedidos</span>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="p-3 bg-orange-50 rounded-xl text-orange-600"><Package size={24} /></div>
                                    <span className="text-3xl font-black text-gray-900">{orderCount}</span>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Valor Inventario</span>
                                <div className="flex items-center gap-3 mt-auto">
                                    <div className="p-3 bg-purple-50 rounded-xl text-purple-600"><Utensils size={24} /></div>
                                    <span className="text-3xl font-black text-gray-900">${inventoryValue.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. Charts Row */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Ranking */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Utensils size={18} className="text-red-500" /> Ranking de Variedades
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
                                    {varietyRanking.slice(0, 10).map((item, idx) => {
                                        const max = varietyRanking[0]?.cantidad || 1;
                                        return (
                                            <div key={item.nombre} className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold">
                                                    <span className="flex items-center gap-2">
                                                        <span className="text-gray-400 w-4">#{idx + 1}</span>
                                                        {item.nombre}
                                                    </span>
                                                    <span className="text-gray-900">{item.cantidad} doc.</span>
                                                </div>
                                                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${(item.cantidad / max) * 100}%` }}></div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Peak Hours */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Clock size={18} className="text-orange-500" /> Horarios Pico
                                </h3>
                                <div className="flex items-end justify-between h-48 gap-1">
                                    {peakHours.map(([hour, count]) => (
                                        <div key={hour} className="flex-1 flex flex-col items-center group">
                                            <div
                                                className="w-full bg-orange-200 rounded-t-sm group-hover:bg-orange-400 transition-colors"
                                                style={{ height: `${(count / maxHourCount) * 100}%` }}
                                            ></div>
                                            <span className="text-[10px] text-gray-400 mt-1">{hour}h</span>
                                        </div>
                                    ))}
                                    {peakHours.length === 0 && <p className="text-center text-gray-400 text-sm w-full self-center">Sin datos aún</p>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Analysis Row */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                            {/* Stock Crítico */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle size={18} className="text-red-500" /> Stock Crítico (≤ 2)
                                </h3>
                                <div className="space-y-3">
                                    {criticalStockVarieties.length > 0 ? criticalStockVarieties.map(v => (
                                        <div key={v.id} className="flex justify-between items-center p-3 bg-red-50 rounded-xl border border-red-100">
                                            <span className="font-medium text-red-900">{v.nombre}</span>
                                            <span className="font-bold text-red-600 bg-white px-2 py-1 rounded-lg text-xs">{v.stock.toFixed(1)} doc</span>
                                        </div>
                                    )) : (
                                        <p className="text-sm text-green-600 font-medium bg-green-50 p-3 rounded-xl border border-green-100 text-center">¡Todo en orden! 👍</p>
                                    )}
                                </div>
                            </div>

                            {/* Slow Movers */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <AlertCircle size={18} className="text-yellow-500" /> Baja Rotación
                                </h3>
                                <p className="text-xs text-gray-400 mb-4">Stock alto ({'>'}3) pero sin ventas en este periodo.</p>
                                <div className="space-y-2">
                                    {slowMovers.slice(0, 5).map(v => (
                                        <div key={v.id} className="flex justify-between text-sm p-2 hover:bg-gray-50 rounded-lg">
                                            <span className="text-gray-600">{v.nombre}</span>
                                            <span className="text-gray-900 font-medium">{v.stock} doc.</span>
                                        </div>
                                    ))}
                                    {slowMovers.length === 0 && <p className="text-sm text-gray-400 italic">No se detectaron productos estancados.</p>}
                                </div>
                            </div>

                            {/* Top Clients */}
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Users size={18} className="text-blue-500" /> Clientes Fieles
                                </h3>
                                <div className="space-y-4">
                                    {topClients.map((client, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {idx + 1}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-gray-800 truncate">{client.name}</p>
                                                <p className="text-xs text-blue-500 font-medium">{client.count} pedidos</p>
                                            </div>
                                            <div className="text-xs font-bold text-gray-900">${client.total.toLocaleString()}</div>
                                        </div>
                                    ))}
                                    {topClients.length === 0 && <p className="text-sm text-gray-400 italic">Sin datos de clientes aún.</p>}
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-2xl bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">Configuración del Negocio</h2>

                            <div className="space-y-6">
                                {/* 1. WhatsApp */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">WhatsApp de Pedidos</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Ej: 5491112345678"
                                            className="flex-1 border border-gray-200 rounded-lg p-3 font-mono text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            value={businessConfig.whatsapp}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, whatsapp: e.target.value })}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 mt-2">Incluye el código de país sin guiones ni espacios.</p>
                                </div>

                                {/* 2. Identidad */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Nombre del Negocio</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Empanadas Don Pepe"
                                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            value={businessConfig.nombre}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, nombre: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Slogan / Subtítulo</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Las mejores de la zona"
                                            className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            value={businessConfig.subtitulo}
                                            onChange={(e) => setBusinessConfig({ ...businessConfig, subtitulo: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* 3. Logo Upload */}
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 border-dashed">
                                    <label className="block text-sm font-bold text-gray-700 mb-4">Logo del Negocio</label>
                                    <div className="flex items-center gap-6">
                                        <div className="w-24 h-24 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center justify-center overflow-hidden relative group">
                                            {logoFile ? (
                                                <img src={URL.createObjectURL(logoFile)} alt="Preview" className="w-full h-full object-contain p-2" />
                                            ) : businessConfig.logoUrl ? (
                                                <img src={businessConfig.logoUrl} alt="Logo" className="w-full h-full object-contain p-2" />
                                            ) : (
                                                <span className="text-xs text-gray-300 font-bold uppercase">Sin Logo</span>
                                            )}
                                        </div>

                                        <div className="flex-1">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setLogoFile(e.target.files[0]);
                                                    }
                                                }}
                                                className="block w-full text-sm text-gray-500
                                                    file:mr-4 file:py-2.5 file:px-6
                                                    file:rounded-full file:border-0
                                                    file:text-sm file:font-semibold
                                                    file:bg-white file:text-red-600
                                                    file:border-red-100 file:border
                                                    hover:file:bg-red-50
                                                    cursor-pointer
                                                "
                                            />
                                            <p className="text-xs text-gray-400 mt-2">Formatos: PNG, JPG (Max 2MB)</p>

                                            {uploadProgress > 0 && uploadProgress < 100 && (
                                                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                                                    <div className="bg-red-600 h-1.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. Estado */}
                                <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Estado del Local</h3>
                                        <p className="text-xs text-gray-500">{businessConfig.abierto ? 'Recibiendo pedidos normalmente' : 'Local cerrado por el momento'}</p>
                                    </div>
                                    <button
                                        onClick={() => setBusinessConfig({ ...businessConfig, abierto: !businessConfig.abierto })}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold transition-colors ${businessConfig.abierto ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                                    >
                                        {businessConfig.abierto ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                                        {businessConfig.abierto ? 'Abierto' : 'Cerrado'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100">
                            <Button
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        let finalLogoUrl = businessConfig.logoUrl;

                                        // 1. Upload Logo if selected
                                        if (logoFile) {
                                            if (logoFile.size > 5 * 1024 * 1024) {
                                                alert("El archivo es demasiado grande (Max 5MB)");
                                                setIsSaving(false);
                                                return;
                                            }

                                            // Create a unique file name
                                            const fileName = `logos/${negocioId}/${Date.now()}_${logoFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                                            const storageRef = ref(storage, fileName);

                                            // Simple upload
                                            // @ts-ignore
                                            const { uploadBytes } = await import('firebase/storage');
                                            await uploadBytes(storageRef, logoFile);

                                            // Get the URL
                                            finalLogoUrl = await getDownloadURL(storageRef);
                                            console.log("Logo uploaded successfully:", finalLogoUrl);
                                        }

                                        // 2. Update Firestore
                                        await updateDoc(doc(db, 'empresas', negocioId), {
                                            whatsapp: businessConfig.whatsapp,
                                            nombre: businessConfig.nombre,
                                            subtitulo: businessConfig.subtitulo,
                                            logoUrl: finalLogoUrl,
                                            abierto: businessConfig.abierto,
                                            updatedAt: serverTimestamp()
                                        });

                                        setLogoFile(null);
                                        setUploadProgress(0);
                                        setBusinessConfig(prev => ({ ...prev, logoUrl: finalLogoUrl }));
                                        alert('¡Configuración actualizada con éxito!');
                                    } catch (error) {
                                        console.error("Error updating config:", error);
                                        alert("Hubo un error al guardar. Revisa la consola.");
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-gray-200 transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Guardando...
                                    </>
                                ) : (
                                    <>
                                        <Save size={18} className="mr-2" /> Guardar Cambios
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </main>

            {/* Cancel Order Modal */}
            <Modal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Cancelar Pedido">
                <div className="space-y-4">
                    <p className="text-gray-600">Por favor indica el motivo de cancelación para el pedido <b>{selectedOrderForCancel}</b>.</p>
                    <textarea
                        className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none"
                        rows={3}
                        placeholder="Ej: Cliente no responde, falta de stock..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setIsCancelModalOpen(false)}>Volver</Button>
                        <Button onClick={handleCancelOrder} className="bg-red-600 hover:bg-red-700">Confirmar Cancelación</Button>
                    </div>
                </div>
            </Modal>

            {/* Edit Order Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modificar Pedido">
                {editingOrder && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 max-h-[40vh] overflow-y-auto">
                            <h4 className="font-bold text-sm text-gray-700 mb-2">Items del Pedido</h4>
                            {editingOrder.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm border-b border-gray-200 pb-3 mb-2 last:mb-0 last:border-0 last:pb-0">
                                    <span className="font-medium text-gray-800">{item.nombre}</span>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const updatedItems = editingOrder.items
                                                    .map((item, i) => i === idx ? { ...item, cantidad: item.cantidad - 0.5 } : item)
                                                    .filter(item => item.cantidad > 0); // ELIMINA SI ES 0

                                                setEditingOrder({
                                                    ...editingOrder,
                                                    items: updatedItems,
                                                    total: calculateTotal(updatedItems)
                                                });
                                            }}
                                            className="w-8 h-8 flex items-center justify-center bg-gray-200 rounded-lg"
                                        > - </button>
                                        <div className="w-16 text-center font-bold text-lg">
                                            {item.cantidad % 1 === 0 ? item.cantidad : item.cantidad.toFixed(1).replace('.', ',')}
                                            <span className="text-[10px] text-gray-400 block -mt-1 uppercase">Doc</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const updatedItems = editingOrder.items.map((item, i) =>
                                                    i === idx ? { ...item, cantidad: item.cantidad + 0.5 } : item
                                                );
                                                setEditingOrder({
                                                    ...editingOrder,
                                                    items: updatedItems,
                                                    total: calculateTotal(updatedItems)
                                                });
                                            }}
                                            className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg"
                                        > + </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div>
                            {/* Vinculamos el label con el id del select usando htmlFor */}
                            <label htmlFor="select-variedad" className="block text-sm font-medium text-gray-700 mb-2">
                                Agregar Item
                            </label>
                            <div className="flex gap-2">
                                <select
                                    id="select-variedad" // Agregamos el id
                                    title="Seleccionar variedad para agregar al pedido" // Agregamos el title para el Linter
                                    className="flex-1 border border-gray-200 rounded-lg p-2 text-sm"
                                    value={varietyToAdd}
                                    onChange={(e) => setVarietyToAdd(e.target.value)}
                                >
                                    <option value="">Seleccionar variedad...</option>
                                    {varieties.map(v => (
                                        <option key={v.id} value={v.id}>
                                            {v.nombre} ({editingOrder.items.find(i => i.id === v.id) ? 'Incluido' : 'Nuevo'})
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    size="sm"
                                    onClick={handleAddItemToOrder}
                                    disabled={!varietyToAdd}
                                    className="whitespace-nowrap"
                                >
                                    <Plus size={16} className="mr-1" /> Agregar
                                </Button>
                            </div>
                        </div>

                        <div>
                            {/* Vinculamos el label con el input usando htmlFor */}
                            <label htmlFor="precio-manual" className="block text-sm font-medium text-gray-700 mb-1">
                                Precio Final (Manual)
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-bold" aria-hidden="true">$</span>
                                <input
                                    id="precio-manual" // Agregamos el id
                                    type="number"
                                    title="Ajustar precio final del pedido" // Atributo solicitado por el Linter
                                    placeholder="0" // Atributo solicitado por el Linter
                                    value={editingOrder.total}
                                    onChange={(e) => setEditingOrder({ ...editingOrder, total: Number(e.target.value) })}
                                    className="w-full border border-gray-200 rounded-lg p-2 pl-7 font-bold text-red-600 text-lg outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <p className="text-xs text-gray-400 mt-1">El total se recalcula al cambiar items. Puedes editarlo manualmente si es necesario.</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del Ajuste <span className="text-red-500">*</span></label>
                            <textarea
                                className="w-full border border-gray-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                rows={2}
                                placeholder="Debes indicar por qué modificaste el pedido..."
                                value={editReason}
                                onChange={(e) => setEditReason(e.target.value)}
                            />
                        </div>

                        <div className="pt-2 flex justify-end gap-2 border-t border-gray-100 mt-4">
                            <Button variant="secondary" onClick={() => setIsEditModalOpen(false)}>Cancelar</Button>
                            <Button
                                onClick={handleSaveEditOrder}
                                disabled={!editReason.trim()} // Require reason
                                className={`transition-all ${!editReason.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 transform'}`}
                            >
                                Guardar Cambios
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Inventory Modal */}
            <Modal isOpen={inventoryModalOpen} onClose={() => setInventoryModalOpen(false)} title={editingVariety ? "Editar Variedad" : "Nueva Variedad"}>
                <div className="space-y-4">
                    {/* Campo Nombre */}
                    <div>
                        <label htmlFor="inv-nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                        <input
                            id="inv-nombre"
                            type="text"
                            title="Nombre de la variedad"
                            placeholder="Ej: Carne Suave"
                            className="w-full border border-gray-200 rounded-lg p-2"
                            value={newVariety.nombre}
                            onChange={e => setNewVariety({ ...newVariety, nombre: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Precio Docena */}
                        <div>
                            <label htmlFor="inv-precio" className="block text-sm font-medium text-gray-700 mb-1">Precio Docena</label>
                            <input
                                id="inv-precio"
                                type="number"
                                title="Precio por docena"
                                placeholder="0"
                                className="w-full border border-gray-200 rounded-lg p-2"
                                value={newVariety.precio}
                                onChange={e => setNewVariety({ ...newVariety, precio: Number(e.target.value) })}
                            />
                        </div>
                        {/* Precio Media */}
                        <div>
                            <label htmlFor="inv-precio-media" className="block text-sm font-medium text-gray-700 mb-1">Precio ½ Docena</label>
                            <input
                                id="inv-precio-media"
                                type="number"
                                title="Precio por media docena"
                                placeholder="0"
                                className="w-full border border-gray-200 rounded-lg p-2"
                                value={newVariety.precioMedia}
                                onChange={e => setNewVariety({ ...newVariety, precioMedia: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Stock */}
                        <div>
                            <label htmlFor="inv-stock" className="block text-sm font-medium text-gray-700 mb-1">Stock (Docenas)</label>
                            <input
                                id="inv-stock"
                                type="number"
                                step="0.5"
                                title="Cantidad de stock disponible"
                                placeholder="0.0"
                                className="w-full border border-gray-200 rounded-lg p-2"
                                value={newVariety.stock}
                                onChange={e => setNewVariety({ ...newVariety, stock: Number(e.target.value) })}
                            />
                        </div>
                        {/* Categoría */}
                        <div>
                            <label htmlFor="inv-categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                            <select
                                id="inv-categoria"
                                title="Seleccionar categoría de producto"
                                className="w-full border border-gray-200 rounded-lg p-2"
                                value={newVariety.categoria}
                                onChange={e => setNewVariety({ ...newVariety, categoria: e.target.value })}
                            >
                                <option value="Clásicas">Clásicas</option>
                                <option value="Gourmet">Gourmet</option>
                                <option value="Vegetarianas">Vegetarianas</option>
                                <option value="Especiales">Especiales</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="secondary" onClick={() => setInventoryModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSaveVariety}><Save size={16} className="mr-2" /> Guardar</Button>
                    </div>
                </div>
            </Modal>

            {/* Stock Audit Modal */}
            <Modal isOpen={isStockAuditModalOpen} onClose={() => setIsStockAuditModalOpen(false)} title="Confirmar Ajuste de Stock">
                <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                        {stockAction && (
                            <>
                                Vas a {stockAction.delta > 0 ? 'sumar' : 'restar'} <b>{Math.abs(stockAction.delta)}</b> docenas.
                            </>
                        )}
                    </p>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo del ajuste</label>
                        <select
                            id="stock-audit-reason" // Opcional pero recomendado
                            title="Motivo del ajuste de stock" // Esto soluciona el error
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm"
                            value={stockReason}
                            onChange={(e) => setStockReason(e.target.value)}
                        >
                            <option value="">Seleccionar motivo...</option>
                            <option value="Ingreso de producción">Ingreso de producción</option>
                            <option value="Ajuste por desperdicio">Ajuste por desperdicio</option>
                            <option value="Corrección de inventario">Corrección de inventario</option>
                            <option value="Venta manual / Fuera de sistema">Venta manual</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="secondary" onClick={() => setIsStockAuditModalOpen(false)}>Cancelar</Button>
                        <Button onClick={confirmStockUpdate} disabled={!stockReason} className="bg-blue-600">Confirmar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { getSuperAdminSession } from '@/lib/auth';

// Crear una empresa y un usuario administrador inicial
export async function POST(request: Request) {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const { companyId, email, password, companyName } = body;

        if (!companyId || !email || !password) {
            return NextResponse.json({ error: 'Faltan datos requeridos (companyId, email, password)' }, { status: 400 });
        }

        // 1. Crear usuario en Firebase Auth usando la API Admin
        // Asi no interrumpe la sesion actual del cliente web que esta usando la pagina
        const userRecord = await adminAuth.createUser({
            email: email,
            password: password,
            displayName: `Admin de ${companyName || companyId}`,
        });

        // 2. Crear las colecciones y docs iniciales en Firestore para esta empresa
        // Esto define que el usuario si existe y a cual empresa pertenece
        const docRef = adminDb.collection('empresas').doc(companyId);

        await docRef.set({
            config: {
                nombre: companyName || companyId,
                nombreTitular: 'Dueño',
                whatsapp: '',
                instagram: '',
                mensajeBienvenida: '¡Bienvenido a nuestro local!',
                aliasMP: '',
                cvuMP: '',
                cbuBank: '',
                shippingCost: 0,
                minimumOrder: 0,
                deliveryDelay: 45,
                pickupDelay: 30,
                isShopOpen: false,
                themeColor: '#ff0000',
                bannerUrl: '',
                logoUrl: '',
                address: '',
            }
        });

        // 3. Crear array iniciales y categorias vacías 
        const categoriasRef = docRef.collection('categorias');
        await categoriasRef.add({ id: 'cat-general', name: 'General', order: 0 });

        // 4. Configurar custom claims para ese usuario (le dice a firebase que rol tiene)
        await adminAuth.setCustomUserClaims(userRecord.uid, {
            empresaId: companyId,
            role: 'admin'  // Para Stocky-SAAS la app frontend espera role admin a nivel empresa
        });

        return NextResponse.json({ ok: true, uid: userRecord.uid });

    } catch (e: any) {
        console.error('Error creating company:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

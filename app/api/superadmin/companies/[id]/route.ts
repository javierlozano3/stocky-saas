import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { getSuperAdminSession } from '@/lib/auth';

// PATCH: Actualizar nombre o pausar/despausar
export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const { name, paused } = body;

        const docRef = adminDb.collection('empresas').doc(id);
        const updateData: any = {};

        if (typeof name === 'string') {
            updateData['config.nombre'] = name;
        }
        if (typeof paused === 'boolean') {
            updateData['config.paused'] = paused;
        }

        if (Object.keys(updateData).length > 0) {
            await docRef.update(updateData);
        }

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// DELETE: Eliminar empresa y sus subcolecciones, y todos sus usuarios
export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        // Borrar usuarios vinculados
        const usersResult = await adminAuth.listUsers(1000);
        const usersToDelete = usersResult.users.filter((u: any) => u.customClaims?.empresaId === id);
        if (usersToDelete.length > 0) {
            await adminAuth.deleteUsers(usersToDelete.map(u => u.uid));
        }

        // Borrar documento de empresa y categorias
        const docRef = adminDb.collection('empresas').doc(id);
        const catRef = await docRef.collection('categorias').get();
        const prodRef = await docRef.collection('productos').get();
        const ordRef = await docRef.collection('pedidos').get();

        const batch = adminDb.batch();
        catRef.forEach(doc => batch.delete(doc.ref));
        prodRef.forEach(doc => batch.delete(doc.ref));
        ordRef.forEach(doc => batch.delete(doc.ref));

        batch.delete(docRef);
        await batch.commit();

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { getSuperAdminSession } from '@/lib/auth';

// CAMBIAR CLAVE DE USUARIO INDIVIDUAL O SUSPENDER
export async function PATCH(request: Request, props: { params: Promise<{ uid: string }> }) {
    const params = await props.params;
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const { password, disabled, empresaId } = body;
        const updateData: any = {};

        if (password) {
            updateData.password = password;
        }

        if (typeof disabled === 'boolean') {
            updateData.disabled = disabled;
        }

        // Si se cambia la empresa, actualizamos claims
        if (empresaId) {
            await adminAuth.setCustomUserClaims(params.uid, {
                empresaId: empresaId,
                role: 'admin'
            });
        }

        await adminAuth.updateUser(params.uid, updateData);

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

// ELIMINAR USUARIO POR COMPLETO
export async function DELETE(request: Request, props: { params: Promise<{ uid: string }> }) {
    const params = await props.params;
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        await adminAuth.deleteUser(params.uid);
        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

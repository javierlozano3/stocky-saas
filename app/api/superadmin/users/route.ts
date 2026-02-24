import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { getSuperAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        const body = await request.json();
        const { empresaId, email, password, displayName } = body;

        if (!empresaId || !email || !password) {
            return NextResponse.json({ error: 'Faltan datos' }, { status: 400 });
        }

        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: displayName || `Admin de ${empresaId}`
        });

        await adminAuth.setCustomUserClaims(userRecord.uid, {
            empresaId,
            role: 'admin'
        });

        return NextResponse.json({ ok: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';
import { createSuperAdminSession, clearSuperAdminSession } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { pin } = body;

        // ESTE ES EL PIN PRINCIPAL PARA ENTRAR A \superadmin
        if (pin === 'jaLoza(/)o79') {
            await createSuperAdminSession({ role: 'SUPERADMIN' });
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    } catch {
        return NextResponse.json({ error: 'Error' }, { status: 500 });
    }
}

export async function DELETE() {
    await clearSuperAdminSession();
    return NextResponse.json({ ok: true });
}

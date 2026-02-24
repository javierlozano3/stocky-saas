import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { getSuperAdminSession } from '@/lib/auth';

// OBTENER TODOS LOS USUARIOS Y SUS EMPRESAS PARA EL DASHBOARD SUPERADMIN
export async function GET() {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        const listUsersResult = await adminAuth.listUsers(1000);

        const users = listUsersResult.users.map(user => {
            const claims = user.customClaims as any;
            return {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                creationTime: user.metadata.creationTime,
                lastSignInTime: user.metadata.lastSignInTime,
                disabled: user.disabled,
                // Extraer a que empresa esta vinculado
                empresaId: claims?.empresaId || 'Sin asignar',
                role: claims?.role || 'user'
            };
        });

        // Agrupar por empresa
        const companiesInfo: any = {};

        users.forEach(u => {
            if (!companiesInfo[u.empresaId]) {
                companiesInfo[u.empresaId] = { id: u.empresaId, asignedUsers: [] };
            }
            companiesInfo[u.empresaId].asignedUsers.push(u);
        });

        const formattedCompanies = Object.values(companiesInfo);

        return NextResponse.json(formattedCompanies);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

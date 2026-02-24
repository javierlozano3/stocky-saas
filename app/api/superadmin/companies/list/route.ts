import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin';
import { getSuperAdminSession } from '@/lib/auth';

// OBTENER TODOS LOS USUARIOS Y SUS EMPRESAS PARA EL DASHBOARD SUPERADMIN
export async function GET() {
    const session = await getSuperAdminSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

    try {
        const [listUsersResult, empresasSnapshot] = await Promise.all([
            adminAuth.listUsers(1000),
            adminDb.collection('empresas').get()
        ]);

        const dbCompanies: any = {};
        empresasSnapshot.forEach(doc => {
            const data = doc.data();
            dbCompanies[doc.id] = {
                name: data.config?.nombre || doc.id,
                paused: !!data.config?.paused,
            };
        });

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

        // Primero asegurarnos que existan las empresas de la base de datos, incluso si no tienen usuarios
        Object.keys(dbCompanies).forEach(empresaId => {
            companiesInfo[empresaId] = {
                id: empresaId,
                name: dbCompanies[empresaId].name,
                paused: dbCompanies[empresaId].paused,
                asignedUsers: []
            };
        });

        users.forEach(u => {
            if (!companiesInfo[u.empresaId]) {
                companiesInfo[u.empresaId] = {
                    id: u.empresaId,
                    name: dbCompanies[u.empresaId]?.name || 'Sin nombre DB',
                    paused: dbCompanies[u.empresaId]?.paused || false,
                    asignedUsers: []
                };
            }
            companiesInfo[u.empresaId].asignedUsers.push(u);
        });

        const formattedCompanies = Object.values(companiesInfo);

        return NextResponse.json(formattedCompanies);
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

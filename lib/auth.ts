import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'stocky-superadmin-secret-dev-only'
);

export type SessionPayload = {
    role: string;
};

export async function getSuperAdminSession(req?: NextRequest): Promise<SessionPayload | null> {
    const cookieStore = await cookies();
    const token = req
        ? req.cookies.get('stocky_sa_session')?.value
        : cookieStore.get('stocky_sa_session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as SessionPayload;
    } catch {
        return null;
    }
}

export async function createSuperAdminSession(payload: SessionPayload) {
    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('8h')
        .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set('stocky_sa_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8 // 8 hours
    });

    return token;
}

export async function clearSuperAdminSession() {
    const cookieStore = await cookies();
    cookieStore.delete('stocky_sa_session');
}

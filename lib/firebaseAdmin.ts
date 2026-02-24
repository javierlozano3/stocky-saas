import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

function initFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        // En ambiente de Vercel Build (fase de "Collecting page data"),
        // a veces esta variable no está presente y lanza error rompiendo el build.
        // Hacemos un log en lugar de un throw para que pase el Build de NextJS.
        console.warn('Missing FIREBASE_SERVICE_ACCOUNT environment variable during init.');

        // Inicializacion vacia para evitar error duro si se llama
        return admin.initializeApp({});
    }

    let serviceAccount;
    try {
        const saText = process.env.FIREBASE_SERVICE_ACCOUNT;
        serviceAccount = JSON.parse(saText);
    } catch (e) {
        console.error('Invalid JSON format for FIREBASE_SERVICE_ACCOUNT');
        return admin.initializeApp({});
    }

    return admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const app = initFirebaseAdmin();

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

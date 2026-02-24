import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        throw new Error('Missing FIREBASE_SERVICE_ACCOUNT environment variable');
    }

    let serviceAccount;
    try {
        // Podría venir escapado en produccion
        const saText = process.env.FIREBASE_SERVICE_ACCOUNT;
        serviceAccount = JSON.parse(saText);
    } catch (e) {
        throw new Error('Invalid JSON format for FIREBASE_SERVICE_ACCOUNT. Note: do not wrap the json with quotes if using .env locally.');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

export const adminAuth = getAuth();
export const adminDb = getFirestore();

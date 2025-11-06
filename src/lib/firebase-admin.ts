// Firebase Admin SDK for server-side operations
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import serviceAccount from '../../firebase-service-account.json';

// Initialize Firebase Admin (server-side only)
if (getApps().length === 0) {
  initializeApp({
    credential: cert(serviceAccount as any),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
  });
}

const adminDb = getFirestore();
const adminStorage = getStorage();

export { adminDb, adminStorage };

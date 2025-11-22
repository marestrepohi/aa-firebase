import * as admin from 'firebase-admin';

import * as admin from 'firebase-admin';
import * as serviceAccount from '../../firebase-service-account.json';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as any),
            databaseURL: "https://augusta-edge-project.firebaseio.com"
        });
        console.log('Firebase Admin initialized with service account');
    } catch (error) {
        console.warn('Failed to initialize with service account, falling back to default credentials', error);
        admin.initializeApp();
    }
}

export const db = admin.firestore();

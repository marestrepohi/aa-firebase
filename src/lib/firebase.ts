// Firebase configuration for client-side
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDxkgZvcAb25XleRDy6jB-k17lBegxn8gM",
  authDomain: "augusta-edge-project.firebaseapp.com",
  projectId: "augusta-edge-project",
  storageBucket: "augusta-edge-project.firebasestorage.app",
  messagingSenderId: "294010717824",
  appId: "1:294010717824:web:03757f0965075af54c0865"
};

// Initialize Firebase (client-side)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };

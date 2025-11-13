'use client';
import type { Metric } from './types';
import { db } from './firebase'; // Using client-side firebase instance
import { collection, getDocs, doc, setDoc, getDoc, query, orderBy } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export async function getMetrics(entityId: string, useCaseId: string) {
    const metricsCollectionRef = collection(db, 'entities', entityId, 'useCases', useCaseId, 'metrics');
    try {
        const metricsSnapshot = await getDocs(metricsCollectionRef);
        if (metricsSnapshot.empty) {
            return null;
        }
        const metricsData = metricsSnapshot.docs[0].data();
        return {
            general: metricsData.general || [],
            financial: metricsData.financial || [],
            business: metricsData.business || [],
            technical: metricsData.technical || [],
        };
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: metricsCollectionRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        throw serverError;
    }
}

export async function getMetricsPeriods(
  entityId: string,
  useCaseId: string
): Promise<Array<{ period: string }>> {
  const metricsCollectionRef = collection(db, 'entities', entityId, 'useCases', useCaseId, 'metrics');
  try {
    const snapshot = await getDocs(metricsCollectionRef);
    return snapshot.docs.map(doc => ({ period: doc.id, ...doc.data() }));
  } catch (serverError: any) {
    if (serverError.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
            path: metricsCollectionRef.path,
            operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
    }
    return [];
  }
}

export function saveMetrics(data: {
  entityId: string;
  useCaseId: string;
  period: string;
  metrics: {
    financial: Metric[];
    business: Metric[];
    technical: Metric[];
  };
}) {
  const { entityId, useCaseId, period, metrics } = data;
  const docRef = doc(db, 'entities', entityId, 'useCases', useCaseId, 'metrics', period);
  setDoc(docRef, { ...metrics, period }, { merge: true })
    .catch(async (serverError) => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: { ...metrics, period },
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
}

export function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
}) {
  const docRef = doc(db, 'entities', data.id);
  setDoc(docRef, data, { merge: true })
    .catch(async (serverError) => {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: docRef.path,
                operation: 'update',
                requestResourceData: data,
            });
            errorEmitter.emit('permission-error', permissionError);
        }
    });
}

export function updateUseCase(data: {
  entityId: string;
  id: string;
  [key: string]: any;
}) {
    const { entityId, id, ...useCaseData } = data;
    const docRef = doc(db, 'entities', entityId, 'useCases', id);
    setDoc(docRef, useCaseData, { merge: true })
      .catch(async (serverError) => {
          if (serverError.code === 'permission-denied') {
              const permissionError = new FirestorePermissionError({
                  path: docRef.path,
                  operation: 'update',
                  requestResourceData: useCaseData,
              });
              errorEmitter.emit('permission-error', permissionError);
          }
      });
}


export async function getUseCaseHistory(entityId: string, useCaseId: string): Promise<any[]> {
    const historyCollectionRef = collection(db, 'entities', entityId, 'useCases', useCaseId, 'history');
    try {
        const historyQuery = query(historyCollectionRef, orderBy('versionedAt', 'desc'));
        const snapshot = await getDocs(historyQuery);
        return snapshot.docs.map(doc => ({ versionId: doc.id, ...doc.data() }));
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: historyCollectionRef.path,
                operation: 'list',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        return [];
    }
}


export async function revertUseCaseVersion(
  entityId: string, 
  useCaseId: string, 
  versionId: string
): Promise<{success: boolean, error?: string}> {
    const historyDocRef = doc(db, 'entities', entityId, 'useCases', useCaseId, 'history', versionId);
    try {
        const historyDoc = await getDoc(historyDocRef);

        if (!historyDoc.exists()) {
            throw new Error("Version not found");
        }

        const useCaseRef = doc(db, 'entities', entityId, 'useCases', useCaseId);
        const versionData = historyDoc.data();
        const { versionedAt, ...revertData } = versionData;

        await setDoc(useCaseRef, revertData, { merge: true });

        return { success: true };
    } catch (serverError: any) {
        if (serverError.code === 'permission-denied') {
            const permissionError = new FirestorePermissionError({
                path: historyDocRef.path,
                operation: 'get',
            });
            errorEmitter.emit('permission-error', permissionError);
        }
        return { success: false, error: serverError.message };
    }
}

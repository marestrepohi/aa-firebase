'use client';
import {
  getFirestore,
  doc,
  collection,
  setDoc,
  getDocs,
  serverTimestamp,
  runTransaction
} from 'firebase/firestore';
import type { Metric } from './types';
import { db } from './firebase'; // Using client-side initialized firebase
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getFunctions, httpsCallable } from 'firebase/functions';

export async function getMetricsPeriods(
  entityId: string,
  useCaseId: string
): Promise<Array<{ period: string }>> {
  try {
    const metricsSnapshot = await getDocs(
      collection(db, 'entities', entityId, 'useCases', useCaseId, 'metrics')
    );
    const periods = metricsSnapshot.docs.map((doc) => ({
      period: doc.id,
      ...doc.data(),
    })).sort((a,b) => b.period.localeCompare(a.period));
    return periods as Array<{ period: string }>;
  } catch(e: any) {
    errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: `entities/${entityId}/useCases/${useCaseId}/metrics`,
        operation: 'list',
    }));
    return [];
  }
}

export async function saveMetrics(data: {
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
  const metricsRef = doc(
    db,
    'entities',
    entityId,
    'useCases',
    useCaseId,
    'metrics',
    period
  );
  
  const saveData = {
      period,
      ...metrics,
      updatedAt: serverTimestamp(),
  };

  return setDoc(metricsRef, saveData, { merge: true }).then(() => true)
    .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: metricsRef.path,
            operation: 'write',
            requestResourceData: saveData,
        }));
        return false;
    });
}

export async function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
}) {
  const entityRef = doc(db, 'entities', data.id);
  const updateData: Record<string, any> = { ...data, updatedAt: serverTimestamp() };

  return setDoc(entityRef, updateData, { merge: true }).then(() => true)
    .catch((error) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: entityRef.path,
            operation: 'write',
            requestResourceData: updateData,
        }));
        return false;
    });
}

export async function updateUseCase(data: {
  entityId: string;
  id: string;
  [key: string]: any;
}) {
    const { entityId, id, ...useCaseData } = data;
    const useCaseRef = doc(db, 'entities', entityId, 'useCases', id);
    const historyRef = collection(useCaseRef, 'history');
    
    const timestamp = new Date();
    const versionId = timestamp.toISOString();

    const updateData = { 
        ...useCaseData, 
        updatedAt: serverTimestamp()
    };

    try {
        await runTransaction(db, async (transaction) => {
            const currentDoc = await transaction.get(useCaseRef);
            if (currentDoc.exists()) {
                const historyData = {
                    ...currentDoc.data(),
                    versionedAt: timestamp,
                };
                transaction.set(doc(historyRef, versionId), historyData);
            }
            transaction.set(useCaseRef, updateData, { merge: true });
        });
        return true;
    } catch (error: any) {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: useCaseRef.path,
            operation: 'write',
            requestResourceData: updateData,
        }));
        return false;
    }
}


export async function revertUseCaseVersion(
  entityId: string, 
  useCaseId: string, 
  versionId: string
): Promise<{success: boolean, error?: string}> {
  const functions = getFunctions(db.app, 'us-central1');
  const revertUseCase = httpsCallable(functions, 'revertUseCaseVersion');
  try {
    const result = await revertUseCase({ entityId, useCaseId, versionId });
    const data = result.data as { success: boolean, error?: string };
    return data;
  } catch (error: any) {
    console.error("Error calling revertUseCaseVersion function:", error);
    return { success: false, error: error.message };
  }
}

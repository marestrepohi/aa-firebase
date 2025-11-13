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
import type { Metric, UseCase } from './types';
import { db } from './firebase'; // Using client-side initialized firebase
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getFunctions, httpsCallable } from 'firebase/functions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/augusta-edge-project/us-central1';

async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
    const defaultOptions: RequestInit = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}/${endpoint}`, defaultOptions);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Request failed with status ' + response.status }));
            throw new Error(errorData.error || 'API request failed');
        }
        return await response.json();
    } catch (error: any) {
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
            console.error('Network error or CORS issue. Ensure the API is running and accessible.');
            errorEmitter.emit('permission-error', new Error(`Failed to fetch from API endpoint: ${endpoint}. Details: ${error.message}`));
        } else {
             errorEmitter.emit('permission-error', new Error(`API Error on ${endpoint}: ${error.message}`));
        }
        // Return a consistent error structure for other failures
        return { success: false, error: error.message };
    }
}


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
  const result = await fetchFromAPI('saveMetrics', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.success;
}

export async function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
}) {
  const result = await fetchFromAPI('updateEntity', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return result.success;
}


export async function updateUseCase(data: Partial<UseCase> & { entityId: string; id: string; }): Promise<boolean> {
    const result = await fetchFromAPI('updateUseCase', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return result.success;
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

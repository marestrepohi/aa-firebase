'use client';
import {
  collection,
  getDocs,
} from 'firebase/firestore';
import type { UseCase } from './types';
import { db } from './firebase'; // Using client-side initialized firebase
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { getFunctions, httpsCallable } from 'firebase/functions';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5001/augusta-edge-project/us-central1';

async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const finalEndpoint = `${API_URL}/${endpoint}`;

  try {
    const response = await fetch(finalEndpoint, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: `Request to ${endpoint} failed with status ${response.status}` }));
      throw new Error(errorData.error || `API request to ${endpoint} failed`);
    }
    return await response.json();
  } catch (error: any) {
    let errorMessage = `Failed to fetch from API endpoint: ${endpoint}. Details: ${error.message}`;

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error or CORS issue. Please check console and ensure the API is running and accessible.';
    }

    console.error("API Fetch Error:", errorMessage, "Full URL:", finalEndpoint);
    errorEmitter.emit('permission-error', new Error(errorMessage));

    return { success: false, error: errorMessage };
  }
}

export async function getMetricsPeriods(
  entityId: string,
  useCaseId: string
): Promise<Array<{ period: string }>> {
  try {
    const collections = ['metrics', 'technicalMetrics', 'businessMetrics', 'financialMetrics', 'generalInfo'];
    const periodSet = new Set<string>();
    const periodDataMap = new Map<string, any>();

    await Promise.all(collections.map(async (colName) => {
      try {
        const snapshot = await getDocs(
          collection(db, 'entities', entityId, 'useCases', useCaseId, colName)
        );
        snapshot.docs.forEach(doc => {
          periodSet.add(doc.id);
          // Keep the data from the first occurrence, or merge? 
          // For the selector, we mostly need the period ID. 
          // But if we want to show data, we might need to merge.
          // For now, let's just ensure the period exists.
          if (!periodDataMap.has(doc.id)) {
            periodDataMap.set(doc.id, { period: doc.id, ...doc.data() });
          }
        });
      } catch (e) {
        console.warn(`Failed to fetch from ${colName}`, e);
        // Continue even if one collection fails (e.g. permission error or non-existent)
      }
    }));

    const periods = Array.from(periodSet).map(period => periodDataMap.get(period))
      .sort((a, b) => b.period.localeCompare(a.period));

    return periods as Array<{ period: string }>;
  } catch (e: any) {
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
  metrics: any;
  category?: string;
}) {
  const result = await fetchFromAPI('saveMetrics', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
  });
  return result.success;
}


export async function updateUseCase(data: Partial<UseCase> & { entityId: string; id: string; }): Promise<boolean> {
  const result = await fetchFromAPI('updateUseCase', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' },
  });
  return result.success;
}


export async function revertUseCaseVersion(
  entityId: string,
  useCaseId: string,
  versionId: string
): Promise<{ success: boolean, error?: string }> {
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

export async function deleteUploadedFile(
  entityId: string,
  useCaseId: string,
  fileId: string
): Promise<{ success: boolean, error?: string }> {
  const functions = getFunctions(db.app, 'us-central1');
  // Make sure the cloud function name matches what's exported in `functions/src/index.ts`
  const deleteFileCallable = httpsCallable(functions, 'deleteUploadedFile');
  try {
    const result = await deleteFileCallable({ entityId, useCaseId, fileId });
    return result.data as { success: boolean; error?: string };
  } catch (error: any) {
    console.error("Error calling deleteUploadedFile function:", error);
    return { success: false, error: error.message };
  }
}

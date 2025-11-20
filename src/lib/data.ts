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

export async function getMetricsHistory(
  entityId: string,
  useCaseId: string,
  category?: string
): Promise<Array<{ id: string; uploadedAt: string;[key: string]: any }>> {
  const response = await fetch(`${API_URL}/getMetricsHistory?entityId=${entityId}&useCaseId=${useCaseId}&category=${category || ''}`);
  if (!response.ok) {
    console.error('Failed to fetch metrics history');
    return [];
  }
  const data = await response.json();
  return data.history || [];
}

export async function saveMetrics({ entityId, useCaseId, category, metrics }: { entityId: string, useCaseId: string, category?: string, metrics: any }) {
  try {
    const response = await fetch(`${API_URL}/saveMetrics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ entityId, useCaseId, category, metrics }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Save metrics failed:', response.status, errorText);
      throw new Error(`Failed to save metrics: ${response.status} - ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error in saveMetrics:', error);
    throw error;
  }
}

export async function getMetric(entityId: string, useCaseId: string, category: string, metricId: string) {
  const response = await fetch(`${API_URL}/getMetric?entityId=${entityId}&useCaseId=${useCaseId}&category=${category}&metricId=${metricId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch metric');
  }
  const data = await response.json();
  return data.metric;
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

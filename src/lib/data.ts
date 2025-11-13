'use client';
import type { Metric } from './types';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

// ----- NEW: Central API endpoint -----
const API_URL = 'https://us-central1-augusta-edge-project.cloudfunctions.net';

// Helper to handle API responses
async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(`${API_URL}/${endpoint}`, options);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed with status ' + response.status }));
      throw new Error(errorData.error || 'API request failed');
    }
    const data = await response.json();
    if (data.success) {
      return data;
    } else {
      throw new Error(data.error || 'API returned an error');
    }
  } catch (error: any) {
    console.error(`Error fetching from ${endpoint}:`, error);
    // For permission errors specifically, we could try to parse them
    if (error.message.includes('permission-denied')) {
        const path = endpoint.split('?')[0]; // simple path extraction
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: path,
            operation: options.method === 'POST' || options.method === 'PUT' ? 'write' : 'list',
            requestResourceData: options.body ? JSON.parse(options.body as string) : {}
        }));
    }
    // Return a consistent error structure for other failures
    return { success: false, error: error.message };
  }
}


export async function getMetrics(entityId: string, useCaseId: string) {
    const data = await fetchFromAPI(`getUseCase?entityId=${entityId}&useCaseId=${useCaseId}`);
    if (data.success) {
        return data.useCase.metrics;
    }
    return {
        general: [],
        financial: [],
        business: [],
        technical: [],
    };
}

export async function getMetricsPeriods(
  entityId: string,
  useCaseId: string
): Promise<Array<{ period: string }>> {
  const data = await fetchFromAPI(`getMetricsPeriods?entityId=${entityId}&useCaseId=${useCaseId}`);
  return data.success ? data.periods : [];
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
    headers: { 'Content-Type': 'application/json' },
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return result.success;
}

export async function updateUseCase(data: {
  entityId: string;
  id: string;
  [key: string]: any;
}) {
    const result = await fetchFromAPI('updateUseCase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    return result.success;
}


export async function getUseCaseHistory(entityId: string, useCaseId: string): Promise<any[]> {
    const data = await fetchFromAPI(`getUseCaseHistory?entityId=${entityId}&useCaseId=${useCaseId}`);
    return data.success ? data.history : [];
}


export async function revertUseCaseVersion(
  entityId: string, 
  useCaseId: string, 
  versionId: string
): Promise<{success: boolean, error?: string}> {
    const result = await fetchFromAPI('revertUseCaseVersion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entityId, useCaseId, versionId }),
    });
    return result;
}

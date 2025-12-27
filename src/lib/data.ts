'use client';

import type { UseCase, Entity, TeamMember, MetricCategory } from './types';

// ============================================================================
// Entity Operations (via API routes)
// ============================================================================

export async function getEntities(): Promise<Entity[]> {
  try {
    const response = await fetch('/api/entities');
    if (!response.ok) throw new Error('Failed to fetch entities');
    return response.json();
  } catch (error) {
    console.error("Error fetching entities:", error);
    return [];
  }
}

export async function createEntity(data: { name: string; description: string; logo: string; team?: TeamMember[] }): Promise<boolean> {
  try {
    const response = await fetch('/api/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'create', data }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error creating entity:", error);
    return false;
  }
}

export async function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
  team?: TeamMember[];
}): Promise<boolean> {
  try {
    const response = await fetch('/api/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', data }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error updating entity:", error);
    return false;
  }
}

export async function deleteEntity(id: string): Promise<boolean> {
  try {
    const response = await fetch('/api/entities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', data: { id } }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error deleting entity:", error);
    return false;
  }
}

// ============================================================================
// Use Case Operations (via API routes)
// ============================================================================

export async function getAllUseCases(): Promise<UseCase[]> {
  try {
    const response = await fetch('/api/usecases?all=true');
    if (!response.ok) throw new Error('Failed to fetch use cases');
    return response.json();
  } catch (error) {
    console.error("Error fetching all use cases:", error);
    return [];
  }
}

export async function getUseCases(entityId: string): Promise<UseCase[]> {
  try {
    const response = await fetch(`/api/usecases?entityId=${encodeURIComponent(entityId)}`);
    if (!response.ok) throw new Error('Failed to fetch use cases');
    return response.json();
  } catch (error) {
    console.error(`Error fetching use cases for ${entityId}:`, error);
    return [];
  }
}

export async function updateUseCase(data: Partial<UseCase> & { entityId: string; id: string }): Promise<boolean> {
  try {
    const { entityId, id, ...updateData } = data;
    const response = await fetch('/api/usecases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update',
        entityId,
        useCaseId: id,
        data: updateData
      }),
    });
    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Error updating use case:", error);
    return false;
  }
}

// ============================================================================
// Metrics & History Operations (via API routes)
// ============================================================================

export async function getMetricsHistory(
  entityId: string,
  useCaseId: string,
  category?: string
): Promise<Array<{ id: string; uploadedAt: string;[key: string]: any }>> {
  try {
    const params = new URLSearchParams({ entityId, useCaseId });
    if (category) params.append('category', category);

    const response = await fetch(`/api/metrics?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch metrics history');
    return response.json();
  } catch (error) {
    console.error("Error fetching metrics history:", error);
    return [];
  }
}

export async function saveMetrics({
  entityId,
  useCaseId,
  category,
  metrics
}: {
  entityId: string;
  useCaseId: string;
  category?: MetricCategory;
  metrics: any;
}): Promise<{ success: boolean }> {
  try {
    const response = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'save',
        entityId,
        useCaseId,
        category,
        metrics
      }),
    });
    return response.json();
  } catch (error) {
    console.error("Error saving metrics:", error);
    throw error;
  }
}

export async function getMetric(
  entityId: string,
  useCaseId: string,
  category: string,
  metricId: string
): Promise<any | null> {
  try {
    const params = new URLSearchParams({ entityId, useCaseId, category, metricId });
    const response = await fetch(`/api/metrics?${params.toString()}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching metric:", error);
    return null;
  }
}

export async function revertUseCaseVersion(
  entityId: string,
  useCaseId: string,
  versionId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/usecases', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'revert',
        entityId,
        useCaseId,
        versionId
      }),
    });
    return response.json();
  } catch (error: any) {
    console.error("Error reverting use case version:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteUploadedFile(
  entityId: string,
  useCaseId: string,
  fileId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteFile',
        entityId,
        useCaseId,
        fileId
      }),
    });
    return response.json();
  } catch (error: any) {
    console.error("Error deleting uploaded file:", error);
    return { success: false, error: error.message };
  }
}

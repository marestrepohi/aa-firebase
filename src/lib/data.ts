'use client';

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collectionGroup,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { UseCase, Entity, TeamMember } from './types';
import { db, app } from './firebase'; // Using client-side initialized firebase

// Helper to serialize Firestore Timestamps
const serializeDate = (timestamp: any): string | undefined => {
  if (!timestamp) return undefined;
  // Handle Firestore Timestamp
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  // Handle already serialized date string or Date object
  if (timestamp instanceof Date) return timestamp.toISOString();
  return timestamp; // Return as is if it's already a string
}

const serializeObject = (obj: any): any => {
  if (!obj) return obj;
  const newObj: any = { ...obj };
  for (const key in newObj) {
    if (newObj[key] && typeof newObj[key].toDate === 'function') {
      newObj[key] = serializeDate(newObj[key]);
    } else if (Array.isArray(newObj[key])) {
      newObj[key] = newObj[key].map(serializeObject);
    } else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
      newObj[key] = serializeObject(newObj[key]);
    }
  }
  return newObj;
}

// --- Entity Operations ---

export async function getEntities(): Promise<Entity[]> {
  try {
    const entitiesSnapshot = await getDocs(collection(db, 'entities'));
    const useCasesSnapshot = await getDocs(collectionGroup(db, 'useCases'));

    // Calculate stats client-side
    const statsByEntity: Record<string, any> = {};

    // We need to fetch metrics for each use case to get scientist count
    // This might be expensive if there are many use cases, but for now it's fine
    // Optimization: Store aggregated stats on the Entity document itself via Cloud Functions triggers (background)

    useCasesSnapshot.docs.forEach(doc => {
      const useCase = doc.data();
      const entityId = useCase.entityId; // Ensure entityId is stored on useCase

      // If entityId is missing on useCase (legacy data), we might need to deduce it from path
      // path: entities/{entityId}/useCases/{useCaseId}
      const actualEntityId = entityId || doc.ref.path.split('/')[1];

      if (!statsByEntity[actualEntityId]) {
        statsByEntity[actualEntityId] = {
          active: 0, inactive: 0, strategic: 0, total: 0, scientists: 0
        };
      }

      const stats = statsByEntity[actualEntityId];
      stats.total++;

      const status = useCase.highLevelStatus || '';
      if (status === 'Activo') stats.active++;
      else if (status === 'Inactivo') stats.inactive++;
      else if (status === 'Estrategico') stats.strategic++;

      // Scientist count would ideally come from metrics, but for now we'll leave it as 0 or 
      // implement a separate fetch if critical. 
      // Or better: count unique team members from the entity itself.
    });

    const entities = entitiesSnapshot.docs.map(doc => {
      const data = doc.data();
      const stats = statsByEntity[doc.id] || { active: 0, inactive: 0, strategic: 0, total: 0, scientists: 0 };

      // Calculate scientists from team array if available
      const teamSize = Array.isArray(data.team) ? data.team.length : 0;

      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        logo: data.logo,
        team: data.team || [],
        stats: {
          ...stats,
          scientists: teamSize, // Use team array size for scientist count
          alerts: 0,
          totalImpact: 0,
          inDevelopment: stats.active
        }
      } as Entity;
    });

    return entities;
  } catch (error) {
    console.error("Error fetching entities:", error);
    return [];
  }
}

export async function createEntity(data: { name: string; description: string; logo: string; team?: TeamMember[] }) {
  const id = data.name.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9]/g, '-'); // Replace non-alphanumeric with hyphens

  return updateEntity({ ...data, id, team: data.team || [] });
}

export async function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
  team?: TeamMember[];
}) {
  try {
    const { id, ...updateData } = data;
    const entityRef = doc(db, 'entities', id);

    // Check if exists to decide between set (merge) or update
    // setDoc with merge: true is safer for "create or update"
    await setDoc(entityRef, {
      ...updateData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error updating entity:", error);
    return false;
  }
}

export async function deleteEntity(id: string) {
  try {
    // Note: This only deletes the entity document. Subcollections (useCases) are NOT automatically deleted by Firestore client SDK.
    // For full cleanup, we should use a Cloud Function trigger or a recursive delete helper.
    // For this "Direct Integration" phase, we'll just delete the parent doc.
    await deleteDoc(doc(db, 'entities', id));
    return true;
  } catch (error) {
    console.error("Error deleting entity:", error);
    return false;
  }
}

// --- Use Case Operations ---

export async function getAllUseCases(): Promise<UseCase[]> {
  try {
    const snapshot = await getDocs(collectionGroup(db, 'useCases'));
    return snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        ...data,
        id: doc.id,
        // Ensure dates are serialized for Client Components
        lastUpdated: serializeDate(data.updatedAt),
        createdAt: serializeDate(data.createdAt),
        metrics: serializeObject(data.metrics),
        // Add other necessary serializations
      } as UseCase;
    });
  } catch (error) {
    console.error("Error fetching all use cases:", error);
    return [];
  }
}

export async function getUseCases(entityId: string): Promise<UseCase[]> {
  try {
    const snapshot = await getDocs(collection(db, 'entities', entityId, 'useCases'));
    return snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        ...data,
        id: doc.id,
        lastUpdated: serializeDate(data.updatedAt),
        createdAt: serializeDate(data.createdAt),
        metrics: serializeObject(data.metrics),
      } as UseCase;
    });
  } catch (error) {
    console.error(`Error fetching use cases for ${entityId}:`, error);
    return [];
  }
}

export async function updateUseCase(data: Partial<UseCase> & { entityId: string; id: string; }): Promise<boolean> {
  try {
    const { entityId, id, ...updateData } = data;
    const ref = doc(db, 'entities', entityId, 'useCases', id);

    await setDoc(ref, {
      ...updateData,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return true;
  } catch (error) {
    console.error("Error updating use case:", error);
    return false;
  }
}

// --- Metrics & Files (Keep existing logic or adapt) ---

export async function getMetricsHistory(
  entityId: string,
  useCaseId: string,
  category?: string
): Promise<Array<{ id: string; uploadedAt: string;[key: string]: any }>> {
  try {
    const metricsRef = collection(db, 'entities', entityId, 'useCases', useCaseId, 'metrics');
    // Simple query for now, can add category filtering if needed
    const q = query(metricsRef, orderBy('uploadedAt', 'desc'));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      uploadedAt: serializeDate(doc.data().uploadedAt) || ''
    }));
  } catch (error) {
    console.error("Error fetching metrics history:", error);
    return [];
  }
}

export async function saveMetrics({ entityId, useCaseId, category, metrics }: { entityId: string, useCaseId: string, category?: string, metrics: any }) {
  try {
    const metricsRef = collection(db, 'entities', entityId, 'useCases', useCaseId, 'metrics');
    await setDoc(doc(metricsRef), {
      ...metrics,
      category,
      uploadedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Error saving metrics:", error);
    throw error;
  }
}

export async function getMetric(entityId: string, useCaseId: string, category: string, metricId: string) {
  try {
    const docRef = doc(db, 'entities', entityId, 'useCases', useCaseId, 'metrics', metricId);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching metric:", error);
    throw error;
  }
}

// Keep Cloud Functions for complex operations if needed, or replace with client logic
export async function revertUseCaseVersion(
  entityId: string,
  useCaseId: string,
  versionId: string
): Promise<{ success: boolean, error?: string }> {
  const functions = getFunctions(app, 'us-central1');
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
  const functions = getFunctions(app, 'us-central1');
  const deleteFileCallable = httpsCallable(functions, 'deleteUploadedFile');
  try {
    const result = await deleteFileCallable({ entityId, useCaseId, fileId });
    return result.data as { success: boolean; error?: string };
  } catch (error: any) {
    console.error("Error calling deleteUploadedFile function:", error);
    return { success: false, error: error.message };
  }
}

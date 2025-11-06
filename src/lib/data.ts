// Data layer - Client-side Firestore access
'use client';
import type { Metric } from './types';
import { db } from './firebase'; // Using client-side firebase instance
import { collection, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

export async function getMetrics(entityId: string, useCaseId: string) {
    const metricsSnapshot = await getDocs(collection(db, 'entities', entityId, 'useCases', useCaseId, 'metrics'));
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
}


export async function getMetricsPeriods(
  entityId: string,
  useCaseId: string
): Promise<Array<{ period: string }>> {
  try {
    const snapshot = await getDocs(
      collection(db, 'entities', entityId, 'useCases', useCaseId, 'metrics')
    );
    return snapshot.docs.map(doc => ({ period: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching metrics periods on client:", error);
    return [];
  }
}

export async function saveMetrics(data: {
  entityId: string;
  useCaseId: string;
  period: string;
  metrics: {
    general: Metric[];
    financial: Metric[];
    business: Metric[];
    technical: Metric[];
  };
}): Promise<boolean> {
  const { entityId, useCaseId, period, metrics } = data;
  try {
    const docRef = doc(db, 'entities', entityId, 'useCases', useCaseId, 'metrics', period);
    await setDoc(docRef, { ...metrics, period }, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving metrics on client:", error);
    return false;
  }
}

export async function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
}): Promise<boolean> {
  try {
    await setDoc(doc(db, 'entities', data.id), data, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating entity on client:", error);
    return false;
  }
}

export async function updateUseCase(data: {
  entityId: string;
  id: string;
  [key: string]: any;
}): Promise<boolean> {
  try {
    const { entityId, id, ...useCaseData } = data;
    await setDoc(doc(db, 'entities', entityId, 'useCases', id), useCaseData, { merge: true });
    return true;
  } catch (error) {
    console.error("Error updating use case on client:", error);
    return false;
  }
}
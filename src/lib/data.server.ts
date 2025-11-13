// Data layer - Firebase API only (Server-side)
import 'server-only';
import type { Entity, UseCase, SummaryMetrics, ImpactMetric } from './types';
import { adminDb } from './firebase-admin';
import * as admin from 'firebase-admin';
import { format } from 'date-fns';

// Helper to serialize Firestore Timestamps
const serializeDate = (timestamp: admin.firestore.Timestamp | undefined): string | undefined => {
  return timestamp ? timestamp.toDate().toISOString() : undefined;
}

const formatDateForDisplay = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        // The date string is YYYY-MM-DD. We need to parse it as UTC.
        const date = new Date(`${dateString}T00:00:00Z`);
        return format(date, 'dd/MM/yyyy');
    } catch {
        return 'N/A';
    }
};

const serializeObject = (obj: any) => {
    if (!obj) return obj;
    const newObj: any = { ...obj };
    for (const key in newObj) {
      if (newObj[key] instanceof admin.firestore.Timestamp) {
        newObj[key] = serializeDate(newObj[key]);
      } else if (key === 'impactoEsperado' || key === 'impactoGenerado') {
          if (Array.isArray(newObj[key])) {
              newObj[key] = newObj[key].map((metric: ImpactMetric) => ({
                  ...metric,
                  fecha: formatDateForDisplay(metric.fecha),
              }));
          }
      }
      else if (typeof newObj[key] === 'object' && newObj[key] !== null) {
        newObj[key] = serializeObject(newObj[key]);
      }
    }
    return newObj;
}

// Helper function to calculate entity stats efficiently
async function calculateEntityStats(allUseCases: admin.firestore.QueryDocumentSnapshot[]): Promise<Record<string, any>> {
  const statsByEntity: Record<string, any> = {};

  const metricsPromises = allUseCases.map(doc => 
    doc.ref.collection('metrics').orderBy('period', 'desc').limit(1).get()
  );
  const metricsSnapshots = await Promise.all(metricsPromises);

  allUseCases.forEach((doc, index) => {
    const useCase = doc.data();
    const entityId = useCase.entityId;

    if (!statsByEntity[entityId]) {
      statsByEntity[entityId] = {
        active: 0,
        inactive: 0,
        strategic: 0,
        total: 0,
        scientists: 0,
      };
    }

    const stats = statsByEntity[entityId];
    stats.total++;

    const status = useCase.highLevelStatus || '';
    if (status === 'Activo') stats.active++;
    else if (status === 'Inactivo') stats.inactive++;
    else if (status === 'Estrategico') stats.strategic++;

    const metricsSnapshot = metricsSnapshots[index];
    if (!metricsSnapshot.empty) {
      const metrics = metricsSnapshot.docs[0].data();
      const dsMetrics = metrics.technical?.filter((m: any) => m.label.startsWith('DS') && m.value);
      if (dsMetrics) {
        stats.scientists += dsMetrics.length;
      }
    }
  });

  return statsByEntity;
}


async function getEntitiesFromFirestore(): Promise<Entity[]> {
  const [entitiesSnapshot, useCasesSnapshot] = await Promise.all([
    adminDb.collection('entities').get(),
    adminDb.collectionGroup('useCases').get(),
  ]);

  if (entitiesSnapshot.empty) return [];

  const statsByEntity = await calculateEntityStats(useCasesSnapshot.docs);

  const entities = entitiesSnapshot.docs.map(doc => {
    const entityData = doc.data();
    const stats = statsByEntity[doc.id] || {
      active: 0, inactive: 0, strategic: 0, total: 0, scientists: 0,
    };
    return {
      id: doc.id,
      name: entityData.name,
      description: entityData.description,
      logo: entityData.logo,
      stats: {
        ...stats,
        alerts: 0, // Placeholder
        totalImpact: 0, // Placeholder
        inDevelopment: stats.active, // Simplified
      },
    } as Entity;
  });

  return entities;
}

async function getUseCasesFromFirestore(entityId: string): Promise<UseCase[]> {
  const useCasesSnapshot = await adminDb.collection('entities').doc(entityId).collection('useCases').get();
  if (useCasesSnapshot.empty) return [];

  const useCases = await Promise.all(useCasesSnapshot.docs.map(async doc => {
    const useCaseData = doc.data();
    const metricsSnapshot = await doc.ref.collection('metrics').orderBy('period', 'desc').limit(1).get();
    
    let metrics: any = { general: [], financial: [], business: [], technical: [] };
    if (!metricsSnapshot.empty) {
      metrics = metricsSnapshot.docs[0].data();
    }
    
    const useCase = {
      ...useCaseData,
      id: doc.id,
      lastUpdated: serializeDate(useCaseData.updatedAt),
      createdAt: serializeDate(useCaseData.createdAt),
      metrics: serializeObject(metrics),
      roadmap: useCaseData.roadmap || null,
      impactoEsperado: (useCaseData.impactoEsperado || []).map((m: ImpactMetric) => ({...m, fecha: formatDateForDisplay(m.fecha)})),
      impactoGenerado: (useCaseData.impactoGenerado || []).map((m: ImpactMetric) => ({...m, fecha: formatDateForDisplay(m.fecha)})),
    } as UseCase;
    
    delete (useCase as any).updatedAt;
    
    return useCase;
  }));

  return useCases;
}

export async function getEntities(): Promise<Entity[]> {
  return getEntitiesFromFirestore();
}

export async function getEntity(id: string): Promise<Entity | undefined> {
  const entities = await getEntitiesFromFirestore();
  return entities.find(e => e.id === id);
}

export async function getUseCases(entityId: string): Promise<UseCase[]> {
  return getUseCasesFromFirestore(entityId);
}

export async function getUseCase(entityId: string, useCaseId: string): Promise<UseCase | undefined> {
  const useCases = await getUseCasesFromFirestore(entityId);
  return useCases.find(uc => uc.id === useCaseId);
}

export async function getAllUseCases(): Promise<UseCase[]> {
  const useCasesSnapshot = await adminDb.collectionGroup('useCases').get();
  if (useCasesSnapshot.empty) return [];

  const useCases = await Promise.all(useCasesSnapshot.docs.map(async doc => {
    const useCaseData = doc.data();
    const metricsSnapshot = await doc.ref.collection('metrics').orderBy('period', 'desc').limit(1).get();
    
    let metrics: any = { general: [], financial: [], business: [], technical: [] };
    if (!metricsSnapshot.empty) {
      metrics = metricsSnapshot.docs[0].data();
    }
    
    const useCase = {
      ...useCaseData,
      id: doc.id,
      lastUpdated: serializeDate(useCaseData.updatedAt),
      createdAt: serializeDate(useCaseData.createdAt),
      metrics: serializeObject(metrics),
      roadmap: useCaseData.roadmap || null,
    } as UseCase;
    
    delete (useCase as any).updatedAt;
    
    return useCase;
  }));

  return useCases;
}

export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  const entities = await getEntities();
  const allUseCases = await getAllUseCases();
  const totalScientists = entities.reduce((sum, e) => sum + (e.stats.scientists || 0), 0);

  return {
    totalCases: allUseCases.length,
    entities: entities.length,
    dataScientists: totalScientists,
    totalImpact: '0', // This needs a real calculation
  };
}

export async function addEntity(data: { name: string; description?: string; logo?: string; id?: string }): Promise<boolean> {
  const id = data.id || createIdFromName(data.name);
  await adminDb.collection('entities').doc(id).set({
    ...data,
    id,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return true;
}

export async function addUseCase(entityId: string, data: { name: string; description?: string; id?: string; }): Promise<boolean> {
  const id = data.id || createIdFromName(data.name);
  await adminDb.collection('entities').doc(entityId).collection('useCases').doc(id).set({
    ...data,
    id,
    entityId,
    status: 'En Estimación',
    highLevelStatus: 'Activo',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });
  return true;
}

function createIdFromName(name: string): string {
  if (!name) return `item-${Date.now()}`;
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
}

export async function getUseCaseHistory(entityId: string, useCaseId: string): Promise<any[]> {
    try {
        const historySnapshot = await adminDb
            .collection('entities')
            .doc(entityId as string)
            .collection('useCases')
            .doc(useCaseId as string)
            .collection('history')
            .orderBy('versionedAt', 'desc')
            .get();
        
        const history = historySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                versionId: doc.id,
                versionedAt: serializeDate(data.versionedAt),
            };
        });

        return history;
    } catch (error) {
        console.error('Error getting use case history:', error);
        return [];
    }
}

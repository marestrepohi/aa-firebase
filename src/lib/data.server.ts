// Data layer - Firebase API only (Server-side)
import 'server-only';
import type { Entity, UseCase, SummaryMetrics, Metric } from './types';
import { adminDb } from './firebase-admin';

async function getEntitiesFromFirestore(): Promise<Entity[]> {
  try {
    const entitiesSnapshot = await adminDb.collection('entities').get();
    const entities: Entity[] = [];

    for (const doc of entitiesSnapshot.docs) {
      const entityData = doc.data();
      const stats = await calculateEntityStats(doc.id);
      entities.push({
        id: doc.id,
        name: entityData.name,
        description: entityData.description,
        logo: entityData.logo,
        subName: entityData.name,
        stats,
      });
    }
    return entities;
  } catch (error) {
    console.error('Error fetching entities from Firestore:', error);
    return [];
  }
}

async function getEntityFromFirestore(id: string): Promise<Entity | undefined> {
  try {
    const entityDoc = await adminDb.collection('entities').doc(id).get();
    if (!entityDoc.exists) {
      return undefined;
    }
    const entityData = entityDoc.data()!;
    const stats = await calculateEntityStats(id);
    return {
      id: entityDoc.id,
      name: entityData.name,
      description: entityData.description,
      logo: entityData.logo,
      subName: entityData.name,
      stats,
    };
  } catch (error) {
    console.error(`Error fetching entity ${id} from Firestore:`, error);
    return undefined;
  }
}

async function getUseCasesFromFirestore(entityId?: string): Promise<UseCase[]> {
  try {
    let query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>;
    if (entityId) {
      query = adminDb.collection('entities').doc(entityId).collection('useCases');
    } else {
      query = adminDb.collectionGroup('useCases');
    }

    const useCasesSnapshot = await query.get();
    const useCases: UseCase[] = [];

    for (const doc of useCasesSnapshot.docs) {
      const useCaseData = doc.data();
      const metricsSnapshot = await doc.ref.collection('metrics').orderBy('period', 'desc').limit(1).get();
      
      let metrics = { general: [], financial: [], business: [], technical: [] };
      let lastUpdated = useCaseData.updatedAt?.toDate()?.toISOString() || new Date().toISOString();

      if (!metricsSnapshot.empty) {
        const metricsData = metricsSnapshot.docs[0].data();
        metrics = {
            general: metricsData.general || [],
            financial: metricsData.financial || [],
            business: metricsData.business || [],
            technical: metricsData.technical || [],
        };
        if(metricsData.updatedAt) {
            lastUpdated = metricsData.updatedAt.toDate().toISOString();
        }
      }

      useCases.push({
        ...useCaseData,
        id: doc.id,
        lastUpdated,
        metrics,
      } as UseCase);
    }
    return useCases;
  } catch (error) {
    console.error('Error fetching use cases from Firestore:', error);
    return [];
  }
}

async function getUseCaseFromFirestore(entityId: string, useCaseId: string): Promise<UseCase | undefined> {
   try {
    const useCaseDoc = await adminDb.collection('entities').doc(entityId).collection('useCases').doc(useCaseId).get();
    
    if (!useCaseDoc.exists) {
      return undefined;
    }
    
    const useCaseData = useCaseDoc.data()!;
    const metricsSnapshot = await useCaseDoc.ref.collection('metrics').orderBy('period', 'desc').limit(1).get();

    let metrics = { period: '', general: [], financial: [], business: [], technical: [] };
    let lastUpdated = useCaseData.updatedAt?.toDate()?.toISOString() || new Date().toISOString();

    if (!metricsSnapshot.empty) {
        const metricsData = metricsSnapshot.docs[0].data();
        metrics = {
            period: metricsData.period || '',
            general: metricsData.general || [],
            financial: metricsData.financial || [],
            business: metricsData.business || [],
            technical: metricsData.technical || [],
        };
        if(metricsData.updatedAt) {
            lastUpdated = metricsData.updatedAt.toDate().toISOString();
        }
    }

    return {
      ...useCaseData,
      id: useCaseDoc.id,
      lastUpdated,
      metrics,
    } as UseCase;
  } catch (error) {
    console.error(`Error fetching use case ${useCaseId} from Firestore:`, error);
    return undefined;
  }
}

async function calculateEntityStats(entityId: string) {
  const useCasesSnapshot = await adminDb
    .collection('entities')
    .doc(entityId)
    .collection('useCases')
    .get();

  let active = 0;
  let inactive = 0;
  let strategic = 0;
  let totalDS = 0;

  for (const doc of useCasesSnapshot.docs) {
    const useCase = doc.data();
    if (useCase.highLevelStatus === 'Activo') active++;
    else if (useCase.highLevelStatus === 'Inactivo') inactive++;
    else if (useCase.highLevelStatus === 'Estrategico') strategic++;
    
    const metricsSnapshot = await doc.ref.collection('metrics').orderBy('period', 'desc').limit(1).get();
    if (!metricsSnapshot.empty) {
      const metrics = metricsSnapshot.docs[0].data();
      const dsMetric = metrics.general?.find((m: Metric) => m.label === 'Cantidad de DS');
      if (dsMetric?.value) {
        totalDS += parseInt(String(dsMetric.value)) || 0;
      }
    }
  }

  return {
    active,
    inactive,
    strategic,
    total: useCasesSnapshot.size,
    scientists: totalDS,
    inDevelopment: 0,
    alerts: 0,
    totalImpact: 0,
  };
}

async function getSummaryMetricsFromFirestore(): Promise<SummaryMetrics> {
  const entities = await getEntitiesFromFirestore();
  const allUseCases = await getUseCasesFromFirestore();
  
  let totalScientists = 0;
  entities.forEach(entity => {
    totalScientists += entity.stats.scientists || 0;
  });
  
  return {
    totalCases: allUseCases.length,
    entities: entities.length,
    dataScientists: totalScientists,
    totalImpact: `0`, // This needs to be defined
  };
}

export async function getEntities(): Promise<Entity[]> {
  return getEntitiesFromFirestore();
}

export async function getEntity(id: string): Promise<Entity | undefined> {
  return getEntityFromFirestore(id);
}

export async function getUseCases(entityId?: string): Promise<UseCase[]> {
  return getUseCasesFromFirestore(entityId);
}

export async function getUseCase(entityId: string, useCaseId: string): Promise<UseCase | undefined> {
  return getUseCaseFromFirestore(entityId, useCaseId);
}

export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  return getSummaryMetricsFromFirestore();
}

export async function getAllUseCases(): Promise<UseCase[]> {
  return getUseCasesFromFirestore();
}

// Helper to create a slug/id from a name
function createIdFromName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100);
}

// --- Write operations ---
export async function addEntity(data: { name: string; description?: string; logo?: string; id?: string }): Promise<boolean> {
  const id = data.id || createIdFromName(data.name) || `entity-${Date.now()}`;
  const payload = {
    id,
    name: data.name,
    description: data.description || '',
    logo: data.logo || '',
  };
  await adminDb.collection('entities').doc(id).set(payload, { merge: true });
  return true;
}

export async function addUseCase(entityId: string, data: { name: string; description?: string; id?: string; [key: string]: any; }): Promise<boolean> {
  const id = data.id || createIdFromName(data.name) || `case-${Date.now()}`;
  const payload: any = { ...data, id, entityId };
  await adminDb.collection('entities').doc(entityId).collection('useCases').doc(id).set(payload, { merge: true });
  return true;
}

export async function deleteEntity(id: string): Promise<boolean> {
  // This is a more complex operation, requires deleting subcollections.
  // For now, we'll just delete the entity doc.
  await adminDb.collection('entities').doc(id).delete();
  return true;
}

export async function deleteUseCase(entityId: string, id: string): Promise<boolean> {
  await adminDb.collection('entities').doc(entityId).collection('useCases').doc(id).delete();
  return true;
}

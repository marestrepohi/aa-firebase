// Data layer - Firebase API only (CSV migration completed)
import type { Entity, UseCase, SummaryMetrics } from './types';
import * as api from './api';

async function getEntitiesFromAPI(): Promise<Entity[]> {
  const response = await api.getEntities();
  if (!response.success) {
    console.error('Failed to fetch entities from API:', response.error);
    return [];
  }
  return response.entities || [];
}

async function getEntityFromAPI(id: string): Promise<Entity | undefined> {
  const response = await api.getEntity(id);
  if (!response.success) {
    console.error('Failed to fetch entity from API:', response.error);
    return undefined;
  }
  return response.entity;
}

async function getUseCasesFromAPI(entityId?: string): Promise<UseCase[]> {
  if (!entityId) {
    const entities = await getEntitiesFromAPI();
    const allUseCases: UseCase[] = [];
    
    for (const entity of entities) {
      const response = await api.getUseCases(entity.id);
      if (response.success && response.useCases) {
        allUseCases.push(...response.useCases);
      }
    }
    
    return allUseCases;
  }
  
  const response = await api.getUseCases(entityId);
  if (!response.success) {
    console.error('Failed to fetch use cases from API:', response.error);
    return [];
  }
  return response.useCases || [];
}

async function getUseCaseFromAPI(id: string): Promise<UseCase | undefined> {
  // Get all use cases and find the one with matching ID
  // Note: getUseCasesFromAPI already includes metrics from the latest period
  const allUseCases = await getUseCasesFromAPI();
  return allUseCases.find(uc => uc.id === id);
}

async function getSummaryMetricsFromAPI(): Promise<SummaryMetrics> {
  const entities = await getEntitiesFromAPI();
  const allUseCases = await getUseCasesFromAPI();
  
  let totalActive = 0;
  let totalInactive = 0;
  let totalStrategic = 0;
  let totalScientists = 0;
  let totalAlerts = 0;
  
  entities.forEach(entity => {
    totalActive += entity.stats.active || 0;
    totalInactive += entity.stats.inactive || 0;
    totalStrategic += entity.stats.strategic || 0;
    totalScientists += entity.stats.scientists || 0;
    totalAlerts += entity.stats.alerts || 0;
  });
  
  const statusBreakdown: Record<string, number> = {};
  allUseCases.forEach(useCase => {
    const status = useCase.status || 'Unknown';
    statusBreakdown[status] = (statusBreakdown[status] || 0) + 1;
  });
  
  return {
    totalCases: allUseCases.length,
    entities: entities.length,
    dataScientists: totalScientists,
    totalImpact: `${totalAlerts} alerts`,
    totalActive,
    totalInactive,
    totalStrategic,
    totalProjects: allUseCases.length,
    totalEntities: entities.length,
    totalScientists,
    totalAlerts,
    statusBreakdown,
  };
}

export async function getEntities(): Promise<Entity[]> {
  return getEntitiesFromAPI();
}

export async function getEntity(id: string): Promise<Entity | undefined> {
  return getEntityFromAPI(id);
}

export async function getUseCases(entityId?: string): Promise<UseCase[]> {
  return getUseCasesFromAPI(entityId);
}

export async function getUseCase(id: string): Promise<UseCase | undefined> {
  return getUseCaseFromAPI(id);
}

export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  return getSummaryMetricsFromAPI();
}

export async function getAllUseCases(): Promise<UseCase[]> {
  return getUseCases();
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

// --- Create operations (convenience wrappers) ---
export async function addEntity(data: { name: string; description?: string; logo?: string; id?: string }): Promise<boolean> {
  const id = data.id || createIdFromName(data.name) || `entity-${Date.now()}`;
  const payload = {
    id,
    name: data.name,
    description: data.description || '',
    logo: data.logo || '',
  };
  const response = await api.updateEntity(payload);
  return response.success;
}

export async function addUseCase(entityId: string, data: { name: string; description?: string; id?: string; [key: string]: any; }): Promise<boolean> {
  const id = data.id || createIdFromName(data.name) || `case-${Date.now()}`;
  // avoid duplicating fields from data when spreading
  const extra: Record<string, any> = { ...data };
  delete extra.id;
  delete extra.name;
  delete extra.description;

  const payload = {
    entityId,
    id,
    name: data.name,
    description: data.description || '',
    ...extra,
  } as any;

  const response = await api.updateUseCase(payload);
  return response.success;
}

export async function updateEntity(data: {
  id: string;
  name?: string;
  description?: string;
  logo?: string;
}): Promise<boolean> {
  const response = await api.updateEntity(data);
  return response.success;
}

export async function updateUseCase(data: {
  entityId: string;
  id: string;
  [key: string]: any;
}): Promise<boolean> {
  const response = await api.updateUseCase(data);
  return response.success;
}

export async function saveMetrics(data: {
  entityId: string;
  useCaseId: string;
  period: string;
  metrics: {
    general: Array<{ label: string; value: string }>;
    financial: Array<{ label: string; value: string }>;
    business: Array<{ label: string; value: string }>;
    technical: Array<{ label: string; value: string }>;
  };
}): Promise<boolean> {
  const response = await api.saveMetrics(data);
  return response.success;
}

export async function getMetricsPeriods(
  entityId: string,
  useCaseId: string
): Promise<Array<any>> {
  const response = await api.getMetricsPeriods(entityId, useCaseId);
  if (!response.success) {
    return [];
  }
  return response.periods || [];
}

export async function deleteEntity(id: string): Promise<boolean> {
  const response = await api.deleteEntity(id);
  return response.success;
}

export async function deleteUseCase(entityId: string, id: string): Promise<boolean> {
  const response = await api.deleteUseCase(entityId, id);
  return response.success;
}

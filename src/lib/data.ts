import type { Entity, UseCase, Metric, UseCaseStatus, SummaryMetrics } from './types';

let entities: Entity[] = [
  { 
    id: '1', 
    name: 'ADL', 
    description: 'Laboratorio Digital',
    subName: 'Laboratorio Digital',
    logo: '/adl-logo.svg',
    stats: {
      active: 2,
      total: 23,
      scientists: 8,
      inDevelopment: 0,
      alerts: 16,
      totalImpact: 0,
    } 
  },
  { 
    id: '2', 
    name: 'AVC', 
    description: 'ATH',
    subName: 'ATH',
    logo: '/avc-logo.svg',
    stats: {
      active: 1,
      total: 1,
      scientists: 1,
      inDevelopment: 0,
      alerts: 0,
      totalImpact: 0,
    }
  },
  { 
    id: '3', 
    name: 'BAC', 
    description: 'Banco Internacional',
    subName: 'Banco internacional',
    logo: '/bac-logo.svg',
    stats: {
      active: 0,
      total: 4,
      scientists: 3,
      inDevelopment: 0,
      alerts: 4,
      totalImpact: 4.8,
    }
  },
];

let useCases: UseCase[] = [
  {
    id: '101',
    entityId: '1',
    name: 'Churn Prediction Model',
    description: 'A model to predict customer churn based on historical data.',
    status: 'Deployed',
    lastUpdated: '2024-05-20T10:00:00Z',
    metrics: {
      general: [
        { label: 'Model Accuracy', value: 94, unit: '%' },
        { label: 'Data Sources', value: 5 },
      ],
      financial: [
        { label: 'Cost Savings', value: 120000, unit: 'USD' },
        { label: 'ROI', value: 15, unit: '%' },
      ],
      business: [
        { label: 'Customer Retention', value: 5, unit: '%' },
        { label: 'Campaign Effectiveness', value: 12, unit: '%' },
      ],
      technical: [
        { label: 'API Latency', value: 200, unit: 'ms' },
        { label: 'Uptime', value: 99.9, unit: '%' },
      ],
    },
  },
  {
    id: '102',
    entityId: '1',
    name: 'Customer Lifetime Value (CLV)',
    description: 'Calculating the total worth of a customer to a business over the whole period of their relationship.',
    status: 'Development',
    lastUpdated: '2024-07-15T14:30:00Z',
    metrics: {
      general: [], financial: [], business: [], technical: []
    }
  },
  {
    id: '201',
    entityId: '2',
    name: 'Fraud Detection System',
    description: 'Real-time fraud detection for financial transactions.',
    status: 'Cancelled',
    lastUpdated: '2023-11-01T09:00:00Z',
    metrics: {
      general: [], financial: [], business: [], technical: []
    }
  },
];

const summaryMetrics: SummaryMetrics = {
  totalCases: 160,
  entities: 21,
  dataScientists: 26,
  totalImpact: '248,7',
};


// --- API Functions ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  await delay(50);
  return summaryMetrics;
}

export async function getEntities(): Promise<Entity[]> {
  await delay(100);
  return entities;
}

export async function getEntity(id: string): Promise<Entity | undefined> {
  await delay(100);
  return entities.find(e => e.id === id);
}

export async function addEntity(data: Omit<Entity, 'id' | 'logo' | 'subName' | 'stats'>): Promise<Entity> {
  await delay(500);
  const newEntity: Entity = {
    id: String(Date.now()),
    logo: '/placeholder.svg',
    subName: 'New Entity',
    stats: { active: 0, total: 0, scientists: 0, inDevelopment: 0, alerts: 0, totalImpact: 0 },
    ...data,
  };
  entities.unshift(newEntity);
  return newEntity;
}

export async function getUseCases(entityId: string): Promise<UseCase[]> {
  await delay(100);
  return useCases.filter(uc => uc.entityId === entityId);
}

export async function getUseCase(id: string): Promise<UseCase | undefined> {
  await delay(100);
  return useCases.find(uc => uc.id === id);
}

export async function addUseCase(entityId: string, data: Omit<UseCase, 'id' | 'entityId' | 'status' | 'lastUpdated' | 'metrics'>): Promise<UseCase> {
  await delay(500);
  const newUseCase: UseCase = {
    id: String(Date.now()),
    entityId,
    status: 'Development',
    lastUpdated: new Date().toISOString(),
    metrics: { general: [], financial: [], business: [], technical: [] },
    ...data,
  };
  useCases.unshift(newUseCase);
  
  const entity = entities.find(e => e.id === entityId);
  if (entity) {
    entity.stats.total += 1;
    entity.stats.inDevelopment += 1;
  }

  return newUseCase;
}

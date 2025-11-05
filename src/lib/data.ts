import type { Entity, UseCase, Metric, UseCaseStatus, SummaryMetrics } from './types';
import fs from 'fs/promises';
import path from 'path';

// --- Data Storage (In-memory, replace with a database in a real app) ---

let useCases: UseCase[] = [
  {
    id: '101',
    entityId: 'adl',
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
    entityId: 'adl',
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
    entityId: 'avc',
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

// --- Entity Management from CSV ---

const csvPath = path.join(process.cwd(), 'public', 'entidades.csv');

async function readEntitiesFromCSV(): Promise<Entity[]> {
  try {
    const fileContent = await fs.readFile(csvPath, 'utf8');
    const lines = fileContent.trim().split('\n');
    const header = lines.shift()?.split(',');
    if (!header || header[0] !== 'Entidad' || header[1] !== 'descripcion' || header[2] !== 'logo_url') {
        throw new Error('Invalid CSV header');
    }

    return lines.map(line => {
      const [name, description, logo] = line.split(',');
      const id = name.toLowerCase().replace(/\s+/g, '-');
      // Find matching use cases to calculate stats
      const entityUseCases = useCases.filter(uc => uc.entityId === id);
      const active = entityUseCases.filter(uc => uc.status === 'Deployed').length;
      const total = entityUseCases.length;
      const inDevelopment = entityUseCases.filter(uc => uc.status === 'Development').length;
      
      // These stats are now hardcoded as they are not in the CSV
      return {
        id,
        name,
        description,
        logo,
        subName: description, // or derive from somewhere else
        stats: {
          active: active,
          total: total,
          scientists: Math.floor(Math.random() * 10), // Placeholder
          inDevelopment: inDevelopment,
          alerts: Math.floor(Math.random() * 5), // Placeholder
          totalImpact: parseFloat((Math.random() * 10).toFixed(1)), // Placeholder
        },
      };
    });
  } catch (error) {
    console.error("Failed to read or parse entities CSV:", error);
    return [];
  }
}

async function writeEntitiesToCSV(entities: Omit<Entity, 'id' | 'stats' | 'subName'>[]): Promise<void> {
  const header = 'Entidad,descripcion,logo_url\n';
  const rows = entities.map(e => `${e.name},${e.description},${e.logo}`).join('\n');
  await fs.writeFile(csvPath, header + rows, 'utf8');
}


export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  await delay(50);
  const entities = await readEntitiesFromCSV();
  return { ...summaryMetrics, entities: entities.length };
}

export async function getEntities(): Promise<Entity[]> {
  await delay(100);
  return await readEntitiesFromCSV();
}

export async function getEntity(id: string): Promise<Entity | undefined> {
  await delay(100);
  const entities = await readEntitiesFromCSV();
  return entities.find(e => e.id === id);
}

export async function addEntity(data: {name: string, description: string}): Promise<Entity> {
  await delay(500);
  const entities = await readEntitiesFromCSV();
  const newEntityData = {
      ...data,
      logo: '/placeholder.svg' // default logo
  };
  
  const updatedEntities = [...entities.map(e => ({name: e.name, description: e.description, logo: e.logo})), newEntityData];
  await writeEntitiesToCSV(updatedEntities);

  const id = newEntityData.name.toLowerCase().replace(/\s+/g, '-');
  return {
      id,
      name: newEntityData.name,
      description: newEntityData.description,
      logo: newEntityData.logo,
      subName: newEntityData.description,
      stats: { active: 0, total: 0, scientists: 0, inDevelopment: 0, alerts: 0, totalImpact: 0 },
  };
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
  
  return newUseCase;
}

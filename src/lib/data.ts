import type { Entity, UseCase, UseCaseStatus, SummaryMetrics } from './types';
import fs from 'fs/promises';
import path from 'path';

// --- Data Storage (In-memory, replace with a database in a real app) ---

const useCases: UseCase[] = [
  // This will be populated from a data source in a real app
];

const summaryMetrics: SummaryMetrics = {
  totalCases: 0,
  entities: 0,
  dataScientists: 26,
  totalImpact: '0',
};


// --- API Functions ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function slugify(text: string) {
    return text
      .toString()
      .normalize('NFD') // split an accented letter in the base letter and the acent
      .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
}

// --- Entity Management from CSV ---

const csvPath = path.join(process.cwd(), 'public', 'entidades.csv');

async function readEntitiesFromCSV(): Promise<Entity[]> {
  try {
    const fileContent = await fs.readFile(csvPath, 'utf8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim() !== '');;
    const headerLine = lines.shift();
    if (!headerLine) throw new Error('CSV is empty or header is missing');
    
    // Handle BOM character and ensure correct splitting
    const header = headerLine.replace(/^\uFEFF/, '').trim().split(',');

    if (header.length < 3 || header[0].trim() !== 'Entidad' || header[1].trim() !== 'descripcion' || header[2].trim() !== 'logo_url') {
        throw new Error('Invalid CSV header. Expected "Entidad,descripcion,logo_url"');
    }

    return lines.map(line => {
      // Split by comma and trim whitespace from each part
      const [name, description, logo] = line.split(',').map(s => s.trim());
      const id = slugify(name);
      
      const entityUseCases = useCases.filter(uc => uc.entityId === id);
      const active = entityUseCases.filter(uc => uc.status === 'Deployed').length;
      const total = entityUseCases.length;
      const inDevelopment = entityUseCases.filter(uc => uc.status === 'Development').length;
      
      return {
        id,
        name,
        description: description,
        logo: logo,
        subName: description,
        stats: {
          active: active,
          total: total,
          scientists: Math.floor(Math.random() * 5) + 1, // Avoid 0
          inDevelopment: inDevelopment,
          alerts: Math.floor(Math.random() * 3), // Random alerts
          totalImpact: parseFloat((Math.random() * 10).toFixed(1)),
        },
      };
    });
  } catch (error) {
    console.error("Failed to read or parse entities CSV:", error);
    // Return empty array on failure to prevent app crash
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
  const totalImpactSum = entities.reduce((sum, entity) => sum + entity.stats.totalImpact, 0);
  return { ...summaryMetrics, entities: entities.length, totalCases: useCases.length, totalImpact: totalImpactSum.toFixed(1) };
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
      logo: 'https://placehold.co/48x48/7C3AED/FFFFFF/png?text=LOGO' // default logo
  };
  
  const updatedEntities = [...entities.map(e => ({name: e.name, description: e.description, logo: e.logo})), newEntityData];
  await writeEntitiesToCSV(updatedEntities);

  const id = slugify(newEntityData.name);
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

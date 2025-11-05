import type { Entity, UseCase, UseCaseStatus, SummaryMetrics } from './types';
import fs from 'fs/promises';
import path from 'path';

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

// --- CSV Management ---

const entitiesCsvPath = path.join(process.cwd(), 'public', 'entidades.csv');
const useCasesCsvPath = path.join(process.cwd(), 'public', 'casos.csv');


async function readUseCasesFromCSV(): Promise<UseCase[]> {
  try {
    const fileContent = await fs.readFile(useCasesCsvPath, 'utf8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim() !== '');
    const headerLine = lines.shift();
    if (!headerLine) return [];

    const header = headerLine.replace(/^\uFEFF/, '').trim().split(',');
    if (header.length < 5 || header[0] !== 'Entidad' || header[1] !== 'Caso de Uso' || header[2] !== 'Descripcion' || header[3] !== 'Estado' || header[4] !== 'Ultima Actualizacion') {
      console.error('Invalid use cases CSV header');
      return [];
    }

    return lines.map((line, index) => {
      // Basic CSV parsing, not robust for all cases (e.g., commas in descriptions)
      // For a real app, use a proper CSV parsing library
      const parts = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const [entityName, name, description, status, lastUpdated] = parts.map(p => p.replace(/"/g, '').trim());
      
      return {
        id: slugify(`${entityName}-${name}-${index}`),
        entityId: slugify(entityName),
        name,
        description,
        status: status as UseCaseStatus,
        lastUpdated,
        metrics: { general: [], financial: [], business: [], technical: [] },
      };
    });
  } catch (error) {
    console.error("Failed to read or parse use cases CSV:", error);
    return [];
  }
}

async function readEntitiesFromCSV(allUseCases: UseCase[]): Promise<Entity[]> {
  try {
    const fileContent = await fs.readFile(entitiesCsvPath, 'utf8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim() !== '');;
    const headerLine = lines.shift();
    if (!headerLine) throw new Error('CSV is empty or header is missing');
    
    const header = headerLine.replace(/^\uFEFF/, '').trim().split(',');

    if (header.length < 3 || header[0].trim() !== 'Entidad' || header[1].trim() !== 'descripcion' || header[2].trim() !== 'logo_url') {
        throw new Error('Invalid CSV header. Expected "Entidad,descripcion,logo_url"');
    }

    return lines.map(line => {
      const [name, description, logo] = line.split(',').map(s => s.trim());
      const id = slugify(name);
      
      const entityUseCases = allUseCases.filter(uc => uc.entityId === id);
      const active = entityUseCases.filter(uc => uc.status === 'Deployed').length;
      const total = entityUseCases.length;
      const inDevelopment = entityUseCases.filter(uc => uc.status === 'Development').length;
      const alerts = entityUseCases.length > 0 ? Math.floor(Math.random() * 3) : 0; // Random alerts if use cases exist
      const totalImpact = entityUseCases.length > 0 ? parseFloat((Math.random() * 10).toFixed(1)) : 0;
      
      return {
        id,
        name,
        description: description,
        logo: logo,
        subName: description,
        stats: {
          active,
          total,
          scientists: Math.floor(Math.random() * 5) + 1,
          inDevelopment,
          alerts,
          totalImpact,
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
  await fs.writeFile(entitiesCsvPath, header + rows, 'utf8');
}


export async function getSummaryMetrics(): Promise<SummaryMetrics> {
  await delay(50);
  const allUseCases = await readUseCasesFromCSV();
  const entities = await readEntitiesFromCSV(allUseCases);
  const totalImpactSum = entities.reduce((sum, entity) => sum + entity.stats.totalImpact, 0);
  return { 
    totalCases: allUseCases.length,
    entities: entities.length,
    dataScientists: 26, // This could also be calculated
    totalImpact: totalImpactSum.toFixed(1) 
  };
}

export async function getEntities(): Promise<Entity[]> {
  await delay(100);
  const allUseCases = await readUseCasesFromCSV();
  return await readEntitiesFromCSV(allUseCases);
}

export async function getEntity(id: string): Promise<Entity | undefined> {
  await delay(100);
  const allUseCases = await readUseCasesFromCSV();
  const entities = await readEntitiesFromCSV(allUseCases);
  return entities.find(e => e.id === id);
}

export async function addEntity(data: {name: string, description: string}): Promise<Entity> {
  await delay(500);
  const allUseCases = await readUseCasesFromCSV();
  const entities = await readEntitiesFromCSV(allUseCases);
  const newEntityData = {
      ...data,
      logo: 'https://placehold.co/48x48/7C3AED/FFFFFF/png?text=LOGO'
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
  const allUseCases = await readUseCasesFromCSV();
  return allUseCases.filter(uc => uc.entityId === entityId);
}

export async function getUseCase(id: string): Promise<UseCase | undefined> {
  await delay(100);
  const allUseCases = await readUseCasesFromCSV();
  return allUseCases.find(uc => uc.id === id);
}

export async function addUseCase(entityId: string, data: Omit<UseCase, 'id' | 'entityId' | 'status' | 'lastUpdated' | 'metrics'>): Promise<UseCase> {
  await delay(500);
  // This function would now append to the casos.csv file
  // For simplicity, we'll keep it in-memory for this action, but a real app would write to the file.
  const newUseCase: UseCase = {
    id: String(Date.now()),
    entityId,
    status: 'Development',
    lastUpdated: new Date().toISOString(),
    metrics: { general: [], financial: [], business: [], technical: [] },
    ...data,
  };
  
  const entities = await getEntities();
  const entity = entities.find(e => e.id === entityId);
  if (!entity) throw new Error('Entity not found');

  const row = `\n${entity.name},"${data.name}","${data.description}",${newUseCase.status},${newUseCase.lastUpdated}`;
  await fs.appendFile(useCasesCsvPath, row);
  
  return newUseCase;
}

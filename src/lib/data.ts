import type { Entity, UseCase, UseCaseStatus, SummaryMetrics, Metric } from './types';
import fs from 'fs/promises';
import path from 'path';

// --- API Functions ---

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function slugify(text: string) {
    if (!text) return '';
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
    await fs.access(useCasesCsvPath);
    const fileContent = await fs.readFile(useCasesCsvPath, 'utf8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];

    const headerLine = lines.shift();
    if (!headerLine) return [];

    const header = headerLine.replace(/^\uFEFF/, '').trim().split(';').map(h => h.trim());
    
    const colIndices = {
        entidad: header.indexOf('Entidad'),
        casoDeUso: header.indexOf('Proyecto'),
        descripcion: header.indexOf('Descripcion'),
        estado: header.indexOf('Estado alto nivel'),
        ultimaActualizacion: header.indexOf('Fecha de Entrega')
    };

    if (Object.values(colIndices).some(index => index === -1)) {
        console.error(`Invalid use cases CSV header. Missing one of 'Entidad', 'Proyecto', 'Descripcion', 'Estado alto nivel', 'Fecha de Entrega'. Got "${header.join(';')}"`);
        return [];
    }


    return lines.map((line, index) => {
      const parts = line.split(';');
      const entityName = (parts[colIndices.entidad] || '').trim().replace(/"/g, '');
      const name = (parts[colIndices.casoDeUso] || '').trim().replace(/"/g, '');
      const description = (parts[colIndices.descripcion] || 'No description available').trim().replace(/"/g, '');
      const status = (parts[colIndices.estado] || 'Development').trim().replace(/"/g, '') as UseCaseStatus;
      const lastUpdated = (parts[colIndices.ultimaActualizacion] || new Date().toISOString()).trim().replace(/"/g, '');

      const entityId = slugify(entityName);
      const useCaseId = slugify(`${entityName}-${name}-${index}`);
      
      const generateMetrics = (): Metric[] => [
          { label: 'Users', value: Math.floor(Math.random() * 1000), unit: 'k' },
          { label: 'ROI', value: Math.floor(Math.random() * 200), unit: '%' },
      ];

      return {
        id: useCaseId,
        entityId: entityId,
        name,
        description,
        status: status,
        lastUpdated,
        metrics: { 
          general: generateMetrics(),
          financial: generateMetrics(),
          business: generateMetrics(),
          technical: generateMetrics(),
        },
      };
    }).filter(uc => uc.entityId && uc.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.writeFile(useCasesCsvPath, 'Entidad;Caso de Uso;Descripcion;Estado;Ultima Actualizacion\n', 'utf8');
        return [];
    }
    console.error("Failed to read or parse use cases CSV:", error);
    return [];
  }
}

async function readEntitiesFromCSV(allUseCases: UseCase[]): Promise<Entity[]> {
  try {
    await fs.access(entitiesCsvPath);
    const fileContent = await fs.readFile(entitiesCsvPath, 'utf8');
    const lines = fileContent.trim().split('\n').filter(line => line.trim() !== '');
    if (lines.length <= 1) return [];

    const headerLine = lines.shift();
    if (!headerLine) throw new Error('CSV is empty or header is missing');
    
    const header = headerLine.replace(/^\uFEFF/, '').trim().split(',');

    if (header.length < 3 || header[0].trim() !== 'Entidad' || header[1].trim() !== 'descripcion' || header[2].trim() !== 'logo_url') {
        throw new Error(`Invalid entities CSV header. Expected "Entidad,descripcion,logo_url", but got "${header.join(',')}"`);
    }

    return lines.map(line => {
      const [name, description, logo] = line.split(',').map(s => (s || '').trim().replace(/"/g, ''));
      const id = slugify(name);
      
      const entityUseCases = allUseCases.filter(uc => uc.entityId === id);
      const active = entityUseCases.filter(uc => uc.status === 'Deployed').length;
      const total = entityUseCases.length;
      const inDevelopment = entityUseCases.filter(uc => uc.status === 'Development').length;
      const alerts = entityUseCases.length > 0 ? Math.floor(Math.random() * 3) : 0; // Random alerts if use cases exist
      const totalImpact = entityUseCases.reduce((acc, curr) => acc + (Math.random() * 5), 0);
      
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
          totalImpact: parseFloat(totalImpact.toFixed(1)),
        },
      };
    });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.writeFile(entitiesCsvPath, 'Entidad,descripcion,logo_url\n', 'utf8');
        return [];
    }
    console.error("Failed to read or parse entities CSV:", error);
    return [];
  }
}

async function writeEntitiesToCSV(entities: Omit<Entity, 'id' | 'stats' | 'subName'>[]): Promise<void> {
  const header = 'Entidad,descripcion,logo_url\n';
  const rows = entities.map(e => `"${e.name}","${e.description}","${e.logo}"`).join('\n');
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
      logo: ''
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
  const useCase = allUseCases.find(uc => uc.id === id);
  if (useCase) {
    // If metrics are empty, generate some for demonstration
    if (useCase.metrics.general.length === 0) {
      const generateMetrics = (): Metric[] => [
        { label: 'Active Users', value: Math.floor(Math.random() * 5000), unit: '' },
        { label: 'Adoption Rate', value: Math.floor(Math.random() * 100), unit: '%' },
        { label: 'Avg. Session', value: Math.floor(Math.random() * 30), unit: 'min' },
      ];
      useCase.metrics = {
        general: generateMetrics(),
        financial: generateMetrics(),
        business: generateMetrics(),
        technical: generateMetrics(),
      };
    }
  }
  return useCase;
}

export async function addUseCase(entityId: string, data: Omit<UseCase, 'id' | 'entityId' | 'status' | 'lastUpdated' | 'metrics'>): Promise<UseCase> {
  await delay(500);
  
  const entities = await getEntities();
  const entity = entities.find(e => e.id === entityId);
  if (!entity) throw new Error('Entity not found');

  const newUseCase: UseCase = {
    id: slugify(`${entity.name}-${data.name}-${Date.now()}`),
    entityId,
    status: 'Development',
    lastUpdated: new Date().toISOString(),
    metrics: { general: [], financial: [], business: [], technical: [] },
    ...data,
  };
  
  const row = `\n"${entity.name}";"${data.name}";"${data.description}";${newUseCase.status};${newUseCase.lastUpdated}`;
  await fs.appendFile(useCasesCsvPath, row);
  
  return newUseCase;
}

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
    
    // Map column names from casos.csv
    const colIndices = {
        entidad: header.findIndex(h => h.toLowerCase().includes('entidad')),
        proyecto: header.findIndex(h => h.toLowerCase().includes('proyecto')),
        estado: header.findIndex(h => h.toLowerCase() === 'estado'),
        estadoAltoNivel: header.findIndex(h => h.toLowerCase().includes('estado alto nivel')),
        tipo: header.findIndex(h => h.toLowerCase().includes('tipo proyecto')),
        observaciones: header.findIndex(h => h.toLowerCase().includes('observaciones')),
        ds1: header.findIndex(h => h === 'DS1'),
        de: header.findIndex(h => h === 'DE'),
        nivelImpacto: header.findIndex(h => h.toLowerCase().includes('nivel impacto')),
        unidadImpacto: header.findIndex(h => h.toLowerCase().includes('unidad del impacto')),
        impactoFinanciero: header.findIndex(h => h.toLowerCase().includes('impacto financiero') && !h.toLowerCase().includes('nivel') && !h.toLowerCase().includes('unidad')),
        sharepointLink: header.findIndex(h => h.toLowerCase().includes('sharepoint link')),
        jiraLink: header.findIndex(h => h.toLowerCase().includes('jira link')),
        confluenceLink: header.findIndex(h => h.toLowerCase().includes('confluence link'))
    };

    if (colIndices.entidad === -1 || colIndices.proyecto === -1) {
        console.error(`Invalid use cases CSV header. Missing 'Entidad' or 'Proyecto' columns.`);
        return [];
    }

    return lines.map((line, index) => {
      const parts = line.split(';');
      const entityName = (parts[colIndices.entidad] || '').trim().replace(/"/g, '');
      const proyecto = (parts[colIndices.proyecto] || '').trim().replace(/"/g, '');
      const estado = (parts[colIndices.estado] !== undefined ? parts[colIndices.estado] : '').trim().replace(/"/g, '');
      const estadoAltoNivel = (parts[colIndices.estadoAltoNivel] !== undefined ? parts[colIndices.estadoAltoNivel] : '').trim().replace(/"/g, '');
      const tipo = (parts[colIndices.tipo] !== undefined ? parts[colIndices.tipo] : '').trim().replace(/"/g, '');
      const observaciones = (parts[colIndices.observaciones] !== undefined ? parts[colIndices.observaciones] : 'Sin observaciones').trim().replace(/"/g, '');
      const ds1 = (parts[colIndices.ds1] !== undefined ? parts[colIndices.ds1] : '').trim().replace(/"/g, '');
      const de = (parts[colIndices.de] !== undefined ? parts[colIndices.de] : '').trim().replace(/"/g, '');
      const nivelImpacto = (parts[colIndices.nivelImpacto] !== undefined ? parts[colIndices.nivelImpacto] : '').trim().replace(/"/g, '');
      const unidadImpacto = (parts[colIndices.unidadImpacto] !== undefined ? parts[colIndices.unidadImpacto] : '').trim().replace(/"/g, '');
      const impactoFinanciero = (parts[colIndices.impactoFinanciero] !== undefined ? parts[colIndices.impactoFinanciero] : '').trim().replace(/"/g, '');
      const sharepointLink = (parts[colIndices.sharepointLink] !== undefined ? parts[colIndices.sharepointLink] : '').trim().replace(/"/g, '');
      const jiraLink = (parts[colIndices.jiraLink] !== undefined ? parts[colIndices.jiraLink] : '').trim().replace(/"/g, '');
      const confluenceLink = (parts[colIndices.confluenceLink] !== undefined ? parts[colIndices.confluenceLink] : '').trim().replace(/"/g, '');

      const entityId = slugify(entityName);
      const useCaseId = slugify(`${entityName}-${proyecto}`);
      
      // Build team members
      const teamMembers = [];
      if (ds1) teamMembers.push({ role: 'DS Principal', name: ds1 });
      if (de) teamMembers.push({ role: 'Ingeniero', name: de });

      // Build metrics from CSV data
      const generalMetrics: Metric[] = [
        { label: 'Estado', value: estado || 'Sin estado' },
        { label: 'Tipo', value: tipo || 'Sin tipo' }
      ];

      const financialMetrics: Metric[] = [];
      if (nivelImpacto) financialMetrics.push({ label: 'Nivel', value: nivelImpacto });
      if (impactoFinanciero && unidadImpacto) {
        financialMetrics.push({ label: 'Impacto', value: impactoFinanciero, unit: unidadImpacto });
      }

      const businessMetrics: Metric[] = [];
      if (sharepointLink) businessMetrics.push({ label: 'SharePoint', value: sharepointLink });
      if (jiraLink) businessMetrics.push({ label: 'Jira', value: jiraLink });
      if (confluenceLink) businessMetrics.push({ label: 'Confluence', value: confluenceLink });

      return {
        id: useCaseId,
        entityId: entityId,
        name: proyecto,
        description: observaciones,
        status: estado as UseCaseStatus,
        highLevelStatus: estadoAltoNivel || 'Inactivo',
        lastUpdated: new Date().toISOString(),
        metrics: { 
          general: generalMetrics,
          financial: financialMetrics,
          business: businessMetrics,
          technical: teamMembers.map(tm => ({ label: tm.role, value: tm.name })),
        },
      };
    }).filter(uc => uc.entityId && uc.name);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await fs.writeFile(useCasesCsvPath, 'Entidad;Proyecto;Estado\n', 'utf8');
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
    
    const header = headerLine.replace(/^\uFEFF/, '').trim().split(',').map(h => h.trim());

    const colIndices = {
      entidad: header.findIndex(h => h.toLowerCase() === 'entidad'),
      descripcion: header.findIndex(h => h.toLowerCase() === 'descripcion'),
      logo_url: header.findIndex(h => h.toLowerCase() === 'logo_url'),
      color: header.findIndex(h => h.toLowerCase() === 'color')
    };

    if (colIndices.entidad === -1) {
        throw new Error(`Invalid entities CSV header. Missing 'Entidad' column.`);
    }

    return lines.map(line => {
      // Split by comma but handle URLs that may contain commas
      const parts = line.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
      const cleanParts = parts.map(p => p.trim().replace(/^"|"$/g, ''));
      
      const name = cleanParts[colIndices.entidad] || '';
      const description = cleanParts[colIndices.descripcion] || '';
      const logo = cleanParts[colIndices.logo_url] || '';
      
      const id = slugify(name);
      
      const entityUseCases = allUseCases.filter(uc => uc.entityId === id);
      // Count only active cases (highLevelStatus === 'Activo')
      const activeUseCases = entityUseCases.filter(uc => uc.highLevelStatus === 'Activo');
      const active = activeUseCases.filter(uc => {
        const status = uc.status.toLowerCase();
        return status.includes('finalizado') || status.includes('entregado') || status.includes('deployed');
      }).length;
      const total = activeUseCases.length;
      const inDevelopment = activeUseCases.filter(uc => {
        const status = uc.status.toLowerCase();
        return status.includes('desarrollo') || status.includes('development');
      }).length;
      const alerts = activeUseCases.length > 0 ? Math.floor(Math.random() * 3) : 0;
      const totalImpact = activeUseCases.reduce((acc, curr) => acc + (Math.random() * 5), 0);
      
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
  const activeCases = allUseCases.filter(uc => uc.highLevelStatus === 'Activo');
  const entities = await readEntitiesFromCSV(allUseCases);
  const totalImpactSum = entities.reduce((sum, entity) => sum + entity.stats.totalImpact, 0);
  return { 
    totalCases: activeCases.length, // Only count active cases
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

export async function getUseCases(entityId: string, highLevelStatusFilter?: string): Promise<UseCase[]> {
  await delay(100);
  const allUseCases = await readUseCasesFromCSV();
  let filtered = allUseCases.filter(uc => uc.entityId === entityId);
  
  if (highLevelStatusFilter && highLevelStatusFilter !== 'all') {
    filtered = filtered.filter(uc => uc.highLevelStatus === highLevelStatusFilter);
  }
  
  return filtered;
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

export async function addUseCase(entityId: string, data: Omit<UseCase, 'id' | 'entityId' | 'status' | 'highLevelStatus' | 'lastUpdated' | 'metrics'>): Promise<UseCase> {
  await delay(500);
  
  const entities = await getEntities();
  const entity = entities.find(e => e.id === entityId);
  if (!entity) throw new Error('Entity not found');

  const newUseCase: UseCase = {
    id: slugify(`${entity.name}-${data.name}-${Date.now()}`),
    entityId,
    status: 'Development',
    highLevelStatus: 'Activo',
    lastUpdated: new Date().toISOString(),
    metrics: { general: [], financial: [], business: [], technical: [] },
    ...data,
  };
  
  const row = `\n"${entity.name}";"${data.name}";"${data.description}";${newUseCase.status};${newUseCase.lastUpdated}`;
  await fs.appendFile(useCasesCsvPath, row);
  
  return newUseCase;
}

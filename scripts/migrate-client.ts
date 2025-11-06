// Alternative migration script using client SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase with client SDK
const firebaseConfig = {
  apiKey: "AIzaSyDxkgZvcAb25XleRDy6jB-k17lBegxn8gM",
  authDomain: "augusta-edge-project.firebaseapp.com",
  projectId: "augusta-edge-project",
  storageBucket: "augusta-edge-project.firebasestorage.app",
  messagingSenderId: "294010717824",
  appId: "1:294010717824:web:03757f0965075af54c0865"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// CSV Parser (same robust parser)
function parseCSVLine(line: string, delimiter: string = ';'): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parseCSV(content: string, delimiter: string = ';'): string[][] {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  
  const lines: string[] = [];
  let currentLine = '';
  let inQuotes = false;
  
  for (let i = 0; i < content.length; i++) {
    const char = content[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
      currentLine += char;
    } else if (char === '\n' && !inQuotes) {
      if (currentLine.trim()) {
        lines.push(currentLine);
      }
      currentLine = '';
    } else if (char === '\r') {
      continue;
    } else {
      currentLine += char;
    }
  }
  
  if (currentLine.trim()) {
    lines.push(currentLine);
  }
  
  return lines.map(line => parseCSVLine(line, delimiter));
}

function readEntitiesFromCSV(): any[] {
  const csvPath = path.join(process.cwd(), 'public', 'entidades.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  
  if (rows.length === 0) return [];
  
  const headers = rows[0].map(h => h.trim());
  const entities: any[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const entity: any = {};
    
    headers.forEach((header, index) => {
      entity[header] = row[index] || '';
    });
    
    entities.push(entity);
  }
  
  return entities;
}

function readUseCasesFromCSV(): any[] {
  const csvPath = path.join(process.cwd(), 'public', 'casos.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content);
  
  if (rows.length === 0) return [];
  
  const headers = rows[0].map(h => h.trim());
  const useCases: any[] = [];
  
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const useCase: any = {};
    
    headers.forEach((header, index) => {
      useCase[header] = row[index] || '';
    });
    
    useCases.push(useCase);
  }
  
  return useCases;
}

async function migrateEntities() {
  console.log('📥 Reading entities from CSV...');
  const entities = readEntitiesFromCSV();
  console.log(`Found ${entities.length} entities`);
  
  let count = 0;
  
  for (const entity of entities) {
    const entityId = entity['ID Entidad'] || `entity-${count}`;
    const entityRef = doc(db, 'entities', entityId);
    
    const entityData = {
      id: entityId,
      name: entity['Nombre Entidad'] || '',
      description: entity['Descripción'] || '',
      logo: entity['Logo'] || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(entityRef, entityData);
    count++;
    
    if (count % 5 === 0) {
      console.log(`✅ Migrated ${count} entities...`);
    }
  }
  
  console.log(`✅ Successfully migrated ${count} entities`);
  return count;
}

async function migrateUseCases() {
  console.log('📥 Reading use cases from CSV...');
  const useCases = readUseCasesFromCSV();
  console.log(`Found ${useCases.length} use cases`);
  
  let count = 0;
  const INITIAL_PERIOD = '2024-Q4';
  
  for (const useCase of useCases) {
    const entityId = useCase['ID Entidad'] || '';
    const useCaseId = useCase['ID Proyecto'] || `case-${count}`;
    
    if (!entityId) {
      console.warn(`⚠️  Skipping use case without entity ID: ${useCaseId}`);
      continue;
    }
    
    const useCaseRef = doc(db, 'entities', entityId, 'useCases', useCaseId);
    
    const useCaseData = {
      id: useCaseId,
      entityId: entityId,
      name: useCase['Nombre Proyecto'] || '',
      description: useCase['Descripción'] || '',
      status: useCase['Estado'] || '',
      highLevelStatus: useCase['Estado alto nivel'] || '',
      tipoProyecto: useCase['Tipo Proyecto'] || '',
      tipoDesarrollo: useCase['Tipo Desarrollo'] || '',
      observaciones: useCase['Observaciones'] || '',
      sharepoint: useCase['Sharepoint'] || '',
      jira: useCase['Jira'] || '',
      actividadesSharepoint: useCase['# Actividades Sharepoint'] || '',
      actividadesJira: useCase['# Actividades Jira'] || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(useCaseRef, useCaseData);
    
    // Create metrics subcollection
    const metricsRef = doc(db, 'entities', entityId, 'useCases', useCaseId, 'metrics', INITIAL_PERIOD);
    
    const metricsData = {
      period: INITIAL_PERIOD,
      general: [
        { label: 'Fecha de Estimación', value: useCase['Fecha de Estimación'] || '' },
        { label: 'Fecha de Inicio', value: useCase['Fecha de Inicio'] || '' },
        { label: 'Fecha de Finalización Estimada', value: useCase['Fecha de Finalización Estimada'] || '' },
        { label: 'Fecha de Salida a Producción', value: useCase['Fecha de Salida a Producción'] || '' },
        { label: 'Fecha de Terminación', value: useCase['Fecha de Terminación'] || '' },
        { label: 'Cantidad de DS', value: useCase['Cantidad de DS'] || '' },
        { label: 'Cantidad de Modelos', value: useCase['Cantidad de Modelos'] || '' },
        { label: 'Cantidad de Apis', value: useCase['Cantidad de Apis'] || '' },
        { label: 'Cantidad de Tableros', value: useCase['Cantidad de Tableros'] || '' },
      ],
      financial: [
        { label: 'Fee Proyecto', value: useCase['Fee Proyecto'] || '' },
        { label: 'Fee DevOps', value: useCase['Fee DevOps'] || '' },
        { label: 'Fee MLOps', value: useCase['Fee MLOps'] || '' },
        { label: 'Fee Mantenimiento', value: useCase['Fee Mantenimiento'] || '' },
        { label: 'Fee Consultoría', value: useCase['Fee Consultoría'] || '' },
        { label: 'Fee MCA', value: useCase['Fee MCA'] || '' },
        { label: 'Fee Total', value: useCase['Fee Total'] || '' },
        { label: 'Margen %', value: useCase['Margen %'] || '' },
      ],
      business: [
        { label: 'Ahorro Anual', value: useCase['Ahorro Anual'] || '' },
        { label: 'Ahorro Anual sin fee', value: useCase['Ahorro Anual sin fee'] || '' },
        { label: 'Ingreso Anual Esperado', value: useCase['Ingreso Anual Esperado'] || '' },
        { label: 'Payback', value: useCase['Payback'] || '' },
        { label: 'Impacto Clientes', value: useCase['Impacto Clientes'] || '' },
        { label: 'Impacto Clientes con Modelo Implementado', value: useCase['Impacto Clientes con Modelo Implementado'] || '' },
        { label: 'Impacto Colaboradores', value: useCase['Impacto Colaboradores'] || '' },
      ],
      technical: [
        { label: 'Tipo de Problema', value: useCase['Tipo de Problema'] || '' },
        { label: 'Plataforma', value: useCase['Plataforma'] || '' },
        { label: 'Fase', value: useCase['Fase'] || '' },
        { label: 'Estratégico / No Estratégico', value: useCase['Estratégico / No Estratégico'] || '' },
        { label: 'Familia del Caso de Uso', value: useCase['Familia del Caso de Uso'] || '' },
        { label: 'Madurez del Caso de Uso', value: useCase['Madurez del Caso de Uso'] || '' },
        { label: 'NPS', value: useCase['NPS'] || '' },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(metricsRef, metricsData);
    
    count++;
    if (count % 10 === 0) {
      console.log(`✅ Migrated ${count} use cases...`);
    }
  }
  
  console.log(`✅ Successfully migrated ${count} use cases with metrics`);
  return count;
}

async function migrate() {
  console.log('🚀 Starting migration from CSV to Firestore (Client SDK)...\n');
  
  try {
    const entitiesCount = await migrateEntities();
    console.log('');
    const useCasesCount = await migrateUseCases();
    
    console.log('\n✨ Migration completed successfully!');
    console.log(`   📊 Entities: ${entitiesCount}`);
    console.log(`   📊 Use Cases: ${useCasesCount}`);
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();

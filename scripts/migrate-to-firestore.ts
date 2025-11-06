// Migration script to transfer data from CSV to Firestore
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

const db = admin.firestore();

// CSV Parser (same robust parser from data.ts)
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
  // Remove BOM if present
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

// Helper function to create a valid Firestore document ID from a string
function createValidDocId(str: string): string {
  if (!str) return '';
  
  return str
    .toLowerCase()
    .normalize('NFD') // Normalize to decomposed form
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100); // Limit length
}

// Read and parse CSV files
function readEntitiesFromCSV(): any[] {
  const csvPath = path.join(process.cwd(), 'public', 'entidades.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content, ','); // Use comma delimiter
  
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
  const rows = parseCSV(content, ';'); // Use semicolon delimiter for casos.csv
  
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

// Migration functions
async function migrateEntities() {
  console.log('📥 Reading entities from CSV...');
  const entities = readEntitiesFromCSV();
  console.log(`Found ${entities.length} entities`);
  
  const batch = db.batch();
  let count = 0;
  
  for (const entity of entities) {
    const entityName = entity['Entidad'] || entity['ID Entidad'] || '';
    const entityId = createValidDocId(entityName) || `entity-${count}`;
    const entityRef = db.collection('entities').doc(entityId);
    
    const entityData = {
      id: entityId,
      name: entityName,
      description: entity['descripcion'] || entity['Descripción'] || '',
      logo: entity['logo_url'] || entity['Logo'] || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    batch.set(entityRef, entityData);
    count++;
    
    // Firestore batch limit is 500 operations
    if (count % 400 === 0) {
      await batch.commit();
      console.log(`✅ Migrated ${count} entities...`);
    }
  }
  
  await batch.commit();
  console.log(`✅ Successfully migrated ${count} entities`);
  return count;
}

async function migrateUseCases() {
  console.log('📥 Reading use cases from CSV...');
  const useCases = readUseCasesFromCSV();
  console.log(`Found ${useCases.length} use cases`);
  
  let count = 0;
  const INITIAL_PERIOD = '2024-Q4'; // Initial period for all existing data
  
  // Process in smaller batches due to nested writes
  for (const useCase of useCases) {
    const entityName = useCase['Entidad'] || useCase['ID Entidad'] || '';
    const entityId = createValidDocId(entityName);
    const projectName = useCase['Proyecto'] || '';
    const useCaseId = createValidDocId(projectName) || `case-${count}`;
    
    if (!entityId) {
      console.warn(`⚠️ Skipping use case without entity ID: ${useCaseId}`);
      continue;
    }
    
    const useCaseRef = db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId);
    
    // Main use case data
    const useCaseData = {
      id: useCaseId,
      entityId: entityId,
      name: useCase['Proyecto'] || useCase['Nombre Proyecto'] || '',
      description: useCase['Observaciones'] || useCase['Descripción'] || '',
      status: useCase['Estado'] || '',
      highLevelStatus: useCase['Estado alto nivel'] || '',
      tipoProyecto: useCase['Tipo Proyecto'] || '',
      tipoDesarrollo: useCase['Tipo Desarrollo'] || '',
      observaciones: useCase['Observaciones'] || '',
      sharepoint: useCase['Sharepoint Link'] || useCase['Sharepoint'] || '',
      jira: useCase['Jira Link'] || useCase['Jira'] || '',
      actividadesSharepoint: useCase['Sharepoint Actividades'] || useCase['# Actividades Sharepoint'] || '',
      actividadesJira: useCase['Jira Actividades'] || useCase['# Actividades Jira'] || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await useCaseRef.set(useCaseData);
    
    // Create metrics subcollection with initial period
    const metricsRef = useCaseRef.collection('metrics').doc(INITIAL_PERIOD);
    
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
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await metricsRef.set(metricsData);
    
    count++;
    if (count % 10 === 0) {
      console.log(`✅ Migrated ${count} use cases...`);
    }
  }
  
  console.log(`✅ Successfully migrated ${count} use cases with metrics`);
  return count;
}

// Delete all existing data
async function cleanupOldData() {
  console.log('🗑️  Cleaning up old data...');
  
  const entitiesSnapshot = await db.collection('entities').get();
  const batch = db.batch();
  let count = 0;
  
  for (const doc of entitiesSnapshot.docs) {
    // Delete all subcollections first
    const useCasesSnapshot = await doc.ref.collection('useCases').get();
    for (const useCaseDoc of useCasesSnapshot.docs) {
      const metricsSnapshot = await useCaseDoc.ref.collection('metrics').get();
      metricsSnapshot.docs.forEach(metricDoc => {
        batch.delete(metricDoc.ref);
      });
      batch.delete(useCaseDoc.ref);
    }
    batch.delete(doc.ref);
    count++;
  }
  
  await batch.commit();
  console.log(`✅ Deleted ${count} entities and their subcollections\n`);
}

// Main migration
async function migrate() {
  console.log('🚀 Starting migration from CSV to Firestore...\n');
  
  try {
    await cleanupOldData();
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

// Migration script to transfer data from CSV to Firestore
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
});

const db = admin.firestore();

// CSV Parser
function parseCSVLine(line: string, delimiter: string = ';'): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '"')) {
        inQuotes = !inQuotes;
        continue;
    }
    if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

function parseCSV(content: string, delimiter: string = ';'): string[][] {
  if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
  }
  const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
  return lines.map(line => parseCSVLine(line, delimiter));
}


// Helper function to create a valid Firestore document ID from a string
function createValidDocId(str: string): string {
  if (!str) return '';
  const slug = str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-');
  return slug || `item-${Date.now()}`;
}

// Read and parse CSV files
function readEntitiesFromCSV(): any[] {
  const csvPath = path.join(process.cwd(), 'public', 'entidades.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const rows = parseCSV(content, ','); // Use comma delimiter
  
  if (rows.length < 2) return [];
  
  const headers = rows.shift()!.map(h => h.trim());
  const entities: any[] = [];
  
  for (const row of rows) {
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
  const rows = parseCSV(content, ';'); // Use semicolon delimiter
  
  if (rows.length < 2) return [];
  
  const headers = rows.shift()!.map(h => h.trim());
  const useCases: any[] = [];
  
  for (const row of rows) {
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
    const entityName = entity['Entidad'] || '';
    const entityId = createValidDocId(entityName);
    
    if (!entityId) {
        console.warn(`⚠️  Skipping entity with no name.`);
        continue;
    }
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
  const INITIAL_PERIOD = '2024-Q4';
  
  for (const useCase of useCases) {
    const entityName = useCase['Entidad'] || '';
    const projectName = useCase['Proyecto'] || '';
    
    const entityId = createValidDocId(entityName);
    const useCaseId = createValidDocId(projectName);
    
    if (!entityId || !useCaseId) {
      console.warn(`⚠️ Skipping use case without entity or project name: ${entityName} / ${projectName}`);
      continue;
    }
    
    const useCaseRef = db.collection('entities').doc(entityId).collection('useCases').doc(useCaseId);
    
    const useCaseData = {
      id: useCaseId,
      entityId: entityId,
      name: projectName,
      description: useCase['Observaciones'] || useCase['Descripción'] || '',
      status: useCase['Estado'] || 'En Estimación',
      highLevelStatus: useCase['Estado alto nivel'] || 'Activo',
      tipoProyecto: useCase['Tipo Proyecto'] || 'No definido',
      tipoDesarrollo: useCase['Tipo Desarrollo'] || 'No definido',
      observaciones: useCase['Observaciones'] || '',
      sharepoint: useCase['Sharepoint Link'] || useCase['Sharepoint'] || '',
      jira: useCase['Jira Link'] || useCase['Jira'] || '',
      actividadesSharepoint: useCase['Sharepoint Actividades'] || useCase['# Actividades Sharepoint'] || '',
      actividadesJira: useCase['Jira Actividades'] || useCase['# Actividades Jira'] || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await useCaseRef.set(useCaseData);
    
    const metricsRef = useCaseRef.collection('metrics').doc(INITIAL_PERIOD);
    
    const metricsData = {
      period: INITIAL_PERIOD,
      general: [
        { label: 'Fecha de Estimación', value: useCase['Fecha de Estimación'] || '' },
        { label: 'Fecha de Inicio', value: useCase['Fecha de Inicio'] || '' },
        { label: 'Fecha de Finalización Estimada', value: useCase['Fecha de Finalización Estimada'] || '' },
        { label: 'Fecha de Salida a Producción', value: useCase['Fecha de Salida a Producción'] || '' },
        { label: 'Fecha de Terminación', value: useCase['Fecha de Terminación'] || '' },
        { label: 'Cantidad de DS', value: useCase['Cantidad de DS'] || '0' },
        { label: 'Cantidad de Modelos', value: useCase['Cantidad de Modelos'] || '0' },
        { label: 'Cantidad de Apis', value: useCase['Cantidad de Apis'] || '0' },
        { label: 'Cantidad de Tableros', value: useCase['Cantidad de Tableros'] || '0' },
      ],
      financial: [
        { label: 'Fee Proyecto', value: useCase['Fee Proyecto'] || '0' },
        { label: 'Fee DevOps', value: useCase['Fee DevOps'] || '0' },
        { label: 'Fee MLOps', value: useCase['Fee MLOps'] || '0' },
        { label: 'Fee Mantenimiento', value: useCase['Fee Mantenimiento'] || '0' },
        { label: 'Fee Consultoría', value: useCase['Fee Consultoría'] || '0' },
        { label: 'Fee MCA', value: useCase['Fee MCA'] || '0' },
        { label: 'Fee Total', value: useCase['Fee Total'] || '0' },
        { label: 'Margen %', value: useCase['Margen %'] || '0' },
      ],
      business: [
        { label: 'Ahorro Anual', value: useCase['Ahorro Anual'] || '0' },
        { label: 'Ahorro Anual sin fee', value: useCase['Ahorro Anual sin fee'] || '0' },
        { label: 'Ingreso Anual Esperado', value: useCase['Ingreso Anual Esperado'] || '0' },
        { label: 'Payback', value: useCase['Payback'] || '0' },
        { label: 'Impacto Clientes', value: useCase['Impacto Clientes'] || '0' },
        { label: 'Impacto Clientes con Modelo Implementado', value: useCase['Impacto Clientes con Modelo Implementado'] || '0' },
        { label: 'Impacto Colaboradores', value: useCase['Impacto Colaboradores'] || '0' },
      ],
      technical: [
        { label: 'Tipo de Problema', value: useCase['Tipo de Problema'] || 'No definido' },
        { label: 'Plataforma', value: useCase['Plataforma'] || 'No definida' },
        { label: 'Fase', value: useCase['Fase'] || 'No definida' },
        { label: 'Estratégico / No Estratégico', value: useCase['Estratégico / No Estratégico'] || 'No definido' },
        { label: 'Familia del Caso de Uso', value: useCase['Familia del Caso de Uso'] || 'No definida' },
        { label: 'Madurez del Caso de Uso', value: useCase['Madurez del Caso de Uso'] || 'No definida' },
        { label: 'NPS', value: useCase['NPS'] || '0' },
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


async function cleanupOldData() {
  console.log('🗑️  Cleaning up old data...');
  const collections = ['entities'];
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    if (snapshot.empty) continue;
    
    const batch = db.batch();
    for (const doc of snapshot.docs) {
      const useCasesSnapshot = await doc.ref.collection('useCases').get();
      for (const useCaseDoc of useCasesSnapshot.docs) {
        const metricsSnapshot = await useCaseDoc.ref.collection('metrics').get();
        metricsSnapshot.docs.forEach(mDoc => batch.delete(mDoc.ref));
        batch.delete(useCaseDoc.ref);
      }
      batch.delete(doc.ref);
    }
    await batch.commit();
    console.log(`✅ Deleted all documents and subcollections in ${collectionName}`);
  }
  console.log('✅ Cleanup complete');
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

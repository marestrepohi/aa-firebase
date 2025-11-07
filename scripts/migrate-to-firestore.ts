// Migration script to transfer data from CSV to Firestore
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.appspot.com`,
});

const db = admin.firestore();

function parseCSV(content: string, delimiter: string = ','): string[][] {
    if (content.charCodeAt(0) === 0xFEFF) {
        content = content.slice(1);
    }
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentField = '';
    let inQuotedField = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"' && nextChar === '"') {
            currentField += '"';
            i++;
            continue;
        }

        if (char === '"') {
            inQuotedField = !inQuotedField;
            continue;
        }

        if (char === delimiter && !inQuotedField) {
            currentRow.push(currentField);
            currentField = '';
            continue;
        }

        if ((char === '\n' || char === '\r') && !inQuotedField) {
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
            if (currentField.length > 0 || currentRow.length > 0) {
              currentRow.push(currentField);
              rows.push(currentRow);
              currentRow = [];
              currentField = '';
            }
            continue;
        }
        currentField += char;
    }

    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
    }

    return rows.filter(row => row.some(field => field.trim() !== ''));
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
    .replace(/[^\w.-]+/g, '') // Keep dots
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
    const entityName = useCase['entidad'] || '';
    const projectName = useCase['proyecto'] || '';
    
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
      description: useCase['observaciones'] || '',
      etapa: useCase['etapa'] || '',
      status: useCase['estado'] || 'En Estimación',
      highLevelStatus: useCase['estadoAltoNivel'] || 'Activo',
      estadoDesarrolloMante: useCase['estadoDesarrolloMante'] || '',
      subtarea: useCase['subtarea'] || '',
      idFinanciera: useCase['idFinanciera'] || '',
      tipoProyecto: useCase['tipoProyecto'] || 'No definido',
      suite: useCase['suite'] || '',
      tipoDesarrollo: useCase['tipoDesarrollo'] || 'No definido',
      observaciones: useCase['observaciones'] || '',
      sharepoint: useCase['sharepointLink'] || '',
      jira: useCase['jiraLink'] || '',
      confluenceLink: useCase['confluenceLink'] || '',
      mantenimiento: useCase['mantenimiento'] || '',
      dsEntidad: useCase['DsEntidad'] || '',
      sponsor: useCase['sponsor'] || '',
      mainContact: useCase['mainContact'] || '',
      sandbox: useCase['sandbox'] || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await useCaseRef.set(useCaseData, { merge: true });
    
    const metricsRef = useCaseRef.collection('metrics').doc(INITIAL_PERIOD);
    
    const metricsData = {
      period: INITIAL_PERIOD,
      general: [
        { label: 'Fecha de Inicio', value: useCase['fechaInicio'] || '' },
        { label: 'Fecha de Entrega', value: useCase['fechaEntrega'] || '' },
        { label: 'Tallaje', value: useCase['tallaje'] || '0' },
        { label: 'Horas Totales Tallaje', value: useCase['totalHorasTallaje'] || '0' },
        { label: '% Horas Semana', value: useCase['horasSemanaPorcentaje'] || '0' },
      ],
      financial: [
        { label: 'Nivel', value: useCase['nivelImpactoFinanciero'] || '' },
        { label: 'Unidad', value: useCase['unidadImpactoFinanciero'] || '' },
        { label: 'Impacto', value: useCase['impactoFinanciero'] || '0' },
        { label: 'ADL', value: useCase['financieroAdl'] || '0' },
        { label: 'Entidad', value: useCase['financieroEntidad'] || '0' },
      ],
      business: [
        { label: 'Sponsor', value: useCase['sponsor'] || '' },
        { label: 'Main Contact', value: useCase['mainContact'] || '' },
        { label: 'Sandbox', value: useCase['sandbox'] || '' },
      ],
      technical: [
        { label: 'DS1', value: useCase['ds1'] || '' },
        { label: 'DS2', value: useCase['ds2'] || '' },
        { label: 'DS3', value: useCase['ds3'] || '' },
        { label: 'DS4', value: useCase['ds4'] || '' },
        { label: 'DE', value: useCase['de'] || '' },
        { label: 'MDS', value: useCase['mds'] || '' },
        { label: 'Mantenimiento', value: useCase['mantenimiento'] || '' },
        { label: 'Horas DS1', value: useCase['horasDs1'] || '0' },
        { label: 'Horas DS2', value: useCase['horasDS2'] || '0' },
        { label: 'Horas DS3', value: useCase['horasDS3'] || '0' },
        { label: 'Horas DS4', value: useCase['horasDS4'] || '0' },
      ],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    await metricsRef.set(metricsData, { merge: true });
    
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

// Migration script to transfer data from CSV to local JSON storage
import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data');

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function writeJsonFile(filePath: string, data: any): void {
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function parseCSV(content: string, delimiter: string = ','): string[][] {
    // Handle BOM
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

        // Handle escaped quotes inside quoted fields
        if (char === '"' && nextChar === '"') {
            currentField += '"';
            i++;
            continue;
        }

        // Toggle quoted field mode
        if (char === '"') {
            inQuotedField = !inQuotedField;
            continue;
        }

        // Handle delimiter
        if (char === delimiter && !inQuotedField) {
            currentRow.push(currentField.trim());
            currentField = '';
            continue;
        }

        // Handle newline
        if ((char === '\n' || char === '\r') && !inQuotedField) {
            if (char === '\r' && nextChar === '\n') {
                i++;
            }
            if (currentField.length > 0 || currentRow.length > 0) {
                currentRow.push(currentField.trim());
                rows.push(currentRow);
                currentRow = [];
                currentField = '';
            }
            continue;
        }

        currentField += char;
    }

    // Handle last field/row
    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        rows.push(currentRow);
    }

    return rows.filter(row => row.some(field => field.trim() !== ''));
}

function createValidDocId(str: string): string {
    if (!str) return '';
    const slug = str
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w.-]+/g, '')
        .replace(/--+/g, '-');
    return slug || `item-${Date.now()}`;
}

function getCurrentTimestamp(): string {
    return new Date().toISOString();
}

// Read and parse CSV files
function readEntitiesFromCSV(): any[] {
    const csvPath = path.join(process.cwd(), 'public', 'entidades.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');
    const rows = parseCSV(content, ',');

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
    const rows = parseCSV(content, ';');

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
function migrateEntities(): number {
    console.log('📥 Reading entities from CSV...');
    const entities = readEntitiesFromCSV();
    console.log(`Found ${entities.length} entities`);

    let count = 0;
    const now = getCurrentTimestamp();

    for (const entity of entities) {
        const entityName = entity['entidad'] || '';
        const entityId = createValidDocId(entityName);

        if (!entityId) {
            console.warn(`⚠️  Skipping entity with no name.`);
            continue;
        }

        const entityPath = path.join(DATA_PATH, entityId, 'entity.json');

        const entityData = {
            id: entityId,
            name: entityName,
            description: entity['descripcion'] || '',
            logo: entity['logoUrl'] || '',
            color: entity['color'] || '',
            team: [],
            createdAt: entity['createdAt'] || now,
            updatedAt: entity['updatedAt'] || now,
        };

        writeJsonFile(entityPath, entityData);
        count++;

        if (count % 10 === 0) {
            console.log(`✅ Migrated ${count} entities...`);
        }
    }

    console.log(`✅ Successfully migrated ${count} entities`);
    return count;
}

function migrateUseCases(): number {
    console.log('📥 Reading use cases from CSV...');
    const useCases = readUseCasesFromCSV();
    console.log(`Found ${useCases.length} use cases`);

    let count = 0;
    const now = getCurrentTimestamp();

    for (const useCase of useCases) {
        const entityName = useCase['entidad'] || '';
        const projectName = useCase['proyecto'] || '';

        const entityId = createValidDocId(entityName);
        const useCaseId = createValidDocId(projectName);

        if (!entityId || !useCaseId) {
            console.warn(`⚠️ Skipping use case without entity or project name: ${entityName} / ${projectName}`);
            continue;
        }

        const useCasePath = path.join(DATA_PATH, entityId, useCaseId, 'usecase.json');

        const useCaseData = {
            id: useCaseId,
            entityId: entityId,
            name: projectName,
            etapa: useCase['etapa'] || '',
            status: useCase['estado'] || 'En Estimación',
            highLevelStatus: useCase['estadoAltoNivel'] || 'Activo',
            estadoDesarrolloMante: useCase['estadoDesarrolloMante'] || '',
            subtarea: useCase['subtarea'] || '',
            idFinanciera: useCase['idFinanciera'] || '',
            tipoProyecto: useCase['tipoProyecto'] || 'No definido',
            suite: useCase['suite'] || '',
            tipoDesarrollo: useCase['tipoDesarrollo'] || 'No definido',
            ds1: useCase['ds1'] || '',
            ds2: useCase['ds2'] || '',
            ds3: useCase['ds3'] || '',
            ds4: useCase['ds4'] || '',
            de: useCase['de'] || '',
            mds: useCase['mds'] || '',
            mantenimiento: useCase['mantenimiento'] || '',
            tallaje: useCase['tallaje'] || '0',
            horasDs1: useCase['horasDs1'] || '0',
            horasDs2: useCase['horasDs2'] || '0',
            horasDs3: useCase['horasDs3'] || '0',
            horasDs4: useCase['horasDs4'] || '0',
            totalHorasTallaje: useCase['totalHorasTallaje'] || '0',
            horasSemanaPorcentaje: useCase['horasSemanaPorcentaje'] || '0',
            observaciones: useCase['observaciones'] || '',
            fechaInicio: useCase['fechaInicio'] || '',
            fechaEntrega: useCase['fechaEntrega'] || '',
            mantenimientoPost: useCase['mantenimientoPost'] || '',
            dsEntidad: useCase['dsEntidad'] || '',
            nivelImpactoFinanciero: useCase['nivelImpactoFinanciero'] || '',
            unidadImpactoFinanciero: useCase['unidadImpactoFinanciero'] || '',
            impactoFinanciero: useCase['impactoFinanciero'] || '0',
            financieroAdl: useCase['financieroAdl'] || '0',
            financieroEntidad: useCase['financieroEntidad'] || '0',
            sponsor: useCase['sponsor'] || '',
            mainContact: useCase['mainContact'] || '',
            sandbox: useCase['sandbox'] || '',
            nombreHcCuanto: useCase['nombreHcCuanto'] || '',
            sharepointLink: useCase['sharepointLink'] || '',
            sharepointActividades: useCase['sharepointActividades'] || '',
            jiraLink: useCase['jiraLink'] || '',
            jiraActividades: useCase['jiraActividades'] || '',
            confluenceLink: useCase['confluenceLink'] || '',
            objetivo: useCase['objetivo'] || '',
            solucion: useCase['solucion'] || '',
            dolores: useCase['dolores'] || '',
            riesgos: useCase['riesgos'] || '',
            impactoEsperado: useCase['impactoEsperado'] || '',
            impactoGenerado: useCase['impactoGenerado'] || '',
            roadmap: [
                { name: 'Definición y Desarrollo', completed: false },
                { name: 'Piloto', completed: false },
                { name: 'Automatización y Operativización', completed: false },
                { name: 'Seguimiento y Recalibración', completed: false },
            ],
            kpis: [],
            metrics: {},
            createdAt: now,
            updatedAt: now,
        };

        writeJsonFile(useCasePath, useCaseData);

        count++;
        if (count % 20 === 0) {
            console.log(`✅ Migrated ${count} use cases...`);
        }
    }

    console.log(`✅ Successfully migrated ${count} use cases`);
    return count;
}

function cleanupOldData(): void {
    console.log('🗑️  Cleaning up old data structure...');

    // Remove only the .gitkeep and README files from old structure, preserve entity folders
    const entries = fs.readdirSync(DATA_PATH, { withFileTypes: true });

    for (const entry of entries) {
        if (entry.isDirectory()) {
            const subPath = path.join(DATA_PATH, entry.name);
            const subEntries = fs.readdirSync(subPath, { withFileTypes: true });

            for (const subEntry of subEntries) {
                if (subEntry.isDirectory()) {
                    const useCaseDir = path.join(subPath, subEntry.name);
                    const useCaseFiles = fs.readdirSync(useCaseDir);

                    // Remove .gitkeep and README files
                    for (const file of useCaseFiles) {
                        if (file === '.gitkeep' || file === 'README.md') {
                            fs.unlinkSync(path.join(useCaseDir, file));
                        }
                    }
                }
            }
        }
    }

    console.log('✅ Cleanup complete');
}

// Main migration
async function migrate() {
    console.log('🚀 Starting migration from CSV to local JSON...\n');

    try {
        // Ensure data directory exists
        ensureDirectoryExists(DATA_PATH);

        // Clean up old placeholder files
        cleanupOldData();

        // Migrate entities first
        const entitiesCount = migrateEntities();
        console.log('');

        // Then migrate use cases
        const useCasesCount = migrateUseCases();

        console.log('\n✨ Migration completed successfully!');
        console.log(`   📊 Entities: ${entitiesCount}`);
        console.log(`   📊 Use Cases: ${useCasesCount}`);
        console.log('');
        console.log('📁 Data stored in: public/data/');
        console.log('');

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();

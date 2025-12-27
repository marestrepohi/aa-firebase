// Local JSON-based data adapter - replaces Firebase
import 'server-only';
import * as fs from 'fs';
import * as path from 'path';
import type { Entity, UseCase, SummaryMetrics, TeamMember, MetricCategory } from './types';

// Base path for local data storage
const DATA_PATH = path.join(process.cwd(), 'public', 'data');

// ============================================================================
// Utility Functions
// ============================================================================

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
        if (fs.existsSync(filePath)) {
            // console.log(`Reading file: ${filePath}`);
            const content = fs.readFileSync(filePath, 'utf-8');
            if (!content || content.trim() === '') {
                console.error(`EMPTY FILE DETECTED: ${filePath}`);
                return defaultValue;
            }
            return JSON.parse(content) as T;
        }
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
    }
    return defaultValue;
}

function writeJsonFile(filePath: string, data: any): void {
    ensureDirectoryExists(path.dirname(filePath));
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function createIdFromName(name: string): string {
    if (!name) return `item-${Date.now()}`;
    return name
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w.-]+/g, '')
        .replace(/--+/g, '-') || `item-${Date.now()}`;
}

function getCurrentTimestamp(): string {
    return new Date().toISOString();
}

// ============================================================================
// Entity Operations
// ============================================================================

function getEntityPath(entityId: string): string {
    return path.join(DATA_PATH, entityId, 'entity.json');
}

function getEntitiesListPath(): string {
    return path.join(DATA_PATH, 'entities.json');
}

export async function getEntities(): Promise<Entity[]> {
    try {
        const entitiesDir = DATA_PATH;
        if (!fs.existsSync(entitiesDir)) {
            return [];
        }

        const entries = fs.readdirSync(entitiesDir, { withFileTypes: true });
        const entityDirs = entries.filter(entry =>
            entry.isDirectory() && fs.existsSync(path.join(entitiesDir, entry.name, 'entity.json'))
        );

        const entities: Entity[] = [];

        for (const dir of entityDirs) {
            const entityPath = path.join(entitiesDir, dir.name, 'entity.json');
            const entityData = readJsonFile<any>(entityPath, null);

            if (!entityData) continue;

            // Calculate stats from use cases
            const useCases = await getUseCases(dir.name);
            const stats = calculateEntityStats(useCases, entityData.team || []);

            entities.push({
                id: entityData.id || dir.name,
                name: entityData.name || dir.name,
                description: entityData.description || '',
                logo: entityData.logo || '',
                team: entityData.team || [],
                stats,
            });
        }

        return entities;
    } catch (error) {
        console.error('Error getting entities:', error);
        return [];
    }
}

function calculateEntityStats(useCases: UseCase[], team: TeamMember[]): Entity['stats'] {
    let active = 0;
    let inactive = 0;
    let strategic = 0;

    // Collect all team members from use cases
    const teamMap = new Map<string, TeamMember>();

    // Add existing team members
    team.forEach(member => {
        const key = member.email || member.name;
        if (key) teamMap.set(key, member);
    });

    for (const useCase of useCases) {
        const status = useCase.highLevelStatus || '';
        if (status === 'Activo') active++;
        else if (status === 'Inactivo') inactive++;
        else if (status === 'Estrategico') strategic++;

        // Collect team members from use case fields
        const addMember = (name: string | undefined, role: string) => {
            if (!name || name === '0' || name.trim() === '') return;
            const key = name.trim();
            if (!teamMap.has(key)) {
                teamMap.set(key, {
                    name: key,
                    email: '',
                    role: role as any,
                });
            }
        };

        addMember(useCase.ds1, 'DS');
        addMember(useCase.ds2, 'DS');
        addMember(useCase.ds3, 'DS');
        addMember(useCase.ds4, 'DS');
        addMember(useCase.de, 'DE');
        addMember(useCase.mds, 'MDS');
    }

    const aggregatedTeam = Array.from(teamMap.values());
    const scientists = aggregatedTeam.filter(m => m.role === 'DS' || m.role === 'MDS').length;

    return {
        active,
        inactive,
        strategic,
        total: useCases.length,
        scientists,
        inDevelopment: active,
        alerts: 0,
        totalImpact: 0,
    };
}

export async function getEntity(id: string): Promise<Entity | undefined> {
    const entities = await getEntities();
    return entities.find(e => e.id === id);
}

export async function addEntity(data: { name: string; description?: string; logo?: string; id?: string }): Promise<boolean> {
    try {
        const id = data.id || createIdFromName(data.name);
        const entityPath = getEntityPath(id);
        const now = getCurrentTimestamp();

        const entityData = {
            id,
            name: data.name,
            description: data.description || '',
            logo: data.logo || '',
            team: [],
            createdAt: now,
            updatedAt: now,
        };

        writeJsonFile(entityPath, entityData);
        return true;
    } catch (error) {
        console.error('Error adding entity:', error);
        return false;
    }
}

export async function updateEntity(data: { id: string; name?: string; description?: string; logo?: string; team?: TeamMember[] }): Promise<boolean> {
    try {
        const entityPath = getEntityPath(data.id);
        const existing = readJsonFile<any>(entityPath, {});

        const updated = {
            ...existing,
            ...data,
            updatedAt: getCurrentTimestamp(),
        };

        writeJsonFile(entityPath, updated);
        return true;
    } catch (error) {
        console.error('Error updating entity:', error);
        return false;
    }
}

export async function deleteEntity(id: string): Promise<boolean> {
    try {
        const entityDir = path.join(DATA_PATH, id);
        if (fs.existsSync(entityDir)) {
            fs.rmSync(entityDir, { recursive: true, force: true });
        }
        return true;
    } catch (error) {
        console.error('Error deleting entity:', error);
        return false;
    }
}

// ============================================================================
// Use Case Operations
// ============================================================================

function getUseCasePath(entityId: string, useCaseId: string): string {
    return path.join(DATA_PATH, entityId, useCaseId, 'usecase.json');
}

function getUseCaseDir(entityId: string, useCaseId: string): string {
    return path.join(DATA_PATH, entityId, useCaseId);
}

export async function getUseCases(entityId: string): Promise<UseCase[]> {
    try {
        const entityDir = path.join(DATA_PATH, entityId);
        if (!fs.existsSync(entityDir)) {
            return [];
        }

        const entries = fs.readdirSync(entityDir, { withFileTypes: true });
        const useCaseDirs = entries.filter(entry =>
            entry.isDirectory() && fs.existsSync(path.join(entityDir, entry.name, 'usecase.json'))
        );

        const useCases: UseCase[] = [];

        for (const dir of useCaseDirs) {
            const useCasePath = path.join(entityDir, dir.name, 'usecase.json');
            const useCaseData = readJsonFile<any>(useCasePath, null);

            if (!useCaseData) continue;

            // Get uploaded files
            const uploadedFiles = await getUploadedFiles(entityId, dir.name);

            useCases.push({
                ...useCaseData,
                id: useCaseData.id || dir.name,
                entityId,
                lastUpdated: useCaseData.updatedAt,
                uploadedFiles,
                metrics: useCaseData.metrics || {},
                kpis: useCaseData.kpis || [],
            });
        }

        return useCases;
    } catch (error) {
        console.error(`Error getting use cases for ${entityId}:`, error);
        return [];
    }
}

export async function getUseCase(entityId: string, useCaseId: string): Promise<UseCase | undefined> {
    const useCases = await getUseCases(entityId);
    return useCases.find(uc => uc.id.toLowerCase() === useCaseId.toLowerCase());
}

export async function getAllUseCases(): Promise<UseCase[]> {
    try {
        const entities = await getEntities();
        const allUseCases: UseCase[] = [];

        for (const entity of entities) {
            const useCases = await getUseCases(entity.id);
            allUseCases.push(...useCases);
        }

        return allUseCases;
    } catch (error) {
        console.error('Error getting all use cases:', error);
        return [];
    }
}

export async function addUseCase(entityId: string, data: { name: string; description?: string; id?: string }): Promise<boolean> {
    try {
        const id = data.id || createIdFromName(data.name);
        const useCasePath = getUseCasePath(entityId, id);
        const now = getCurrentTimestamp();

        const useCaseData = {
            id,
            entityId,
            name: data.name,
            etapa: '',
            status: 'En Estimación',
            highLevelStatus: 'Activo',
            estadoDesarrolloMante: '',
            subtarea: '',
            idFinanciera: '',
            tipoProyecto: 'No definido',
            suite: '',
            tipoDesarrollo: 'No definido',
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
        return true;
    } catch (error) {
        console.error('Error adding use case:', error);
        return false;
    }
}

export async function updateUseCase(data: Partial<UseCase> & { entityId: string; id: string }): Promise<boolean> {
    try {
        const { entityId, id, ...updateData } = data;
        const useCasePath = getUseCasePath(entityId, id);
        const existing = readJsonFile<any>(useCasePath, {});

        // Save current version to history before updating
        await saveToHistory(entityId, id, existing);

        const updated = {
            ...existing,
            ...updateData,
            entityId,
            id,
            updatedAt: getCurrentTimestamp(),
        };

        writeJsonFile(useCasePath, updated);
        return true;
    } catch (error) {
        console.error('Error updating use case:', error);
        return false;
    }
}

// ============================================================================
// History / Versioning Operations
// ============================================================================

function getHistoryDir(entityId: string, useCaseId: string): string {
    return path.join(DATA_PATH, entityId, useCaseId, 'history');
}

async function saveToHistory(entityId: string, useCaseId: string, data: any): Promise<void> {
    if (!data || Object.keys(data).length === 0) return;

    const historyDir = getHistoryDir(entityId, useCaseId);
    ensureDirectoryExists(historyDir);

    const versionId = `v${Date.now()}`;
    const historyPath = path.join(historyDir, `${versionId}.json`);

    const historyEntry = {
        ...data,
        versionId,
        versionedAt: getCurrentTimestamp(),
    };

    writeJsonFile(historyPath, historyEntry);

    // Cleanup old versions (keep last 20)
    const MAX_VERSIONS = 20;
    const files = fs.readdirSync(historyDir).sort().reverse();
    if (files.length > MAX_VERSIONS) {
        for (const file of files.slice(MAX_VERSIONS)) {
            fs.unlinkSync(path.join(historyDir, file));
        }
    }
}

export async function getUseCaseHistory(entityId: string, useCaseId: string): Promise<any[]> {
    try {
        const historyDir = getHistoryDir(entityId, useCaseId);
        if (!fs.existsSync(historyDir)) {
            return [];
        }

        const files = fs.readdirSync(historyDir).sort().reverse();
        const history = files.map(file => {
            const filePath = path.join(historyDir, file);
            const data = readJsonFile<any>(filePath, {});
            return {
                versionId: data.versionId || file.replace('.json', ''),
                versionedAt: data.versionedAt,
            };
        });

        return history;
    } catch (error) {
        console.error('Error getting use case history:', error);
        return [];
    }
}

export async function revertUseCaseVersion(entityId: string, useCaseId: string, versionId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const historyPath = path.join(getHistoryDir(entityId, useCaseId), `${versionId}.json`);

        if (!fs.existsSync(historyPath)) {
            return { success: false, error: 'Version not found' };
        }

        const versionData = readJsonFile<any>(historyPath, null);
        if (!versionData) {
            return { success: false, error: 'Could not read version data' };
        }

        // Remove version metadata before restoring
        delete versionData.versionId;
        delete versionData.versionedAt;

        // Update the use case with the old version data
        await updateUseCase({
            ...versionData,
            entityId,
            id: useCaseId,
        });

        return { success: true };
    } catch (error: any) {
        console.error('Error reverting use case version:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// Metrics Operations
// ============================================================================

function getMetricsDir(entityId: string, useCaseId: string): string {
    return path.join(DATA_PATH, entityId, useCaseId, 'metrics');
}

export async function getMetricsHistory(
    entityId: string,
    useCaseId: string,
    category?: string
): Promise<Array<{ id: string; uploadedAt: string;[key: string]: any }>> {
    try {
        const metricsDir = getMetricsDir(entityId, useCaseId);
        if (!fs.existsSync(metricsDir)) {
            return [];
        }

        const files = fs.readdirSync(metricsDir).sort().reverse();
        const metrics = files
            .map(file => {
                const filePath = path.join(metricsDir, file);
                const data = readJsonFile<any>(filePath, {});
                return {
                    id: file.replace('.json', ''),
                    ...data,
                };
            })
            .filter(m => !category || m.category === category);

        return metrics;
    } catch (error) {
        console.error('Error getting metrics history:', error);
        return [];
    }
}

export async function saveMetrics({
    entityId,
    useCaseId,
    category,
    metrics,
}: {
    entityId: string;
    useCaseId: string;
    category?: MetricCategory;
    metrics: any;
}): Promise<{ success: boolean }> {
    try {
        const metricsDir = getMetricsDir(entityId, useCaseId);
        ensureDirectoryExists(metricsDir);

        const metricId = `m${Date.now()}`;
        const metricPath = path.join(metricsDir, `${metricId}.json`);

        const metricData = {
            ...metrics,
            category,
            uploadedAt: getCurrentTimestamp(),
        };

        writeJsonFile(metricPath, metricData);
        return { success: true };
    } catch (error) {
        console.error('Error saving metrics:', error);
        throw error;
    }
}

export async function getMetric(
    entityId: string,
    useCaseId: string,
    category: string,
    metricId: string
): Promise<any | null> {
    try {
        const metricPath = path.join(getMetricsDir(entityId, useCaseId), `${metricId}.json`);
        if (!fs.existsSync(metricPath)) {
            return null;
        }
        return readJsonFile<any>(metricPath, null);
    } catch (error) {
        console.error('Error getting metric:', error);
        return null;
    }
}

// ============================================================================
// Uploaded Files Operations
// ============================================================================

function getUploadedFilesDir(entityId: string, useCaseId: string): string {
    return path.join(DATA_PATH, entityId, useCaseId, 'uploadedFiles');
}

async function getUploadedFiles(entityId: string, useCaseId: string): Promise<any[]> {
    try {
        const filesDir = getUploadedFilesDir(entityId, useCaseId);
        if (!fs.existsSync(filesDir)) {
            return [];
        }

        const files = fs.readdirSync(filesDir).sort().reverse();
        return files.map(file => {
            const filePath = path.join(filesDir, file);
            const data = readJsonFile<any>(filePath, {});
            return {
                id: file.replace('.json', ''),
                ...data,
            };
        });
    } catch (error) {
        console.error('Error getting uploaded files:', error);
        return [];
    }
}

export async function saveUploadedFile({
    entityId,
    useCaseId,
    fileData,
}: {
    entityId: string;
    useCaseId: string;
    fileData: { name: string; category: MetricCategory; rowCount: number; periods: string[] };
}): Promise<{ success: boolean; fileId: string }> {
    try {
        const filesDir = getUploadedFilesDir(entityId, useCaseId);
        ensureDirectoryExists(filesDir);

        const fileId = `f${Date.now()}`;
        const filePath = path.join(filesDir, `${fileId}.json`);

        const data = {
            ...fileData,
            uploadedAt: getCurrentTimestamp(),
        };

        writeJsonFile(filePath, data);
        return { success: true, fileId };
    } catch (error) {
        console.error('Error saving uploaded file:', error);
        throw error;
    }
}

export async function deleteUploadedFile(
    entityId: string,
    useCaseId: string,
    fileId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const filePath = path.join(getUploadedFilesDir(entityId, useCaseId), `${fileId}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        return { success: true };
    } catch (error: any) {
        console.error('Error deleting uploaded file:', error);
        return { success: false, error: error.message };
    }
}

// ============================================================================
// Summary Metrics
// ============================================================================

export async function getSummaryMetrics(): Promise<SummaryMetrics> {
    const entities = await getEntities();
    const allUseCases = await getAllUseCases();
    const totalScientists = entities.reduce((sum, e) => sum + (e.stats?.scientists || 0), 0);

    return {
        totalCases: allUseCases.length,
        entities: entities.length,
        dataScientists: totalScientists,
        totalImpact: '0',
    };
}

// ============================================================================
// Team Operations (New)
// ============================================================================

function getTeamPath(): string {
    return path.join(DATA_PATH, 'team.json');
}

export async function getTeam(): Promise<TeamMember[]> {
    const teamPath = getTeamPath();
    let team = readJsonFile<TeamMember[]>(teamPath, []);

    // If no team file exists or it's empty, seed from existing use cases
    if (!team || team.length === 0) {
        console.log('Seeding team from existing use cases...');
        const allUseCases = await getAllUseCases();
        const memberMap = new Map<string, TeamMember>();

        allUseCases.forEach(uc => {
            if (uc.ds1 && uc.ds1 !== '0' && uc.ds1.trim()) {
                const name = uc.ds1.trim();
                if (!memberMap.has(name)) memberMap.set(name, { name, role: 'DS' });
            }
            if (uc.de && uc.de !== '0' && uc.de.trim()) {
                const name = uc.de.trim();
                if (!memberMap.has(name)) memberMap.set(name, { name, role: 'DE' });
            }
            if (uc.mds && uc.mds !== '0' && uc.mds.trim()) {
                const name = uc.mds.trim();
                if (!memberMap.has(name)) memberMap.set(name, { name, role: 'MDS' });
            }
        });

        team = Array.from(memberMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        // Save the seeded team so we don't re-seed next time
        if (team.length > 0) {
            writeJsonFile(teamPath, team);
        }
    }

    return team;
}

export async function saveTeam(team: TeamMember[]): Promise<{ success: boolean }> {
    try {
        const teamPath = getTeamPath();
        writeJsonFile(teamPath, team);
        return { success: true };
    } catch (error) {
        console.error('Error saving team:', error);
        throw error;
    }
}

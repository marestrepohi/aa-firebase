import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

const DATA_PATH = path.join(process.cwd(), 'public', 'data');

function ensureDirectoryExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

function readJsonFile<T>(filePath: string, defaultValue: T): T {
    try {
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
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

function getDashboardConfigPath(entityId: string, useCaseId: string, category: string): string {
    return path.join(DATA_PATH, entityId, useCaseId, 'dashboardConfigs', `${category}.json`);
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const entityId = searchParams.get('entityId');
        const useCaseId = searchParams.get('useCaseId');
        const category = searchParams.get('category') || 'technical';

        if (!entityId || !useCaseId) {
            return NextResponse.json({ error: 'entityId and useCaseId required' }, { status: 400 });
        }

        const configPath = getDashboardConfigPath(entityId, useCaseId, category);
        const config = readJsonFile<any>(configPath, null);

        if (!config) {
            return NextResponse.json(null);
        }

        return NextResponse.json(config);
    } catch (error) {
        console.error('Error fetching dashboard config:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, entityId, useCaseId, category, config } = body;

        if (!entityId || !useCaseId) {
            return NextResponse.json({ error: 'entityId and useCaseId required' }, { status: 400 });
        }

        switch (action) {
            case 'save': {
                const configPath = getDashboardConfigPath(entityId, useCaseId, category || 'technical');
                const configData = {
                    ...config,
                    updatedAt: new Date().toISOString(),
                };
                writeJsonFile(configPath, configData);
                return NextResponse.json({ success: true });
            }

            case 'delete': {
                const configPath = getDashboardConfigPath(entityId, useCaseId, 'technical');
                if (fs.existsSync(configPath)) {
                    fs.unlinkSync(configPath);
                }
                return NextResponse.json({ success: true });
            }

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing dashboard config action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}

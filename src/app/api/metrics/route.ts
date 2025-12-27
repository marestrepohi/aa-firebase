import { NextRequest, NextResponse } from 'next/server';
import {
    getMetricsHistory,
    saveMetrics,
    getMetric,
    saveUploadedFile,
    deleteUploadedFile,
} from '@/lib/data.local';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const entityId = searchParams.get('entityId');
        const useCaseId = searchParams.get('useCaseId');
        const category = searchParams.get('category');
        const metricId = searchParams.get('metricId');

        if (!entityId || !useCaseId) {
            return NextResponse.json({ error: 'entityId and useCaseId required' }, { status: 400 });
        }

        if (metricId) {
            const metric = await getMetric(entityId, useCaseId, category || '', metricId);
            return NextResponse.json(metric);
        }

        const history = await getMetricsHistory(entityId, useCaseId, category || undefined);
        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching metrics:', error);
        return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, entityId, useCaseId, category, metrics, fileData, fileId } = body;

        switch (action) {
            case 'save':
                const result = await saveMetrics({ entityId, useCaseId, category, metrics });
                return NextResponse.json(result);

            case 'saveFile':
                const fileResult = await saveUploadedFile({ entityId, useCaseId, fileData });
                return NextResponse.json(fileResult);

            case 'deleteFile':
                const deleteResult = await deleteUploadedFile(entityId, useCaseId, fileId);
                return NextResponse.json(deleteResult);

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing metrics action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}

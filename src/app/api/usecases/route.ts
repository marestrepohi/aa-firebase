import { NextRequest, NextResponse } from 'next/server';
import {
    getUseCases,
    getAllUseCases,
    addUseCase,
    updateUseCase,
    getUseCaseHistory,
    revertUseCaseVersion,
} from '@/lib/data.local';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const entityId = searchParams.get('entityId');
        const all = searchParams.get('all');

        if (all === 'true') {
            const useCases = await getAllUseCases();
            return NextResponse.json(useCases);
        }

        if (!entityId) {
            return NextResponse.json({ error: 'entityId required' }, { status: 400 });
        }

        const useCases = await getUseCases(entityId);
        return NextResponse.json(useCases);
    } catch (error) {
        console.error('Error fetching use cases:', error);
        return NextResponse.json({ error: 'Failed to fetch use cases' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, entityId, useCaseId, data, versionId } = body;

        switch (action) {
            case 'create':
                const created = await addUseCase(entityId, data);
                return NextResponse.json({ success: created });

            case 'update':
                const updated = await updateUseCase({ ...data, entityId, id: useCaseId });
                return NextResponse.json({ success: updated });

            case 'getHistory':
                const history = await getUseCaseHistory(entityId, useCaseId);
                return NextResponse.json(history);

            case 'revert':
                const result = await revertUseCaseVersion(entityId, useCaseId, versionId);
                return NextResponse.json(result);

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing use case action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}

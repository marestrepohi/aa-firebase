import { NextRequest, NextResponse } from 'next/server';
import {
    getEntities,
    addEntity,
    updateEntity,
    deleteEntity,
} from '@/lib/data.local';

export async function GET() {
    try {
        const entities = await getEntities();
        return NextResponse.json(entities);
    } catch (error) {
        console.error('Error fetching entities:', error);
        return NextResponse.json({ error: 'Failed to fetch entities' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, data } = body;

        switch (action) {
            case 'create':
                const created = await addEntity(data);
                return NextResponse.json({ success: created });

            case 'update':
                const updated = await updateEntity(data);
                return NextResponse.json({ success: updated });

            case 'delete':
                const deleted = await deleteEntity(data.id);
                return NextResponse.json({ success: deleted });

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error processing entity action:', error);
        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { getTeam, saveTeam } from '@/lib/data.local';
import { TeamMember } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const team = await getTeam();
        return NextResponse.json(team);
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch team' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const team = body.team as TeamMember[];

        if (!Array.isArray(team)) {
            return NextResponse.json(
                { error: 'Invalid data format' },
                { status: 400 }
            );
        }

        await saveTeam(team);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to save team' },
            { status: 500 }
        );
    }
}

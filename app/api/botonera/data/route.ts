import { NextResponse } from 'next/server';
import { initialTeams, initialPlayers } from '@/lib/data/mock-db';

export async function GET() {
    // This endpoint serves the latest data (Teams and Players) to the external Keypad App.
    // In a real database scenario, we would query the DB here.
    // Since we are using shared mock data, we serve that.

    const data = {
        teams: initialTeams,
        players: initialPlayers.map(p => ({
            id: p.id,
            name: p.name,
            number: p.number,
            position: p.position,
            teamId: p.teamId,
            photoUrl: p.photoUrl
        })),
        meta: {
            timestamp: new Date().toISOString(),
            version: "1.0"
        }
    };

    return NextResponse.json(data);
}

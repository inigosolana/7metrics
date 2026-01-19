import { NextResponse } from 'next/server';

// Mock data until DB is fully connected
// In a real scenario, this would query your Supabase 'teams' and 'players' tables
const getMockTeams = (userId: string) => [
    {
        id: "1",
        name: "Senior A Masculino",
        category: "Senior",
        players: [
            { id: "1", name: "Carlos Martínez", number: 1, position: "Portero" },
            { id: "2", name: "Pablo García", number: 10, position: "Central" },
            // ... more players
        ]
    },
    {
        id: "2",
        name: "Juvenil B Femenino",
        category: "Juvenil",
        players: [
            { id: "6", name: "Ana Rodríguez", number: 12, position: "Portero" },
            { id: "7", name: "Laura Martín", number: 8, position: "Central" },
        ]
    }
];

export async function GET(request: Request) {
    // Stubbed: Supabase removed. Auth check skipped.
    // Assuming anonymous access or internal use for now.
    const userId = "mock-user-id";

    try {
        const teams = getMockTeams(userId);

        return NextResponse.json({
            data: {
                matches_synced: 0,
                teams: teams
            }
        });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

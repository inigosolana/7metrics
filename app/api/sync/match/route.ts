import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Stubbed: Supabase removed. 
    // This endpoint previously synced matches to local Supabase.
    // Now we rely on external API for data.
    return NextResponse.json({ success: true, message: "Sync endpoint deprecated (Supabase removed)" });
}

'use server'

import { metricsApi } from "@/lib/api/client"

export async function getMatchesAction(skip = 0, limit = 50) {
    try {
        console.log("Server Action: Fetching matches...")
        const matches = await metricsApi.listMatches(skip, limit)
        console.log("Server Action: Fetched matches count:", matches.length)
        return { success: true, data: matches }
    } catch (error: any) {
        console.error("Server Action Error (listMatches):", error.message)
        return { success: false, error: error.message || "Failed to fetch matches" }
    }
}

export async function getMatchDetailsAction(matchId: string) {
    try {
        const [match, events, stats] = await Promise.all([
            metricsApi.getMatch(matchId),
            metricsApi.listEvents(matchId),
            metricsApi.getFullStats(matchId).catch(() => null)
        ])
        return {
            success: true,
            data: { match, events, stats }
        }
    } catch (error: any) {
        console.error("Server Action Error (getMatchDetails):", error.message)
        return { success: false, error: error.message || "Failed to fetch match details" }
    }
}

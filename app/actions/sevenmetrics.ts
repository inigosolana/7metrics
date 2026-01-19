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

export async function registerEventAction(event: any) {
    try {
        const result = await metricsApi.registerEvent(event)
        return { success: true, data: result }
    } catch (error: any) {
        console.error("Server Action Error (registerEvent):", error.message)
        return { success: false, error: error.message || "Failed to register event" }
    }
}

export async function getPlayerAggregateStatsAction(playerId: string) {
    try {
        // 1. Fetch recent matches (limit 5 as requested for graph)
        const matches = await metricsApi.listMatches(0, 10)

        // 2. Fetch events for these matches parallelly
        const allEventsPromises = matches.map(m => metricsApi.listEvents(m.id!).catch(() => []))
        const allEventsResults = await Promise.all(allEventsPromises)
        const allEvents = allEventsResults.flat()

        // 3. Filter for this player
        const playerEvents = allEvents.filter(e => e.player.toString() === playerId || e.player === Number(playerId))

        return { success: true, data: playerEvents, matches: matches }
    } catch (error: any) {
        console.error("Server Action Error (getPlayerStats):", error.message)
        return { success: false, error: error.message || "Failed to fetch player stats" }
    }
}

export async function deleteMatchAction(matchId: string) {
    try {
        await metricsApi.deleteMatch(matchId)
        return { success: true }
    } catch (error: any) {
        console.error("Server Action Error (deleteMatch):", error.message)
        return { success: false, error: error.message || "Failed to delete match" }
    }
}

"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { metricsApi, type Match, type Event } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ArrowLeft, Clock, Activity, List, BarChart3, Users, PlayCircle, StopCircle, RefreshCcw } from "lucide-react"

import { getMatchDetailsAction } from "@/app/actions/sevenmetrics"

export default function MatchDetailPage() {
    const params = useParams()
    const router = useRouter()
    const matchId = params.id as string

    const [match, setMatch] = useState<Match | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const loadData = async () => {
        try {
            setLoading(true)
            const response = await getMatchDetailsAction(matchId)

            if (response.success && response.data) {
                setMatch(response.data.match)
                setEvents(response.data.events)
                setStats(response.data.stats)
            } else {
                console.error("Error loading match data:", response.error)
            }
        } catch (error) {
            console.error("Failed to load match details:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (matchId) {
            loadData()
        }
    }, [matchId])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (!match) {
        return <div className="p-8">Match not found</div>
    }

    return (
        <div className="space-y-6 p-8 max-w-7xl mx-auto">
            {/* Header / Navigation */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard/matches')}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            {match.team_a_name} <span className="text-muted-foreground text-lg">vs</span> {match.team_b_name}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Badge variant="outline">{match.status}</Badge>
                            <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {match.total_time_seconds ? Math.floor(match.total_time_seconds / 60) + ' mins' : '00:00'}
                            </span>
                        </div>
                    </div>
                </div>

                <Button variant="outline" size="sm" onClick={loadData}>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Refresh Data
                </Button>
            </div>

            {/* Scoreboard */}
            <Card className="bg-[#0A0A0A] border-border overflow-hidden">
                <div className="grid grid-cols-3 items-center py-8">
                    {/* Home Team */}
                    <div className="text-center space-y-2">
                        <div className="text-3xl font-bold uppercase tracking-wider">{match.team_a_name}</div>
                        <div className="text-sm text-muted-foreground">Defense: {match.defense_a || '-'}</div>
                    </div>

                    {/* Score */}
                    <div className="text-center flex flex-col items-center justify-center">
                        <div className="text-6xl font-black text-white tabular-nums tracking-tighter shadow-xl">
                            {match.local_score || 0} - {match.visitor_score || 0}
                        </div>
                        <div className="mt-2 text-xs font-mono text-muted-foreground bg-white/5 px-2 py-1 rounded">
                            ID: {matchId.slice(0, 8)}
                        </div>
                    </div>

                    {/* Away Team */}
                    <div className="text-center space-y-2">
                        <div className="text-3xl font-bold uppercase tracking-wider">{match.team_b_name}</div>
                        <div className="text-sm text-muted-foreground">Defense: {match.defense_b || '-'}</div>
                    </div>
                </div>
            </Card>

            {/* Content Tabs */}
            <Tabs defaultValue="events" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="events">Events Log</TabsTrigger>
                    <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                {/* Events Log Tab */}
                <TabsContent value="events" className="space-y-4 mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <List className="h-5 w-5 text-primary" />
                                Match Events
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {events.map((event) => (
                                    <div key={event.id} className="flex items-center justify-between border-b border-border/40 pb-3 last:border-0 last:pb-0">
                                        <div className="flex items-center gap-4">
                                            <div className="font-mono text-sm font-bold text-muted-foreground w-12 text-right">
                                                {event.time_formatted || '00:00'}
                                            </div>
                                            <div className="bg-secondary/50 rounded-full h-8 w-8 flex items-center justify-center font-bold text-xs ring-1 ring-border">
                                                {event.player}
                                            </div>
                                            <div>
                                                <div className="font-semibold text-sm">
                                                    {event.action}
                                                    {event.court_zone && <span className="ml-2 text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Zone {event.court_zone}</span>}
                                                </div>
                                                <div className="text-xs text-muted-foreground">Team {event.team}</div>
                                            </div>
                                        </div>

                                        {/* Result Indicator if Goal/Miss */}
                                        {['Goal', 'Miss', 'Save'].some(t => event.action.includes(t)) && (
                                            <Badge variant={event.action.toLowerCase().includes('goal') ? 'default' : 'secondary'}>
                                                {event.action}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                                {events.length === 0 && (
                                    <div className="text-center text-muted-foreground py-8">No events recorded.</div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Stats Tab */}
                <TabsContent value="stats" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-primary" />
                                Match Statistics
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats ? (
                                <pre className="bg-secondary/50 p-4 rounded-lg overflow-auto text-xs font-mono">
                                    {JSON.stringify(stats, null, 2)}
                                </pre>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
                                    <BarChart3 className="h-10 w-10 mb-4 opacity-50" />
                                    <p>Detailed statistics not available yet.</p>
                                    <p className="text-xs mt-1">This API endpoint might need to be implemented or data is missing.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

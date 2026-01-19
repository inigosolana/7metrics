// "use client"

import { useEffect, useState } from "react"
import { getPlayerAggregateStatsAction } from "@/app/actions/sevenmetrics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"

export default function PlayerDashboard() {
    // Assuming we view "current user" stats or a specific player ID.
    // For demo, we'll pick player ID '10' or pass it via context if logged in.
    const playerId = "10";

    const [stats, setStats] = useState<any>(null)
    const [events, setEvents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadStats = async () => {
            const res = await getPlayerAggregateStatsAction(playerId)
            if (res.success && res.data) {
                setEvents(res.data)

                // Calculate Metrics
                const goals = res.data.filter((e: any) => e.action === 'GOL').length
                const misses = res.data.filter((e: any) => e.action === 'FALLO').length
                const totalShots = goals + misses

                setStats({
                    goals,
                    efficiency: totalShots > 0 ? Math.round((goals / totalShots) * 100) : 0,
                    turnovers: res.data.filter((e: any) => e.action === 'PÉRDIDA').length
                })
            }
            setLoading(false)
        }
        loadStats()
    }, [])

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="p-8 space-y-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">My Performance</h1>
                <p className="text-muted-foreground">Player #{playerId}</p>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Evolution Graph Placeholder */}
                <div className="col-span-2 p-6 border rounded-lg bg-card">
                    <h3 className="text-xl font-semibold mb-4">Season Evolution (Last 5 Matches)</h3>
                    <div className="h-64 flex items-end justify-around gap-2 px-4 border-b border-l border-border/50 pb-2">
                        {/* Fake dynamic bars for now based on 'matches' if we linked them, or keeping mock visual style */}
                        {[5, 3, 8, 4, 6].map((goals, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer w-full">
                                <div
                                    className="w-full max-w-[40px] bg-primary/20 group-hover:bg-primary transition-all rounded-t relative"
                                    style={{ height: `${goals * 10}%` }}
                                >
                                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-xs font-bold transition-opacity">
                                        {goals}
                                    </span>
                                </div>
                                <span className="text-xs text-muted-foreground">M{i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Key Stats */}
                <div className="space-y-6">
                    <Card className="bg-primary/5 border-primary/20">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Shooting Efficiency</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-primary">{stats?.efficiency || 0}%</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stats?.goals || 0} Goals / {(stats?.goals + (events.filter(e => e.action === 'FALLO').length)) || 0} Shots
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Turnovers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-orange-500">{stats?.turnovers || 0}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Heatmap */}
                <Card className="col-span-full md:col-span-2 lg:col-span-1 min-h-[400px]">
                    <CardHeader>
                        <CardTitle>Shot Heatmap</CardTitle>
                    </CardHeader>
                    <CardContent className="h-full flex items-center justify-center p-6">
                        <div className="relative w-full aspect-[2/1] bg-[#E8F5E9] rounded-lg border-2 border-[#2E7D32] overflow-hidden">
                            {/* Court Lines (Simplified) */}
                            <div className="absolute inset-0 border-2 border-[#2E7D32] m-4" />
                            <div className="absolute left-[50%] top-0 bottom-0 w-px bg-[#2E7D32] opacity-50" />

                            {/* Render Dots */}
                            {events.filter(e => e.action === 'GOL' || e.action === 'FALLO').map((e, i) => {
                                // Extract Coords from context ["x:50.5", "y:20.1"] or similar (flexible parsing)
                                let x = 50, y = 50;
                                if (e.context && Array.isArray(e.context)) {
                                    const xStr = e.context.find((s: string) => s.startsWith('x:'))
                                    const yStr = e.context.find((s: string) => s.startsWith('y:'))
                                    if (xStr) x = parseFloat(xStr.split(':')[1])
                                    if (yStr) y = parseFloat(yStr.split(':')[1])
                                }

                                return (
                                    <div
                                        key={i}
                                        className={`absolute w-3 h-3 rounded-full border border-white shadow-sm transform -translate-x-1/2 -translate-y-1/2 ${e.action === 'GOL' ? 'bg-green-500' : 'bg-red-500'}`}
                                        style={{ left: `${x}%`, top: `${y}%` }}
                                        title={`${e.action} (${e.time_formatted})`}
                                    />
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

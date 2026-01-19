"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { metricsApi, type Match } from "@/lib/api/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, Calendar, Trophy, ArrowRight } from "lucide-react"

import { getMatchesAction } from "@/app/actions/sevenmetrics"

export default function MatchesPage() {
    const router = useRouter()
    const [matches, setMatches] = useState<Match[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadMatches = async () => {
            try {
                const response = await getMatchesAction()
                if (response.success && response.data) {
                    setMatches(response.data)
                }
            } catch (error) {
                console.error("Failed to load matches:", error)
            } finally {
                setLoading(false)
            }
        }
        loadMatches()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-8 p-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Partidos (Botonera)</h1>
                    <p className="text-muted-foreground">
                        Historial de partidos sincronizados desde la aplicación de pista.
                    </p>
                </div>
            </div>

            {matches.length === 0 ? (
                <Card className="bg-muted/10 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No hay partidos registrados</h3>
                        <p className="text-muted-foreground max-w-sm">
                            Utiliza la aplicación de botonera para registrar tu primer partido.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {matches.map((match) => (
                        <Card
                            key={match.id}
                            className="bg-[#0A0A0A] border-border/50 hover:border-primary/50 transition-all cursor-pointer group"
                            onClick={() => router.push(`/dashboard/matches/${match.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start mb-2">
                                    <Badge variant={match.status === 'FINISHED' ? 'default' : 'secondary'} className="uppercase text-[10px]">
                                        {match.status || 'SETUP'}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {match.created_at ? new Date(match.created_at).toLocaleDateString() : 'Sin fecha'}
                                    </span>
                                </div>
                                <CardTitle className="text-lg font-bold text-white group-hover:text-primary transition-colors truncate">
                                    {match.team_a_name} vs {match.team_b_name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex justify-between items-center py-4 border-t border-border/40">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{match.local_score || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase">{match.team_a_name}</div>
                                    </div>
                                    <div className="text-muted-foreground font-mono text-sm">vs</div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-white">{match.visitor_score || 0}</div>
                                        <div className="text-xs text-muted-foreground uppercase">{match.team_b_name}</div>
                                    </div>
                                </div>
                                <div className="mt-4 flex justify-end">
                                    <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground group-hover:text-primary">
                                        Ver Detalles <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

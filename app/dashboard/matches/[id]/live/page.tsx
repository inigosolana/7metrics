"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { getMatchDetailsAction, registerEventAction } from "@/app/actions/sevenmetrics"
import { type Match, type Player } from "@/lib/api/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, ArrowLeft, Trophy, XCircle, RotateCcw, ShieldAlert } from "lucide-react"

// Types
type WizardStep = 'SELECT_PLAYER' | 'SELECT_ACTION' | 'SELECT_ZONE'
type ActionType = 'GOL' | 'FALLO' | 'PÉRDIDA' | 'RECUPERACIÓN' | 'PARADA'

export default function LiveLoggerPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const matchId = params.id as string

    // State
    const [match, setMatch] = useState<Match | null>(null)
    const [loading, setLoading] = useState(true)
    const [step, setStep] = useState<WizardStep>('SELECT_PLAYER')

    // Selection State
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null) // Storing jersey number
    const [selectedAction, setSelectedAction] = useState<ActionType | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Mock Players based on user request (using useClub style or just mock for this specific match context)
    // Since API might not return players yet, we generate a roster based on common handball numbers
    const roster = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 24]

    useEffect(() => {
        const loadMatch = async () => {
            const res = await getMatchDetailsAction(matchId)
            if (res.success && res.data) {
                setMatch(res.data.match)
            }
            setLoading(false)
        }
        loadMatch()
    }, [matchId])

    const handlePlayerClick = (number: number) => {
        setSelectedPlayer(number)
        setStep('SELECT_ACTION')
    }

    const handleActionClick = (action: ActionType) => {
        setSelectedAction(action)
        if (action === 'GOL' || action === 'FALLO' || action === 'PARADA') {
            setStep('SELECT_ZONE')
        } else {
            // Instant save for other events
            submitEvent(action, null)
        }
    }

    const handleZoneClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100

        // Map to zone string or keep raw coords? API expects string court_zone usually or x/y.
        // Schema says court_zone is string enum. We might need to map coords to zone name.
        // For now, let's map simply:
        let zone = "9m"
        if (y > 80) zone = "Extremo Izq" // simplified logic

        // Actually the API Event schema has coord_x/y mapped in our previous Supabase logic but 
        // the External API 'Event' schema shows 'court_zone' enum and 'goal_zone' integer.
        // The user asked to capture X/Y. I will try to pass X/Y in context or map it.
        // Let's pass it in 'context' array as string "x:..,y:.." since schema allows context string array.
        submitEvent(selectedAction!, { x, y, zone })
    }

    const submitEvent = async (action: ActionType, coords: any) => {
        if (!selectedPlayer) return
        setIsSaving(true)

        const eventPayload = {
            match_id: matchId,
            timestamp: Math.floor(Date.now() / 1000), // simplistic timestamp
            time_formatted: new Date().toISOString().substr(11, 5), // HH:MM
            player: selectedPlayer,
            team: 'A', // Defaulting to A for this logger
            action: action,
            court_zone: coords ? coords.zone : undefined,
            context: coords ? [`x:${coords.x.toFixed(1)}`, `y:${coords.y.toFixed(1)}`] : []
        }

        const res = await registerEventAction(eventPayload)

        if (res.success) {
            toast({
                title: "Evento Registrado",
                description: `${action} - Jugador #${selectedPlayer}`,
                duration: 2000,
                className: "bg-green-600 text-white border-none"
            })
        } else {
            toast({
                title: "Error",
                description: "No se pudo guardar el evento",
                variant: "destructive"
            })
        }

        // Reset
        setIsSaving(false)
        setStep('SELECT_PLAYER')
        setSelectedPlayer(null)
        setSelectedAction(null)
    }

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <header className="flex items-center justify-between p-4 border-b bg-card">
                <Button variant="ghost" onClick={() => router.back()}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Salir
                </Button>
                <div className="text-center">
                    <h1 className="font-bold text-lg">{match?.team_a_name} vs {match?.team_b_name}</h1>
                    <span className="text-xs text-muted-foreground">LIVE LOGGER</span>
                </div>
                <div className="w-20"></div>
            </header>

            <main className="flex-1 p-4 overflow-hidden relative">
                {/* Step 1: Player Grid */}
                {step === 'SELECT_PLAYER' && (
                    <div className="h-full flex flex-col">
                        <h2 className="text-xl font-bold mb-4 text-center">Selecciona Jugador</h2>
                        <div className="grid grid-cols-4 gap-4 flex-1 content-start">
                            {roster.map(num => (
                                <button
                                    key={num}
                                    onClick={() => handlePlayerClick(num)}
                                    className="aspect-square bg-secondary hover:bg-primary hover:text-white rounded-xl flex flex-col items-center justify-center transition-all duration-200 shadow-sm border-2 border-transparent hover:border-primary/50"
                                >
                                    <span className="text-4xl font-black">{num}</span>
                                    <span className="text-xs mt-1 opacity-70">Jugador</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 2: Action Grid */}
                {step === 'SELECT_ACTION' && (
                    <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Selecciona Acción</h2>
                            <div className="flex items-center gap-2">
                                <span className="bg-primary px-3 py-1 rounded text-primary-foreground font-bold">#{selectedPlayer}</span>
                                <Button variant="ghost" size="sm" onClick={() => setStep('SELECT_PLAYER')}>Cancelar</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 flex-1">
                            <button
                                onClick={() => handleActionClick('GOL')}
                                className="bg-green-500/10 border-2 border-green-500 hover:bg-green-500 hover:text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                            >
                                <Trophy className="h-12 w-12" />
                                <span className="text-2xl font-bold">GOL</span>
                            </button>

                            <button
                                onClick={() => handleActionClick('FALLO')}
                                className="bg-red-500/10 border-2 border-red-500 hover:bg-red-500 hover:text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                            >
                                <XCircle className="h-12 w-12" />
                                <span className="text-2xl font-bold">FALLO</span>
                            </button>

                            <button
                                onClick={() => handleActionClick('PÉRDIDA')}
                                className="bg-orange-500/10 border-2 border-orange-500 hover:bg-orange-500 hover:text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                            >
                                <ShieldAlert className="h-12 w-12" />
                                <span className="text-2xl font-bold">PÉRDIDA</span>
                            </button>

                            <button
                                onClick={() => handleActionClick('RECUPERACIÓN')}
                                className="bg-blue-500/10 border-2 border-blue-500 hover:bg-blue-500 hover:text-white rounded-2xl flex flex-col items-center justify-center gap-2 transition-all"
                            >
                                <RotateCcw className="h-12 w-12" />
                                <span className="text-2xl font-bold">RECUPERACIÓN</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Step 3: Court Modal */}
                <Dialog open={step === 'SELECT_ZONE'} onOpenChange={(open) => !open && setStep('SELECT_ACTION')}>
                    <DialogContent className="max-w-3xl w-full aspect-video bg-[#0A0A0A] border-none p-0 overflow-hidden">
                        <DialogHeader className="absolute top-4 left-4 z-10 bg-black/50 px-4 py-2 rounded">
                            <DialogTitle className="text-white">Marca la posición de lanzamiento</DialogTitle>
                        </DialogHeader>

                        {/* Court SVG */}
                        <div
                            className="w-full h-full relative cursor-crosshair group"
                            onClick={handleZoneClick}
                        >
                            {/* Handball Court SVG Representation */}
                            <svg width="100%" height="100%" viewBox="0 0 800 400" className="opacity-80 group-hover:opacity-100 transition-opacity">
                                <rect width="800" height="400" fill="#E8F5E9" /> {/* Floor */}
                                <rect x="50" y="50" width="700" height="300" fill="none" stroke="#2E7D32" strokeWidth="4" /> {/* Sidelines */}
                                <path d="M 50,200 L 750,200" stroke="#2E7D32" strokeWidth="2" strokeDasharray="10,5" /> {/* Halfway */}

                                {/* 6m Lines */}
                                <path d="M 50,140 Q 150,140 150,200 Q 150,260 50,260" fill="none" stroke="#2E7D32" strokeWidth="4" />
                                <path d="M 750,140 Q 650,140 650,200 Q 650,260 750,260" fill="none" stroke="#2E7D32" strokeWidth="4" />

                                {/* 9m Lines */}
                                <path d="M 50,110 Q 180,110 180,200 Q 180,290 50,290" fill="none" stroke="#2E7D32" strokeWidth="2" strokeDasharray="5,5" />
                                <path d="M 750,110 Q 620,110 620,200 Q 620,290 750,290" fill="none" stroke="#2E7D32" strokeWidth="2" strokeDasharray="5,5" />
                            </svg>

                            {/* Hover effect to show click intent */}
                            <div className="absolute inset-0 bg-transparent hover:bg-white/5 pointer-events-none" />
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Loading/Saving Overlay */}
                {isSaving && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <Loader2 className="w-16 h-16 animate-spin text-white" />
                    </div>
                )}
            </main>
        </div>
    )
}

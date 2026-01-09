"use client"

import { useState, useRef, useMemo } from "react"
import { VideoSmartPlayer } from "./video-smart-player"
import { ActionCutter } from "./action-cutter"
import { Button } from "@/components/ui/button"
import { Download, Trash2, Filter, Activity, Share2, BrainCircuit, Check, X, Loader2, Film } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MatchStatsDashboard } from "./match-stats-dashboard"

// Mock data types until we have the full DB types
export interface VideoAction {
    id: string
    startTime: number
    endTime: number
    eventType: string
    teamId: string
    playerId: string
    tags: string[]
    phase?: string
    state?: string
    isVerified?: boolean
    confidenceScore?: number
    feedbackStatus?: 'pending' | 'approved' | 'rejected' | 'corrected'
}

interface VideoStudioLayoutProps {
    videoUrl: string
    initialActions?: VideoAction[]
}

export function VideoStudioLayout({ videoUrl, initialActions = [] }: VideoStudioLayoutProps) {
    const [currentTime, setCurrentTime] = useState(0)
    const [actions, setActions] = useState<VideoAction[]>(initialActions)
    const [seekTarget, setSeekTarget] = useState<number | null>(null)

    // Filtering State
    const [showFilters, setShowFilters] = useState(false)
    const [filterTeam, setFilterTeam] = useState<string>("all")
    const [filterPlayer, setFilterPlayer] = useState<string>("")

    const handleSaveAction = (newAction: any) => {
        const actionWithId = {
            ...newAction,
            id: crypto.randomUUID(),
        }
        setActions(prev => [...prev, actionWithId])
    }

    const handleDeleteAction = (id: string) => {
        setActions(prev => prev.filter(a => a.id !== id))
    }

    const handleJumpToAction = (time: number) => {
        setSeekTarget(time)
        // Reset seek target after short delay to allow re-seek if needed, 
        // though the useEffect in player handles changes.
        // If we click same timestamp twice, it won't trigger change.
        // A random epsilon could fix this, or a timestamp in the prop.
        setTimeout(() => setSeekTarget(null), 100)
    }

    const handleDownloadClip = (action: VideoAction) => {
        // Build the URL for the cut endpoint
        const params = new URLSearchParams({
            video: videoUrl,
            start: action.startTime.toString(),
            end: action.endTime.toString(),
            label: `${action.eventType}_${action.teamId}_${action.playerId || 'unknown'}`
        })
        const url = `/api/video/cut?${params.toString()}`

        // Trigger download
        const a = document.createElement('a')
        a.href = url
        a.download = '' // filename is set by Content-Disposition header
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const [isScanning, setIsScanning] = useState(false)

    const handleAiScan = async () => {
        setIsScanning(true)
        try {
            const res = await fetch('/api/ai/scan', { method: 'POST' })
            const data = await res.json()

            if (data.success && data.events) {
                const aiActions = data.events.map((e: any) => ({
                    id: crypto.randomUUID(),
                    startTime: e.time_seconds,
                    endTime: e.end_time || e.time_seconds + 5,
                    eventType: e.event_type,
                    teamId: e.team_id,
                    playerId: '', // AI might not know player yet
                    tags: e.tags || [],
                    phase: e.phase,
                    state: e.state,
                    isVerified: false,
                    confidenceScore: e.confidence_score,
                    feedbackStatus: 'pending'
                }))
                setActions(prev => [...prev, ...aiActions])
            }
        } catch (error) {
            console.error("AI Scan failed", error)
        } finally {
            setIsScanning(false)
        }
    }

    const handleVerifyAction = (id: string, status: 'approved' | 'rejected') => {
        setActions(prev => prev.map(a => {
            if (a.id !== id) return a
            if (status === 'rejected') return { ...a, feedbackStatus: 'rejected' } // Or delete? Let's keep marked as rejected for training
            return { ...a, isVerified: true, feedbackStatus: 'approved' }
        }))
        // If rejected, we might want to filter it out from visuals or keep it greyed out?
        if (status === 'rejected') {
            // Option: Remove from list immediately or keep 'deleted' state
            // For "Learning Loop", keeping it as "Rejected" is valuable.
            // But for UI clutter, maybe hide it.
            // Let's hide it from the main list but keep in DB (logic for later).
            // For now, let's just remove it from the view effectively.
            setActions(prev => prev.filter(a => a.id !== id))
        }
    }

    const handleDownloadData = (action: VideoAction) => {
        const data = JSON.stringify(action, null, 2)
        const blob = new Blob([data], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `action-${action.teamId}-${action.eventType}-${action.startTime.toFixed(0)}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Filtered Actions
    const filteredActions = useMemo(() => {
        return actions.filter(action => {
            if (filterTeam !== "all" && action.teamId !== filterTeam) return false
            if (filterPlayer && action.playerId !== filterPlayer) return false
            return true
        })
    }, [actions, filterTeam, filterPlayer])

    // Auto-Stats Calculation
    const stats = useMemo(() => {
        const calculateStats = (teamActions: VideoAction[]) => {
            const goals = teamActions.filter(a => a.eventType === 'goal').length
            const saves = teamActions.filter(a => a.eventType === 'save').length
            const misses = teamActions.filter(a => a.eventType === 'miss').length
            const shots = goals + saves + misses

            return {
                goals,
                saves,
                shots,
                shootingPct: shots > 0 ? ((goals / shots) * 100).toFixed(1) : "0.0",
                // Simple counts for now
                steals: teamActions.filter(a => a.eventType === 'steal').length,
                turnovers: teamActions.filter(a => a.eventType === 'turnover').length
            }
        }

        const homeActions = actions.filter(a => a.teamId === 'home')
        const awayActions = actions.filter(a => a.teamId === 'away')

        return {
            home: calculateStats(homeActions),
            away: calculateStats(awayActions),
            totalActions: actions.length
        }
    }, [actions])

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60)
        const secs = Math.floor(time % 60)
        return `${mins}:${secs.toString().padStart(2, "0")}`
    }

    return (
        <Tabs defaultValue="studio" className="h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-center mb-4">
                <TabsList>
                    <TabsTrigger value="studio">Studio & Cutting</TabsTrigger>
                    <TabsTrigger value="stats">Match Stats (Advanced)</TabsTrigger>
                </TabsList>
            </div>

            <TabsContent value="studio" className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
                {/* Left Column: Player & Basic Stats */}
                <div className="lg:col-span-2 flex flex-col gap-4 h-full overflow-y-auto pr-2">
                    <VideoSmartPlayer
                        src={videoUrl}
                        onvideoTimeUpdate={setCurrentTime}
                        seekTo={seekTarget}
                    />

                    {/* Basic Stats Dashboard (Mini) */}
                    <div className="grid grid-cols-2 gap-4">
                        <Card>
                            <CardHeader className="py-2">
                                <CardTitle className="text-sm font-medium text-center">Home (Quick)</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div>
                                        <div className="font-bold text-lg">{stats.home.goals}/{stats.home.shots}</div>
                                        <div className="text-[10px] text-muted-foreground">Shooting</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{stats.home.shootingPct}%</div>
                                        <div className="text-[10px] text-muted-foreground">Eff</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{stats.home.turnovers}</div>
                                        <div className="text-[10px] text-muted-foreground">TO</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="py-2">
                                <CardTitle className="text-sm font-medium text-center">Away (Quick)</CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                                    <div>
                                        <div className="font-bold text-lg">{stats.away.goals}/{stats.away.shots}</div>
                                        <div className="text-[10px] text-muted-foreground">Shooting</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{stats.away.shootingPct}%</div>
                                        <div className="text-[10px] text-muted-foreground">Eff</div>
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{stats.away.turnovers}</div>
                                        <div className="text-[10px] text-muted-foreground">TO</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Right Column: Tools */}
                <div className="flex flex-col gap-4 h-full overflow-hidden">
                    <div className="flex-none">
                        <ActionCutter
                            currentTime={currentTime}
                            onSeek={() => { }}
                            onSave={handleSaveAction}
                        />
                    </div>
                    {/* Card Container for Actions List starts here... (Action List kept below in next chunk if needed, but we need to close the TabsContent properly) */}
                    <Card className="flex-1 flex flex-col min-h-0 border-l-4 border-l-primary/20">
                        <CardHeader className="py-3 px-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary" />
                                    <CardTitle className="text-base">Actions ({filteredActions.length})</CardTitle>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="ml-2 h-7 gap-1 text-xs border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300"
                                        onClick={handleAiScan}
                                        disabled={isScanning}
                                    >
                                        {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                                        {isScanning ? "Scanning..." : "AI Auto-Clip"}
                                    </Button>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Button variant={showFilters ? "secondary" : "ghost"} size="icon" className="h-8 w-8" onClick={() => setShowFilters(!showFilters)}>
                                        <Filter className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Filters Panel */}
                            {showFilters && (
                                <div className="pt-3 flex gap-2 animate-in slide-in-from-top-2">
                                    <Select value={filterTeam} onValueChange={setFilterTeam}>
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Team" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Teams</SelectItem>
                                            <SelectItem value="home">Home</SelectItem>
                                            <SelectItem value="away">Away</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        className="h-8 text-xs"
                                        placeholder="Player #"
                                        value={filterPlayer}
                                        onChange={(e) => setFilterPlayer(e.target.value)}
                                    />
                                </div>
                            )}
                        </CardHeader>

                        <CardContent className="flex-1 overflow-hidden p-0 relative bg-muted/5">
                            <div className="h-full w-full overflow-y-auto px-2 py-2">
                                <div className="space-y-2">
                                    {filteredActions.slice().reverse().map((action) => (
                                        <div
                                            key={action.id}
                                            className={`
                                                relative border rounded-lg p-3 hover:shadow-md transition-shadow flex items-start gap-3 group
                                                ${!action.isVerified && action.confidenceScore ? 'border-dashed border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/20' : 'bg-background'}
                                            `}
                                        >
                                            <div
                                                className="mt-1 cursor-pointer bg-primary/10 text-primary rounded px-2 py-1 text-xs font-mono font-bold hover:bg-primary/20"
                                                onClick={() => handleJumpToAction(action.startTime)}
                                                title="Click to Jump to Video"
                                            >
                                                {formatTime(action.startTime)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <Badge variant={action.teamId === 'home' ? 'default' : 'secondary'} className="text-[10px] uppercase h-5 px-1.5">
                                                        {action.teamId === 'home' ? 'Home' : 'Away'}
                                                    </Badge>
                                                    <span className="font-semibold text-sm capitalize">{action.eventType.replace('_', ' ')}</span>
                                                    {!action.isVerified && action.confidenceScore && (
                                                        <Badge variant="outline" className="text-[10px] h-5 px-1 border-blue-400 text-blue-600">
                                                            {(action.confidenceScore * 100).toFixed(0)}% AI
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-1 flex gap-2 items-center">
                                                    <span>#{action.playerId || '?'}</span>
                                                    {action.tags.length > 0 && <span>•</span>}
                                                    {action.phase && <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1 rounded">{action.phase}</span>}
                                                    <div className="flex gap-1 overflow-hidden">
                                                        {action.tags.map(tag => (
                                                            <span key={tag} className="bg-muted px-1 rounded text-[10px]">{tag}</span>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Verification Buttons */}
                                                {!action.isVerified && action.feedbackStatus === 'pending' && (
                                                    <div className="flex gap-2 mt-2">
                                                        <Button
                                                            size="sm"
                                                            className="h-6 gap-1 bg-green-600 hover:bg-green-700 text-white text-[10px] px-2"
                                                            onClick={() => handleVerifyAction(action.id, 'approved')}
                                                        >
                                                            <Check className="w-3 h-3" /> Confirm
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-6 gap-1 text-destructive border-destructive/50 hover:bg-destructive/10 text-[10px] px-2"
                                                            onClick={() => handleVerifyAction(action.id, 'rejected')}
                                                        >
                                                            <X className="w-3 h-3" /> Reject
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 bg-background/80 p-1 rounded backdrop-blur-sm">
                                                {action.isVerified && (
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-6 w-6 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                                        title="Download Physical Clip (MP4)"
                                                        onClick={() => handleDownloadClip(action)}
                                                    >
                                                        <Film className="w-3 h-3" />
                                                    </Button>
                                                )}
                                                <Button size="icon" variant="ghost" className="h-6 w-6" title="Download Metadata (JSON)" onClick={() => handleDownloadData(action)}>
                                                    <Download className="w-3 h-3" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-6 w-6 text-destructive hover:text-destructive"
                                                    onClick={() => handleDeleteAction(action.id)}
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                    {filteredActions.length === 0 && (
                                        <div className="p-8 text-center text-muted-foreground text-sm">
                                            No actions found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="stats" className="flex-1 overflow-y-auto p-6">
                <MatchStatsDashboard actions={actions} homeName="Home" awayName="Away" />
            </TabsContent>
        </Tabs>
    )
}

"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Film, Wand2, ArrowLeft, BrainCircuit, PlayCircle, Loader2 } from "lucide-react"
import { VideoStudioLayout } from "@/components/match/video-studio-layout"

export default function VideoAnalysisPage() {
    const { matches } = useClub()
    const [selectedMatchId, setSelectedMatchId] = useState<string>("")
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [viewMode, setViewMode] = useState<"upload" | "studio">("upload")

    // New State for Dual Mode
    const [analysisMode, setAnalysisMode] = useState<'none' | 'manual' | 'auto'>('none')
    const [initialActions, setInitialActions] = useState<any[]>([])
    const [processing, setProcessing] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadedFile(file)
            setVideoUrl(URL.createObjectURL(file))
        }
    }

    const handleEnterStudio = () => {
        if (videoUrl) {
            setViewMode("studio")
        }
    }

    const handleModeSelect = async (mode: 'manual' | 'auto') => {
        if (mode === 'manual') {
            setAnalysisMode('manual')
        } else {
            setAnalysisMode('auto')
            setProcessing(true)
            try {
                // Determine if we should use Mock or Real AI based on env or just call the same endpoint
                // The endpoint /api/ai/scan is currently the mock one.
                // We will update it later to call python if available.
                const res = await fetch('/api/ai/scan', { method: 'POST' })
                const data = await res.json()

                if (data.success && data.events) {
                    const aiActions = data.events.map((e: any) => ({
                        id: crypto.randomUUID(),
                        startTime: e.time_seconds,
                        endTime: e.end_time || e.time_seconds + 5,
                        eventType: e.event_type,
                        teamId: e.team_id,
                        playerId: '',
                        tags: e.tags || [],
                        phase: e.phase,
                        state: e.state,
                        isVerified: false,
                        confidenceScore: e.confidence_score,
                        feedbackStatus: 'pending'
                    }))
                    setInitialActions(aiActions)
                }
            } catch (error) {
                console.error("AI Scan Failed", error)
            } finally {
                setProcessing(false)
            }
        }
    }


    // Intercept Studio View for Mode Selection
    if (viewMode === "studio") {
        return (
            <div className="flex flex-col h-full gap-4">
                <div className="flex items-center gap-4 border-b pb-4">
                    <Button variant="ghost" size="sm" onClick={() => { setViewMode("upload"); setAnalysisMode('none'); }}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Upload
                    </Button>
                    <h2 className="font-bold text-lg">Video Analysis Studio</h2>
                    <span className="text-muted-foreground text-sm">
                        {uploadedFile?.name}
                    </span>
                </div>

                {analysisMode === 'none' ? (
                    <div className="flex-1 flex items-center justify-center p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl w-full">
                            {/* Manual Mode Card */}
                            <Card
                                className="cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group"
                                onClick={() => handleModeSelect('manual')}
                            >
                                <CardHeader className="text-center">
                                    <div className="mx-auto p-4 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors mb-4">
                                        <PlayCircle className="w-12 h-12 text-primary" />
                                    </div>
                                    <CardTitle>Manual Studio</CardTitle>
                                    <CardDescription>
                                        Use the advanced cutting tools manually. Best for precise, human-controlled analysis.
                                    </CardDescription>
                                </CardHeader>
                            </Card>

                            {/* AI Auto Mode Card */}
                            <Card
                                className="cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group border-dashed border-2"
                                onClick={() => handleModeSelect('auto')}
                            >
                                <CardHeader className="text-center">
                                    <div className="mx-auto p-4 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors mb-4">
                                        <BrainCircuit className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <CardTitle className="text-blue-700 dark:text-blue-300">AI Auto-Analysis</CardTitle>
                                    <CardDescription>
                                        Let the AI scan the match to detect goals, plays & efficiency automatically.
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </div>
                    </div>
                ) : processing ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6">
                        <Loader2 className="w-16 h-16 animate-spin text-primary" />
                        <div className="text-center space-y-2">
                            <h3 className="text-2xl font-bold">AI is analyzing the match...</h3>
                            <p className="text-muted-foreground">Detecting events, tracking players, and analyzing phases.</p>
                        </div>
                    </div>
                ) : (
                    <VideoStudioLayout videoUrl={videoUrl} initialActions={initialActions} />
                )}
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto pt-8">
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold">Video Analysis Center</h1>
                <p className="text-muted-foreground">Upload match footage to start cutting clips and analyzing performance.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Session Setup</CardTitle>
                    <CardDescription>Select a match and upload video file.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Match Context</Label>
                            <Select value={selectedMatchId} onValueChange={setSelectedMatchId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select match..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {matches.map(m => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.teamName} vs {m.rival}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="training">Training Session</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Video Source</Label>
                            <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="video-upload"
                                />
                                <label htmlFor="video-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Film className="w-8 h-8 text-muted-foreground" />
                                    <span className="font-medium text-sm">
                                        {uploadedFile ? uploadedFile.name : "Click to select video"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button
                            size="lg"
                            disabled={!videoUrl}
                            onClick={handleEnterStudio}
                            className="w-full md:w-auto gap-2"
                        >
                            <Wand2 className="w-4 h-4" />
                            Enter Studio
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

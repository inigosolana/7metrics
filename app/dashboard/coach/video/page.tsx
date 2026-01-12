"use client"

import { useState } from "react"
import { useClub } from "@/contexts/club-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, Film, Wand2, ArrowLeft, BrainCircuit, PlayCircle, Loader2 } from "lucide-react"
import { VideoStudioLayout } from "@/components/match/video-studio-layout"
import { Progress } from "@/components/ui/progress"

export default function VideoAnalysisPage() {
    const { matches } = useClub()
    const [selectedMatchId, setSelectedMatchId] = useState<string>("")
    const [videoUrl, setVideoUrl] = useState<string>("")
    const [uploadedFile, setUploadedFile] = useState<File | null>(null)
    const [viewMode, setViewMode] = useState<"upload" | "studio">("upload")

    // New State for Dual Mode
    const [analysisMode, setAnalysisMode] = useState<'none' | 'manual' | 'auto'>('none')
    const [initialActions, setInitialActions] = useState<any[]>([])

    // Corrected State
    const [processing, setProcessing] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    // Progress Logic
    const [progress, setProgress] = useState(0)
    const [estimatedTime, setEstimatedTime] = useState(0)
    const [timeLeft, setTimeLeft] = useState(0)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setUploadedFile(file)

            // Temporary blob for immediate feedback
            const blobUrl = URL.createObjectURL(file)
            setVideoUrl(blobUrl)

            // Auto-upload using XHR for progress
            setIsUploading(true)
            setUploadProgress(0)

            const xhr = new XMLHttpRequest()
            xhr.open('POST', `/api/upload?filename=${encodeURIComponent(file.name)}`, true)
            xhr.setRequestHeader('Content-Type', 'application/octet-stream')

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100
                    setUploadProgress(percentComplete)
                }
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    try {
                        const data = JSON.parse(xhr.responseText)
                        if (data.success) {
                            setVideoUrl(data.url)
                            console.log("Uploaded video to:", data.url)
                        } else {
                            alert("Upload failed. AI analysis might not work.")
                        }
                    } catch (e) {
                        console.error("JSON Parse error", e)
                    }
                } else {
                    alert("Upload error")
                }
                setIsUploading(false)
            }

            xhr.onerror = () => {
                console.error("Upload failed")
                alert("Upload failed")
                setIsUploading(false)
            }

            xhr.send(file)
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
                const res = await fetch('/api/ai/scan', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ videoPath: videoUrl })
                })
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
                        feedbackStatus: 'pending',
                        clipPath: e.clip_path
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

    // Helper to get video duration
    const getVideoDuration = (file: File): Promise<number> => {
        return new Promise((resolve) => {
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src)
                resolve(video.duration)
            }
            video.src = URL.createObjectURL(file)
        })
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
                                className={`cursor-pointer transition-all group ${isUploading ? 'opacity-90 pointer-events-none' : 'hover:border-primary hover:bg-primary/5'}`}
                                onClick={() => !isUploading && handleModeSelect('manual')}
                            >
                                <CardHeader className="text-center">
                                    <div className="mx-auto p-4 rounded-full bg-secondary group-hover:bg-primary/20 transition-colors mb-4">
                                        {isUploading ? <Loader2 className="w-12 h-12 animate-spin text-primary" /> : <PlayCircle className="w-12 h-12 text-primary" />}
                                    </div>
                                    <CardTitle>Manual Studio</CardTitle>
                                    <CardDescription>
                                        Use the advanced cutting tools manually.
                                    </CardDescription>
                                    {isUploading && (
                                        <div className="pt-4 space-y-2">
                                            <Progress value={uploadProgress} className="h-2" />
                                            <p className="text-xs text-muted-foreground">{Math.round(uploadProgress)}% Uploaded</p>
                                        </div>
                                    )}
                                </CardHeader>
                            </Card>

                            {/* AI Auto Mode Card */}
                            <Card
                                className={`cursor-pointer transition-all group border-dashed border-2 ${isUploading ? 'opacity-90 pointer-events-none' : 'hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30'}`}
                                onClick={async () => {
                                    if (isUploading) return
                                    if (uploadedFile) {
                                        const duration = await getVideoDuration(uploadedFile)
                                        // Estimate: Processing takes roughly same time as video duration (1x) to be safe
                                        const estimatedSeconds = Math.ceil(duration * 1.2)
                                        setEstimatedTime(estimatedSeconds)
                                        setTimeLeft(estimatedSeconds)
                                        setProgress(0)

                                        // Real Status Polling
                                        // The scan request is blocking, so we need a separate interval to poll status

                                        const statusInterval = setInterval(async () => {
                                            if (!videoUrl) return
                                            try {
                                                const res = await fetch(`/api/ai/status?videoPath=${encodeURIComponent(videoUrl)}`)
                                                const data = await res.json()
                                                if (data.success && typeof data.progress === 'number') {
                                                    setProgress(data.progress)
                                                    // Optional: Update status text if we added that state
                                                }
                                            } catch (e) {
                                                console.error("Status poll error", e)
                                            }
                                        }, 1000)

                                        try {
                                            await handleModeSelect('auto')
                                        } finally {
                                            clearInterval(statusInterval)
                                            setProgress(100)
                                            setTimeLeft(0)
                                        }
                                    } else {
                                        handleModeSelect('auto')
                                    }
                                }}
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
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 max-w-md mx-auto w-full">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 animate-spin text-primary" />
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                                {Math.round(progress)}%
                            </div>
                        </div>
                        <div className="text-center space-y-2 w-full">
                            <h3 className="text-2xl font-bold">AI is analyzing the match...</h3>
                            <p className="text-muted-foreground">Detecting events, tracking players, and analyzing phases.</p>

                            <div className="space-y-1 pt-4">
                                <Progress value={progress} className="h-3 w-full" />
                                <div className="flex justify-between text-xs text-muted-foreground px-1">
                                    <span>Progress</span>
                                    <span>{Math.round(progress)}% completed</span>
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground pt-2">
                                Please do not close this tab. The process is running on the server.
                            </p>
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

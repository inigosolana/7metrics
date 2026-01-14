import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const body = await req.json()
        const { videoPath } = body

        if (!videoPath) {
            return NextResponse.json({ success: false, error: "No videoPath provided" }, { status: 400 })
        }

        // Real AI Integration
        const pythonScript = path.join(process.cwd(), 'python', 'handball_pipeline.py')

        // Resolve path: Ensure we point to the physical file in public/uploads
        let absoluteVideoPath = videoPath

        // Fix for Windows: path.isAbsolute might return true for '/uploads/...' but we need the full C:\ path
        if (videoPath.startsWith('/uploads') || videoPath.startsWith('\\uploads') || !path.isAbsolute(videoPath)) {
            const relativePath = videoPath.replace(/^[\/\\]/, '') // Remove leading slash
            absoluteVideoPath = path.join(process.cwd(), 'public', relativePath)
        }

        console.log(`Running analysis on: ${absoluteVideoPath}`)

        return new Promise((resolve) => {
            // Create progress file path
            const progressFile = `${absoluteVideoPath}.progress.json`;

            const pyProcess = spawn('python', [
                pythonScript,
                '--video', absoluteVideoPath,
                '--progress-file', progressFile,
                '--export-clips' // Defaulting to export clips as per user preference
            ]);

            let dataString = ''
            let errorString = ''

            pyProcess.stdout.on('data', (data: Buffer) => {
                const msg = data.toString()
                dataString += msg
                // console.log("Python Output:", msg) // Too verbose for large JSON
            })

            pyProcess.stderr.on('data', (data: Buffer) => {
                const msg = data.toString()
                errorString += msg
                console.log("Python Log:", msg) // Log progress and errors
            })

            pyProcess.on('close', (code: number) => {
                if (code !== 0) {
                    console.error("Python Error:", errorString)
                    resolve(NextResponse.json({ success: false, error: subProcessError(errorString) }, { status: 500 }))
                } else {
                    try {
                        const result = JSON.parse(dataString)
                        // Delete progress file after successful processing
                        try {
                            if (fs.existsSync(progressFile)) {
                                fs.unlinkSync(progressFile);
                                console.log(`Deleted progress file: ${progressFile}`);
                            }
                        } catch (e) {
                            console.error(`Failed to delete progress file ${progressFile}:`, e);
                        }
                        resolve(NextResponse.json(result))
                    } catch (e) {
                        console.error("JSON Parse Error:", dataString)
                        resolve(NextResponse.json({ success: false, error: "Failed to parse Python output" }, { status: 500 }))
                    }
                }
            })
        })

    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
    }

    // Helper to clean up python error message
    function subProcessError(stderr: string) {
        return stderr || "Unknown Python error"
    }
}

function getMockData() {
    return {
        success: true,
        events: [
            {
                time_seconds: 15,
                end_time: 22,
                event_type: "goal",
                team_id: "home",
                confidence_score: 0.98,
                model_version: "yolo_v8_handball_v1",
                phase: "fastbreak",
                state: "6v6",
                tags: ["auto_detected", "fast_break"]
            },
            {
                time_seconds: 45,
                end_time: 50,
                event_type: "turnover",
                team_id: "away",
                confidence_score: 0.85,
                model_version: "yolo_v8_handball_v1",
                phase: "positional",
                state: "6v6",
                tags: ["auto_detected"]
            },
            {
                time_seconds: 120,
                end_time: 128,
                event_type: "save",
                team_id: "home",
                confidence_score: 0.92,
                model_version: "yolo_v8_handball_v1",
                phase: "positional",
                state: "6v5",
                tags: ["auto_detected", "wing_shot"]
            },
            {
                time_seconds: 200,
                end_time: 210,
                event_type: "goal",
                team_id: "away",
                confidence_score: 0.88,
                model_version: "yolo_v8_handball_v1",
                phase: "counter_attack",
                state: "6v6",
                tags: ["auto_detected"]
            }
        ]
    }
}

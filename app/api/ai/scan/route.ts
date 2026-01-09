import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(req: Request) {
    // try {
    //     // Real AI Integration
    //     // In a production env, you might use a Queue (BullMQ) + Worker
    //     const pythonScript = path.join(process.cwd(), 'python', 'detect_actions.py')
    //     // We mock a video path for the script. In reality, pass the req.body.videoPath
    //     const videoPath = "mock_video.mp4" 

    //     return new Promise((resolve) => {
    //         const pyProcess = spawn('python', [pythonScript, '--video', videoPath])

    //         let dataString = ''
    //         let errorString = ''

    //         pyProcess.stdout.on('data', (data) => {
    //             dataString += data.toString()
    //         })

    //         pyProcess.stderr.on('data', (data) => {
    //             errorString += data.toString()
    //         })

    //         pyProcess.on('close', (code) => {
    //             if (code !== 0) {
    //                 console.error("Python Error:", errorString)
    //                 // Fallback to Mock if python fails (e.g. not installed)
    //                 resolve(NextResponse.json(getMockData())) 
    //             } else {
    //                 try {
    //                     const result = JSON.parse(dataString)
    //                     resolve(NextResponse.json(result))
    //                 } catch (e) {
    //                     resolve(NextResponse.json(getMockData()))
    //                 }
    //             }
    //         })
    //     })

    // } catch (e) {
    //     return NextResponse.json(getMockData())
    // }

    // FOR DEMO STABILITY: keeping the Mock active but "Simulating" the Python delay
    // To enable Python, uncomment above and remove below.
    await new Promise(r => setTimeout(r, 2000))
    return NextResponse.json(getMockData())
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

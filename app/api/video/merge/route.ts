import { NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

export async function POST(req: Request): Promise<NextResponse> {
    try {
        const body = await req.json()
        const { clips, outputName } = body

        if (!clips || !Array.isArray(clips) || clips.length === 0) {
            return NextResponse.json({ success: false, error: "No clips provided" }, { status: 400 })
        }

        const scriptPath = path.join(process.cwd(), 'python', 'merge_clips.py')

        // Convert web paths (e.g. /clips/job/event.mp4) to absolute system paths
        const absoluteClips = clips.map(c => {
            // Remove leading slash if present
            const cleanPath = c.startsWith('/') ? c.substring(1) : c
            return path.join(process.cwd(), 'public', cleanPath)
        })

        // Output file
        // Save in public/clips/merged/
        const mergeDir = path.join(process.cwd(), 'public', 'clips', 'merged')
        if (!fs.existsSync(mergeDir)) {
            fs.mkdirSync(mergeDir, { recursive: true })
        }

        const fileName = outputName || `merged_${Date.now()}.mp4`
        const outputPath = path.join(mergeDir, fileName)

        console.log(`Merging ${clips.length} clips into ${outputPath}`)

        return new Promise((resolve) => {
            const pyProcess = spawn('python', [
                scriptPath,
                '--json-input', JSON.stringify(absoluteClips),
                '--output', outputPath
            ])

            let dataString = ''
            let errorString = ''

            pyProcess.stdout.on('data', (data: Buffer) => {
                dataString += data.toString()
            })

            pyProcess.stderr.on('data', (data: Buffer) => {
                errorString += data.toString()
            })

            pyProcess.on('close', (code: number) => {
                if (code !== 0) {
                    console.error("Merge Error:", errorString)
                    resolve(NextResponse.json({ success: false, error: "Failed to merge videos" }, { status: 500 }))
                } else {
                    try {
                        const result = JSON.parse(dataString)
                        if (result.success) {
                            // Return web-accessible URL
                            const webUrl = `/clips/merged/${fileName}`
                            resolve(NextResponse.json({ success: true, url: webUrl }))
                        } else {
                            resolve(NextResponse.json(result, { status: 500 }))
                        }
                    } catch (e) {
                        resolve(NextResponse.json({ success: false, error: "Invalid Output" }, { status: 500 }))
                    }
                }
            })
        })

    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
    }
}

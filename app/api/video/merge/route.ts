import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'
import os from 'os'

// Helper to sanitize filename
function sanitize(str: string) {
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { videoUrl, clips } = body

        if (!videoUrl || !clips || !Array.isArray(clips) || clips.length === 0) {
            return NextResponse.json({ error: 'Missing videoUrl or clips' }, { status: 400 })
        }

        // Resolve Local Video Path
        let sourceVideoPath = videoUrl
        if (!videoUrl.startsWith('http')) {
            const relativePath = videoUrl.startsWith('/') ? videoUrl.slice(1) : videoUrl
            const publicPath = path.join(process.cwd(), 'public', relativePath)
            if (fs.existsSync(publicPath)) {
                sourceVideoPath = publicPath
            }
        }

        // Create a temporary directory for this merge operation
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'handball-merge-'))
        const listFilePath = path.join(tempDir, 'list.txt')
        const outputFilePath = path.join(tempDir, 'montage.mp4')
        const segmentFiles: string[] = []

        // 1. Cut each segment individually
        // We do this to ensure precise seeking and avoid complex filter_complex commands for now
        // A more efficient way is using filter_complex, but this is robust.

        const cutPromises = clips.map((clip: any, index: number) => {
            return new Promise<void>((resolve, reject) => {
                const segmentPath = path.join(tempDir, `seg_${index}.mp4`)
                segmentFiles.push(segmentPath)

                const start = clip.startTime.toString()
                const duration = (parseFloat(clip.endTime) - parseFloat(clip.startTime)).toString()

                // ffmpeg -ss [start] -i [input] -t [duration] -c copy [output]
                // Note: -c copy is fast but might not be frame-perfect at cut points. 
                // keyframe issues might occur. If so, remove "-c copy" to re-encode (slower).
                // For reliability with web-players, re-encoding is safer but slower. 
                // Let's try re-encoding with fast preset for now to ensure smooth playback.

                const args = [
                    '-ss', start,
                    '-i', sourceVideoPath,
                    '-t', duration,
                    '-c:v', 'libx264', // Re-encode video
                    '-c:a', 'aac',     // Re-encode audio
                    '-preset', 'ultrafast',
                    '-y',
                    segmentPath
                ]

                const ff = spawn('ffmpeg', args)

                ff.on('close', (code) => {
                    if (code === 0) resolve()
                    else reject(new Error(`FFmpeg cut failed for clip ${index}`))
                })
            })
        })

        await Promise.all(cutPromises)

        // 2. Create Concat List File
        // file 'seg_0.mp4'
        // file 'seg_1.mp4'
        const listContent = segmentFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n')
        fs.writeFileSync(listFilePath, listContent)

        // 3. Concatenate
        // ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4
        await new Promise<void>((resolve, reject) => {
            const args = [
                '-f', 'concat',
                '-safe', '0',
                '-i', listFilePath,
                '-c', 'copy', // Copy since we just re-encoded them to uniform format
                '-y',
                outputFilePath
            ]

            const ff = spawn('ffmpeg', args)

            ff.on('close', (code) => {
                if (code === 0) resolve()
                else reject(new Error('FFmpeg concat failed'))
            })
        })

        // 4. Read the file and stream response
        const fileBuffer = fs.readFileSync(outputFilePath)

        // Cleanup Sync
        try {
            fs.rmSync(tempDir, { recursive: true, force: true })
        } catch (e) { console.error("Cleanup error", e) }

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Disposition': `attachment; filename="montage_${Date.now()}.mp4"`
            }
        })

    } catch (error) {
        console.error("Merge Error", error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

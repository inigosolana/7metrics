import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'
import fs from 'fs'

// Helper to sanitize filename
function sanitize(str: string) {
    return str.replace(/[^a-z0-9]/gi, '_').toLowerCase()
}

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const videoUrl = searchParams.get('video')
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const label = searchParams.get('label') || 'clip'

    if (!videoUrl || !start || !end) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    // SECURITY NOTE: In a production app, you must validate videoUrl to prevent reading arbitrary files.
    // For this local demo, we assume the video is in the public folder or absolute path.
    // We'll try to resolve it relative to public first.

    let videoPath = videoUrl
    if (videoUrl.startsWith('http')) {
        // If it's a remote URL, ffmpeg handles it, but might be slow.
    } else {
        // Assume local file in public?
        // simple hack: remove leading slash
        const relativePath = videoUrl.startsWith('/') ? videoUrl.slice(1) : videoUrl
        const publicPath = path.join(process.cwd(), 'public', relativePath)
        if (fs.existsSync(publicPath)) {
            videoPath = publicPath
        }
    }

    const duration = parseFloat(end) - parseFloat(start)
    const filename = `${sanitize(label)}.mp4`

    // Reset headers to force download
    const headers = new Headers()
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    headers.set('Content-Type', 'video/mp4')

    // Create a TransformStream to pipe ffmpeg stdout to response
    const { readable, writable } = new TransformStream()
    const writer = writable.getWriter()

    const ffmpeg = spawn('ffmpeg', [
        '-ss', start,
        '-i', videoPath,
        '-t', duration.toString(),
        '-c', 'copy', // Fast copy without re-encoding
        '-movflags', 'frag_keyframe+empty_moov', // Required for streaming MP4
        '-f', 'mp4',
        'pipe:1' // Output to stdout
    ])

    ffmpeg.stdout.on('data', (chunk) => {
        writer.write(chunk)
    })

    ffmpeg.stderr.on('data', (data) => {
        // console.log(`ffmpeg stderr: ${data}`)
    })

    ffmpeg.on('close', (code) => {
        writer.close()
    })

    ffmpeg.on('error', (err) => {
        console.error('Failed to start ffmpeg:', err)
        writer.abort(err)
    })

    return new NextResponse(readable, { headers })
}

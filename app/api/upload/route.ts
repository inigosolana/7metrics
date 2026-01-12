import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'
import { pipeline } from 'stream'
import { promisify } from 'util'
import { Readable } from 'stream'

const pump = promisify(pipeline)

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url)
        const filename = searchParams.get('filename')

        if (!filename || !req.body) {
            return NextResponse.json({ success: false, error: "No filename or body provided" }, { status: 400 })
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }

        // Sanitize
        const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filePath = path.join(uploadDir, safeName)

        // Check if we can write
        // Convert Web Stream (req.body) to Node Stream for pipeline
        // @ts-ignore
        const nodeStream = Readable.fromWeb(req.body)
        const fileStream = fs.createWriteStream(filePath)

        await pump(nodeStream, fileStream)

        const publicPath = `/uploads/${safeName}`
        return NextResponse.json({ success: true, url: publicPath })

    } catch (e) {
        console.error("Upload Error:", e)
        return NextResponse.json({ success: false, error: "Upload failed: " + String(e) }, { status: 500 })
    }
}

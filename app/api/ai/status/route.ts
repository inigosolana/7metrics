import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const videoPath = searchParams.get('videoPath');

    if (!videoPath) {
        return NextResponse.json({ success: false, error: 'Missing videoPath' }, { status: 400 });
    }

    try {
        // Resolve path similarly to scan route
        let absoluteVideoPath = videoPath;
        if (videoPath.startsWith('/uploads') || videoPath.startsWith('\\uploads') || !path.isAbsolute(videoPath)) {
            const relativePath = videoPath.replace(/^[\/\\]/, '')
            absoluteVideoPath = path.join(process.cwd(), 'public', relativePath);
        }

        const progressFile = `${absoluteVideoPath}.progress.json`;

        if (fs.existsSync(progressFile)) {
            const data = fs.readFileSync(progressFile, 'utf-8');
            try {
                const json = JSON.parse(data);
                return NextResponse.json({ success: true, ...json });
            } catch (e) {
                return NextResponse.json({ success: false, error: 'Invalid JSON' });
            }
        } else {
            return NextResponse.json({ success: false, progress: 0, status: 'starting' });
        }
    } catch (e) {
        return NextResponse.json({ success: false, error: String(e) }, { status: 500 });
    }
}

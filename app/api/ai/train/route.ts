import { NextResponse } from 'next/server'

export async function GET() {
    // In a real app, this would query the DB for:
    // SELECT * FROM match_events WHERE is_verified = true

    // Mock response demonstrating the data format for training
    const trainingData = [
        {
            image_path: "s3://bucket/clips/clip_123.mp4", // Or frame extraction path
            label: "goal",
            bbox: [0.1, 0.2, 0.3, 0.4], // Mock bounding box
            metadata: {
                phase: "fastbreak",
                state: "6v6"
            },
            verified_by: "coach_user_1",
            verified_at: new Date().toISOString()
        },
        // ... more examples
    ]

    return NextResponse.json({
        success: true,
        count: 1250, // Total verified examples
        dataset_url: "https://api.example.com/datasets/v1-export.json", // Mock download link
        status: "ready_for_training"
    })
}

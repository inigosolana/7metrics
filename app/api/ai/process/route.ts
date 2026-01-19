import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    // Simulate heavy processing time (3 seconds)
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Mock detections that a YOLO model might return
    // In a real app, this would come from a Python/GPU service
    const mockDetections = [
        {
            class: "goal",
            confidence: 0.98,
            time_start: 45,
            time_end: 50,
            label: "Gol (Local)"
        },
        {
            class: "turnover",
            confidence: 0.85,
            time_start: 120,
            time_end: 125,
            label: "Pérdida de balón"
        },
        {
            class: "save",
            confidence: 0.92,
            time_start: 200,
            time_end: 205,
            label: "Parada Portero"
        },
        {
            class: "goal",
            confidence: 0.99,
            time_start: 340,
            time_end: 345,
            label: "Gol (Visitante)"
        },
        {
            class: "foul",
            confidence: 0.78,
            time_start: 410,
            time_end: 415,
            label: "Falta en ataque"
        }
    ];

    return NextResponse.json({
        success: true,
        model: "YOLO v11 (Handball Fine-Tuned)",
        processed_frames: 15000,
        events: mockDetections
    });
}

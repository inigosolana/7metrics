import uuid
import random
from datetime import datetime, timedelta
from typing import Dict, Any
from ..schemas import ActionType

def generate_mock_timeline(video_id: str):
    events = []
    actions = list(ActionType)
    for i in range(10):
        timestamp = random.uniform(0, 600)  # Random timestamp in 10 mins
        events.append({
            "event_id": str(uuid.uuid4()),
            "type": random.choice(actions),
            "timestamp": timestamp,
            "frame_index": int(timestamp * 30),
            "confidence": random.uniform(0.7, 0.99),
            "actors": {
                "team_id": random.choice(["Team_A", "Team_B"]),
                "player_tracker_id": random.randint(1, 20),
                "jersey_number": random.randint(1, 99)
            },
            "clip_url": f"/api/v1/clipper/download/single/{uuid.uuid4()}"
        })
    return sorted(events, key=lambda x: x["timestamp"])

def generate_mock_report(job_id: str, video_id: str) -> Dict[str, Any]:
    return {
        "match_id": job_id,
        "metadata": {
            "duration": 600.0,
            "fps": 30,
            "resolution": "1920x1080"
        },
        "summary_stats": {
            "total_goals": random.randint(20, 40),
            "total_shots": random.randint(50, 80),
            "possession_split": {
                "Team_A": 55,
                "Team_B": 45
            }
        },
        "timeline": generate_mock_timeline(video_id)
    }

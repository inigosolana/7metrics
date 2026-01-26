"""
Mock data generator for development/testing without actual Colab processing.
"""
import random
from typing import Dict, Any, List
from datetime import datetime

from app.schemas import EventType, MatchReport, MatchMetadata, SummaryStats, TimelineEvent, ActorInfo


def generate_mock_match_report(job_id: str, video_id: str, mode: str = "stats") -> Dict[str, Any]:
    """
    Generate a realistic mock MatchReport for testing.
    
    Args:
        job_id: The job ID
        video_id: The video ID being processed
        mode: "stats" or "clipper"
    
    Returns:
        Dictionary representing a MatchReport
    """
    # Simulate realistic video metadata
    duration = random.uniform(1800, 3600)  # 30-60 minutes
    fps = random.choice([25, 30, 60])
    resolution = random.choice(["1920x1080", "1280x720", "3840x2160"])
    
    # Generate timeline events
    timeline_events = _generate_mock_timeline(duration, fps, mode)
    
    # Calculate summary stats from timeline
    summary_stats = _calculate_summary_stats(timeline_events)
    
    report = MatchReport(
        match_id=job_id,
        metadata=MatchMetadata(
            duration=duration,
            fps=fps,
            resolution=resolution
        ),
        summary_stats=summary_stats,
        timeline=timeline_events
    )
    
    return report.model_dump(mode="json")


def _generate_mock_timeline(duration: float, fps: int, mode: str) -> List[TimelineEvent]:
    """Generate realistic timeline events."""
    events = []
    
    # Number of events depends on mode and duration
    if mode == "clipper":
        # More events for clipper mode
        num_events = random.randint(15, 35)
    else:
        # Fewer events for stats mode
        num_events = random.randint(10, 25)
    
    # Event type distribution (weighted)
    event_weights = {
        EventType.TIRO: 0.40,
        EventType.GOL: 0.15,
        EventType.PARADA: 0.20,
        EventType.ROBO: 0.10,
        EventType.PERDIDA: 0.08,
        EventType.FALTA: 0.05,
        EventType.PENALTI: 0.02,
    }
    
    event_types = list(event_weights.keys())
    weights = list(event_weights.values())
    
    # Generate sorted timestamps
    timestamps = sorted([random.uniform(0, duration) for _ in range(num_events)])
    
    for i, timestamp in enumerate(timestamps):
        event_type = random.choices(event_types, weights=weights)[0]
        frame_index = int(timestamp * fps)
        
        # Assign to team
        team_id = random.choice(["Team_A", "Team_B"])
        player_id = random.randint(1, 14)
        jersey_number = random.randint(1, 99) if random.random() > 0.3 else None
        
        event_id = f"evt_{i+1:03d}_{event_type.value.lower()}"
        
        # For clipper mode, add clip URLs
        clip_url = None
        if mode == "clipper":
            # In real scenario, Colab might return external URLs or we serve locally
            clip_url = f"/api/v1/clipper/download/single/{event_id}"
        
        event = TimelineEvent(
            event_id=event_id,
            type=event_type,
            timestamp=round(timestamp, 2),
            frame_index=frame_index,
            confidence=round(random.uniform(0.75, 0.99), 2),
            actors=ActorInfo(
                team_id=team_id,
                player_tracker_id=player_id,
                jersey_number=jersey_number
            ),
            clip_url=clip_url
        )
        events.append(event)
    
    return events


def _calculate_summary_stats(timeline: List[TimelineEvent]) -> SummaryStats:
    """Calculate summary statistics from timeline events."""
    total_goals = sum(1 for e in timeline if e.type == EventType.GOL)
    total_shots = sum(1 for e in timeline if e.type in [EventType.TIRO, EventType.GOL])
    
    # Calculate possession split by counting events per team
    team_a_events = sum(1 for e in timeline if e.actors and e.actors.team_id == "Team_A")
    team_b_events = sum(1 for e in timeline if e.actors and e.actors.team_id == "Team_B")
    total_events = team_a_events + team_b_events
    
    if total_events > 0:
        possession_split = {
            "Team_A": int((team_a_events / total_events) * 100),
            "Team_B": int((team_b_events / total_events) * 100)
        }
    else:
        possession_split = {"Team_A": 50, "Team_B": 50}
    
    return SummaryStats(
        total_goals=total_goals,
        total_shots=total_shots,
        possession_split=possession_split
    )


def generate_mock_progress_updates() -> List[Dict[str, Any]]:
    """
    Generate a sequence of realistic progress updates for testing.
    
    Returns:
        List of progress update dictionaries
    """
    return [
        {"progress_percentage": 10, "current_step": "Loading video and initializing models..."},
        {"progress_percentage": 25, "current_step": "Detecting ball and players (YOLOv8)..."},
        {"progress_percentage": 45, "current_step": "Tracking players (ByteTrack)..."},
        {"progress_percentage": 65, "current_step": "Analyzing team colors (K-Means clustering)..."},
        {"progress_percentage": 80, "current_step": "Classifying events and building timeline..."},
        {"progress_percentage": 95, "current_step": "Generating clips and exporting..."},
        {"progress_percentage": 100, "current_step": "Processing complete!"},
    ]

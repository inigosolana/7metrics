"""
Pydantic schemas matching the OpenAPI specification.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# --- Enums ---
class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"


class EventType(str, Enum):
    GOL = "GOL"
    TIRO = "TIRO"
    ROBO = "ROBO"
    PARADA = "PARADA"
    PERDIDA = "PERDIDA"
    PENALTI = "PENALTI"
    FALTA = "FALTA"


class ExportFormat(str, Enum):
    MP4 = "mp4"
    MOV = "mov"


# --- Input Schemas ---
class PaddingConfig(BaseModel):
    pre: int = 5
    post: int = 3


class ClipConfig(BaseModel):
    include_actions: List[EventType] = [EventType.GOL, EventType.TIRO]
    padding_seconds: PaddingConfig = Field(default_factory=PaddingConfig)
    export_format: ExportFormat = ExportFormat.MP4


class ClipRequest(BaseModel):
    video_id: str
    config: Optional[ClipConfig] = Field(default_factory=ClipConfig)


class AnalysisConfig(BaseModel):
    detect_teams: bool = True
    advanced_metrics: bool = False


class AnalysisRequest(BaseModel):
    video_id: str
    config: Optional[AnalysisConfig] = Field(default_factory=AnalysisConfig)


# --- Output Schemas ---
class VideoUploadResponse(BaseModel):
    video_id: str
    path: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress_percentage: int = Field(ge=0, le=100)
    current_step: Optional[str] = None
    created_at: datetime
    error: Optional[str] = None


class ActorInfo(BaseModel):
    team_id: Optional[str] = "Team_A"
    player_tracker_id: Optional[int] = None
    jersey_number: Optional[int] = None


class TimelineEvent(BaseModel):
    event_id: str
    type: EventType
    timestamp: float
    frame_index: int
    confidence: float = 0.95
    actors: Optional[ActorInfo] = Field(default_factory=ActorInfo)
    clip_url: Optional[str] = None


class MatchMetadata(BaseModel):
    duration: float
    fps: int
    resolution: str


class SummaryStats(BaseModel):
    total_goals: int = 0
    total_shots: int = 0
    possession_split: Dict[str, int] = Field(default_factory=lambda: {"Team_A": 50, "Team_B": 50})


class MatchReport(BaseModel):
    match_id: str
    metadata: MatchMetadata
    summary_stats: SummaryStats
    timeline: List[TimelineEvent]


class ErrorResponse(BaseModel):
    code: int
    message: str


# --- Internal Schemas (for meta.json and callbacks) ---
class JobMetadata(BaseModel):
    job_id: str
    mode: str  # "clipper" or "stats"
    video_id: str
    status: JobStatus
    progress_percentage: int = 0
    current_step: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    error: Optional[str] = None
    config: Optional[Dict[str, Any]] = None


class ColabCallbackPayload(BaseModel):
    job_id: str
    status: JobStatus
    progress_percentage: int = Field(ge=0, le=100)
    current_step: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

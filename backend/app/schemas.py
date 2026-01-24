from pydantic import BaseModel, HttpUrl, Field
from typing import List, Optional, Any, Dict
from enum import Enum
from datetime import datetime

class JobStatus(str, Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

class ActionType(str, Enum):
    GOL = "GOL"
    TIRO = "TIRO"
    ROBO = "ROBO"
    PARADA = "PARADA"
    PERDIDA = "PERDIDA"
    PENALTI = "PENALTI"
    FALTA = "FALTA"

class VideoUploadResponse(BaseModel):
    video_id: str
    path: str

class PaddingConfig(BaseModel):
    pre: int = 5
    post: int = 3

class ClipConfig(BaseModel):
    include_actions: List[ActionType] = [ActionType.GOL, ActionType.TIRO]
    padding_seconds: PaddingConfig = PaddingConfig()
    export_format: str = "mp4"

class ClipRequest(BaseModel):
    video_id: str
    config: Optional[ClipConfig] = ClipConfig()

class AnalysisConfig(BaseModel):
    detect_teams: bool = True
    advanced_metrics: bool = False

class AnalysisRequest(BaseModel):
    video_id: str
    config: Optional[AnalysisConfig] = AnalysisConfig()

class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    progress_percentage: int = Field(0, ge=0, le=100)
    current_step: Optional[str] = None
    created_at: datetime
    error: Optional[str] = None

class ActorInfo(BaseModel):
    team_id: Optional[str] = None
    player_tracker_id: Optional[int] = None
    jersey_number: Optional[int] = None

class TimelineEvent(BaseModel):
    event_id: str
    type: ActionType
    timestamp: float
    frame_index: int
    confidence: float
    actors: Optional[ActorInfo] = None
    clip_url: Optional[str] = None

class MatchReport(BaseModel):
    match_id: str
    metadata: Dict[str, Any]
    summary_stats: Dict[str, Any]
    timeline: List[TimelineEvent]

class ErrorResponse(BaseModel):
    code: int
    message: str

# Callback schema
class ColabCallback(BaseModel):
    job_id: str
    status: JobStatus
    progress_percentage: int
    current_step: Optional[str] = None
    result: Optional[Any] = None

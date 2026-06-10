from __future__ import annotations
from typing import Annotated, Literal, Optional, List, Union
from enum import Enum
from pydantic import BaseModel, Field, HttpUrl


# ─── Enums ────────────────────────────────────────────────────────────────────

class HPosition(str, Enum):
    left   = "left"
    center = "center"
    right  = "right"
    tiled  = "tiled"


class VPosition(str, Enum):
    top    = "top"
    center = "center"
    bottom = "bottom"
    tiled  = "tiled"


class OutputFormat(str, Enum):
    jpg  = "jpg"
    png  = "png"
    webp = "webp"
    avif = "avif"
    tiff = "tiff"


class JobStatus(str, Enum):
    pending    = "pending"
    processing = "processing"
    completed  = "completed"
    failed     = "failed"
    cancelled  = "cancelled"


# ─── Watermark schemas ────────────────────────────────────────────────────────

class TextWatermark(BaseModel):
    type: Literal["text"] = "text"
    text: str = Field(..., min_length=1, max_length=500)
    font: str = "Arial"
    color: str = Field("#FFFFFF", pattern=r"^#[0-9A-Fa-f]{6}$")
    background_text: bool = False
    h_position: HPosition = HPosition.center
    v_position: VPosition = VPosition.bottom
    rotation: float = Field(0, ge=0, le=360)
    size_pct: float = Field(20, ge=1, le=100)
    opacity: float = Field(0.65, ge=0, le=1)


class ImageWatermark(BaseModel):
    type: Literal["image"] = "image"
    watermark_url: str  # URL of the watermark image asset
    h_position: HPosition = HPosition.center
    v_position: VPosition = VPosition.bottom
    rotation: float = Field(0, ge=0, le=360)
    size_pct: float = Field(20, ge=1, le=100)
    opacity: float = Field(0.65, ge=0, le=1)


# ─── Sub-configs ──────────────────────────────────────────────────────────────

class ObjectRemovalConfig(BaseModel):
    prompt: str = Field(..., min_length=3, max_length=500)


class ResizeConfig(BaseModel):
    width:  int = Field(..., gt=0, le=8192)
    height: int = Field(..., gt=0, le=8192)


class CompressConfig(BaseModel):
    quality: int = Field(80, ge=1, le=100)


class OutputConfig(BaseModel):
    format:  OutputFormat = OutputFormat.jpg
    quality: Optional[int] = Field(None, ge=1, le=100)  # only for lossy formats


# ─── Pipeline config (matches frontend JSON payload) ─────────────────────────

class PipelineConfig(BaseModel):
    remove_watermark: bool = False
    remove_background: bool = False
    background: Optional[str] = None          # hex color or "transparent"
    generative_fill: bool = False
    object_removal: Optional[ObjectRemovalConfig] = None
    upscale: bool = False
    upscale_factor: Literal[2, 4] = 4
    watermark: Optional[Union[TextWatermark, ImageWatermark]] = Field(None, discriminator="type")
    resize: Optional[ResizeConfig] = None
    compress: Optional[CompressConfig] = None
    output: OutputConfig = Field(default_factory=OutputConfig)

    @property
    def has_any_operation(self) -> bool:
        return any([
            self.remove_watermark,
            self.remove_background,
            self.object_removal,
            self.upscale,
            self.watermark,
            self.resize,
            self.compress,
        ])


# ─── Request / Response models ────────────────────────────────────────────────

class BatchProcessRequest(BaseModel):
    image_urls: List[str] = Field(..., min_length=1, max_length=10_000)
    pipeline: PipelineConfig
    webhook_url: Optional[str] = None  # POST to this URL when job completes

    class Config:
        json_schema_extra = {
            "example": {
                "image_urls": ["https://example.com/image1.jpg"],
                "pipeline": {
                    "remove_watermark": True,
                    "watermark": {
                        "type": "text",
                        "text": "Cleanify.ai",
                        "font": "Arial",
                        "color": "#FFFFFF",
                        "h_position": "center",
                        "v_position": "bottom",
                        "rotation": 0,
                        "size_pct": 20,
                        "opacity": 0.65,
                    },
                    "output": {"format": "jpg"},
                },
            }
        }


class BatchJobResponse(BaseModel):
    job_id: str
    status: JobStatus
    total_images: int
    credits_consumed: int
    message: str


class JobStatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    total: int
    processed: int
    failed: int
    progress_pct: float
    output_urls: List[str] = []
    error: Optional[str] = None
    created_at: Optional[str] = None
    completed_at: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

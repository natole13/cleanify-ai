import io
import json
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

import numpy as np
import cv2

from fastapi import APIRouter, BackgroundTasks, File, Form, HTTPException, UploadFile, status
from fastapi.responses import JSONResponse, Response

from app.api.v1.schemas import (
    BatchProcessRequest,
    BatchJobResponse,
    JobStatusResponse,
    HealthResponse,
    JobStatus,
)
from app.core.config import settings
from app.services.image_processor import process_batch_images

router = APIRouter()

# ─── In-memory job store ──────────────────────────────────────────────────────
# Production: replace with Redis or a PostgreSQL jobs table.
jobs: Dict[str, dict] = {}


def _credits_needed(total_images: int) -> int:
    return max(1, -(-total_images // settings.IMAGES_PER_CREDIT))  # ceiling division


# ─── Routes ───────────────────────────────────────────────────────────────────

@router.get("/health", response_model=HealthResponse, tags=["system"])
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok", service="cleanify-api", version=settings.API_VERSION)


@router.post(
    "/process-batch",
    response_model=BatchJobResponse,
    status_code=status.HTTP_202_ACCEPTED,
    tags=["processing"],
)
async def start_batch(
    request: BatchProcessRequest,
    background_tasks: BackgroundTasks,
) -> BatchJobResponse:
    """
    Submit a batch of images for processing.
    Returns immediately with a job_id; use GET /jobs/{job_id} to poll progress.
    """
    if not request.pipeline.has_any_operation:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pipeline has no operations enabled.",
        )

    credits_needed = _credits_needed(len(request.image_urls))
    job_id = str(uuid.uuid4())

    jobs[job_id] = {
        "status": JobStatus.pending,
        "total": len(request.image_urls),
        "processed": 0,
        "failed": 0,
        "output_urls": [],
        "error": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
        "webhook_url": request.webhook_url,
    }

    background_tasks.add_task(
        process_batch_images,
        job_id=job_id,
        jobs=jobs,
        image_urls=request.image_urls,
        pipeline=request.pipeline,
    )

    return BatchJobResponse(
        job_id=job_id,
        status=JobStatus.pending,
        total_images=len(request.image_urls),
        credits_consumed=credits_needed,
        message=f"Batch of {len(request.image_urls)} images queued. "
                f"Estimated credits: {credits_needed}.",
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse, tags=["processing"])
async def get_job_status(job_id: str) -> JobStatusResponse:
    """Poll the status and progress of a batch job."""
    if job_id not in jobs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    j = jobs[job_id]
    total     = j["total"]
    processed = j["processed"]

    return JobStatusResponse(
        job_id=job_id,
        status=j["status"],
        total=total,
        processed=processed,
        failed=j["failed"],
        progress_pct=round((processed / total) * 100, 1) if total else 0.0,
        output_urls=j["output_urls"],
        error=j.get("error"),
        created_at=j.get("created_at"),
        completed_at=j.get("completed_at"),
    )


@router.post("/remove-background", tags=["direct"])
async def remove_background(
    file: UploadFile = File(...),
) -> Response:
    """
    Remove the background from a single uploaded image.
    Returns a transparent PNG (RGBA).
    Accepts: image/jpeg, image/png, image/webp, image/gif.
    """
    from app.services import ai_models
    from PIL import Image as PILImage

    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File must be an image (JPEG, PNG, WEBP, GIF).",
        )

    raw = await file.read()
    try:
        img = PILImage.open(io.BytesIO(raw)).convert("RGBA")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode image.")

    result = await ai_models.remove_background(img)

    buf = io.BytesIO()
    result.save(buf, format="PNG")
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="removed_bg.png"'},
    )


@router.post("/replace-background", tags=["direct"])
async def replace_background(
    file: UploadFile = File(...),
    bg_color: Optional[str] = Form("#FFFFFF"),
) -> Response:
    """
    Remove background then composite over a solid color.
    `bg_color` accepts: 'transparent', 'white', 'black', or a hex string (#RRGGBB).
    Returns PNG (RGBA for transparent, RGB for solid).
    """
    from app.services import ai_models
    from PIL import Image as PILImage

    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(status_code=422, detail="File must be an image.")

    raw = await file.read()
    try:
        img = PILImage.open(io.BytesIO(raw)).convert("RGBA")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not decode image.")

    # Remove background (returns RGBA with transparent bg)
    no_bg: PILImage.Image = await ai_models.remove_background(img)

    # Determine background color
    color_str = (bg_color or "white").strip().lower()
    if color_str == "transparent":
        result = no_bg
    else:
        if color_str == "white":
            rgba = (255, 255, 255, 255)
        elif color_str == "black":
            rgba = (0, 0, 0, 255)
        else:
            # Parse hex (#RRGGBB or RRGGBB)
            hex_val = color_str.lstrip("#")
            if len(hex_val) == 6:
                r, g, b = int(hex_val[0:2], 16), int(hex_val[2:4], 16), int(hex_val[4:6], 16)
                rgba = (r, g, b, 255)
            else:
                rgba = (255, 255, 255, 255)

        canvas = PILImage.new("RGBA", no_bg.size, rgba)
        canvas.paste(no_bg, mask=no_bg.split()[3])
        result = canvas.convert("RGB")

    buf = io.BytesIO()
    fmt = "PNG" if color_str == "transparent" else "JPEG"
    result.save(buf, format=fmt, quality=95)
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="image/png" if fmt == "PNG" else "image/jpeg",
        headers={"Content-Disposition": f'attachment; filename="replaced_bg.{fmt.lower()}"'},
    )


@router.post("/process-image", tags=["direct"])
async def process_image(
    file: UploadFile = File(...),
    operations: str = Form(...),
) -> Response:
    """
    Process a single uploaded image synchronously.

    `operations` is a JSON string with optional boolean flags:
    {
      "remove_watermark": false,
      "remove_background": false,
      "upscale": false,
      "upscale_factor": 2,
      "crop": false,
      "crop_x": 0, "crop_y": 0, "crop_w": 100, "crop_h": 100,
      "resize": false,
      "resize_w": 1920, "resize_h": 1080,
      "compress": false,
      "compress_quality": 85,
      "output_format": "png",
      "mask_dataurl": null
    }

    Returns the processed image bytes with the correct Content-Type header.
    """
    from app.services import ai_models
    from app.services.image_processor import apply_deterministic_ops
    from PIL import Image as PILImage

    # ── Validate content type ────────────────────────────────────────────────
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File must be an image (JPEG, PNG, WEBP, GIF, etc.).",
        )

    # ── Parse operations ─────────────────────────────────────────────────────
    try:
        ops: dict = json.loads(operations)
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Invalid JSON in 'operations': {exc}",
        )

    # ── Read & decode image ──────────────────────────────────────────────────
    raw = await file.read()
    try:
        img = PILImage.open(io.BytesIO(raw)).convert("RGBA")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not decode image.")

    # ── Parse optional mask (data URL) ───────────────────────────────────────
    mask_img: Optional[PILImage.Image] = None
    mask_dataurl = ops.get("mask_dataurl")
    if mask_dataurl:
        try:
            import base64
            # data:image/png;base64,<data>
            header, encoded = mask_dataurl.split(",", 1)
            mask_bytes = base64.b64decode(encoded)
            mask_img = PILImage.open(io.BytesIO(mask_bytes))
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not decode mask_dataurl.",
            )

    # ── AI operations (order: remove_watermark → remove_background → upscale) ─
    if ops.get("remove_watermark"):
        img = await ai_models.remove_watermark(img, mask=mask_img)

    if ops.get("remove_background"):
        img = await ai_models.remove_background(img)

    if ops.get("upscale"):
        factor = int(ops.get("upscale_factor", 2))
        img = await ai_models.upscale_image(img, factor)

    # ── Deterministic ops (crop → resize → format conversion) ────────────────
    img, quality = apply_deterministic_ops(img, ops)

    # ── Export ───────────────────────────────────────────────────────────────
    out_fmt = (ops.get("output_format") or "png").lower()
    pil_fmt = "JPEG" if out_fmt in ("jpg", "jpeg") else out_fmt.upper()
    media_type = f"image/{'jpeg' if out_fmt in ('jpg', 'jpeg') else out_fmt}"

    # JPEG requires RGB
    if pil_fmt == "JPEG" and img.mode in ("RGBA", "LA", "P"):
        img = img.convert("RGB")

    buf = io.BytesIO()
    save_kwargs: dict = {}
    if quality is not None and pil_fmt in ("JPEG", "WEBP"):
        save_kwargs["quality"] = quality
        save_kwargs["optimize"] = True
    img.save(buf, format=pil_fmt, **save_kwargs)
    buf.seek(0)

    ext = "jpg" if out_fmt in ("jpg", "jpeg") else out_fmt
    return Response(
        content=buf.read(),
        media_type=media_type,
        headers={"Content-Disposition": f'attachment; filename="processed.{ext}"'},
    )


@router.post("/detect-watermark", tags=["direct"])
async def detect_watermark(
    file: UploadFile = File(...),
) -> JSONResponse:
    """
    Detect likely watermark regions in an uploaded image using OpenCV.

    Returns bounding boxes as percentages of image dimensions.
    """
    if not (file.content_type or "").startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="File must be an image.",
        )

    raw = await file.read()
    try:
        # Decode with OpenCV
        img_array = np.frombuffer(raw, dtype=np.uint8)
        img_bgr = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        if img_bgr is None:
            raise ValueError("cv2 could not decode image")
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not decode image.")

    img_h, img_w = img_bgr.shape[:2]

    # ── Convert to grayscale and threshold ───────────────────────────────────
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # Use adaptive threshold to catch both light and dark watermarks
    thresh = cv2.adaptiveThreshold(
        gray, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY_INV,
        blockSize=15,
        C=4,
    )

    # Dilate to merge nearby text glyphs into blobs
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (12, 3))
    dilated = cv2.dilate(thresh, kernel, iterations=2)

    # ── Find contours ────────────────────────────────────────────────────────
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    regions: List[dict] = []
    min_area = (img_w * img_h) * 0.0005   # ignore tiny noise
    max_area = (img_w * img_h) * 0.35     # ignore huge regions (whole image)

    for cnt in contours:
        x, y, w, h = cv2.boundingRect(cnt)
        area = w * h
        if area < min_area or area > max_area:
            continue

        aspect = w / max(h, 1)
        # Text-like regions: wide relative to height, not square blobs
        if aspect < 1.5:
            continue

        # Skip regions that cover too much of the image width (likely a border)
        if w / img_w > 0.80:
            continue

        # Compute a confidence heuristic based on aspect ratio and position
        # Watermarks often sit at corners or bottom/top bands
        rel_y = y / img_h
        is_corner_or_edge = rel_y < 0.15 or rel_y > 0.75
        confidence = round(min(0.95, 0.55 + (0.2 if is_corner_or_edge else 0.0) + min(0.2, aspect / 20)), 2)

        regions.append({
            "x_pct": round(x / img_w * 100, 2),
            "y_pct": round(y / img_h * 100, 2),
            "w_pct": round(w / img_w * 100, 2),
            "h_pct": round(h / img_h * 100, 2),
            "confidence": confidence,
            "type": "text",
        })

    # Sort by confidence descending, keep top 10
    regions.sort(key=lambda r: r["confidence"], reverse=True)
    regions = regions[:10]

    detected = len(regions) > 0
    return JSONResponse({
        "detected": detected,
        "regions": regions,
        "suggested_operation": "remove_watermark" if detected else None,
    })


@router.post("/inpaint", tags=["direct"])
async def inpaint(
    file: UploadFile = File(...),
    mask: UploadFile = File(...),
) -> Response:
    """
    Inpaint a region of an image using a mask.

    `file` — original image
    `mask` — mask image (white = inpaint, black = keep)

    Returns the inpainted image as PNG.
    """
    from app.services import ai_models
    from PIL import Image as PILImage

    for upload, label in ((file, "file"), (mask, "mask")):
        if not (upload.content_type or "").startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"'{label}' must be an image.",
            )

    raw_img  = await file.read()
    raw_mask = await mask.read()

    try:
        img  = PILImage.open(io.BytesIO(raw_img))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not decode image.")

    try:
        mask_img = PILImage.open(io.BytesIO(raw_mask))
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Could not decode mask.")

    result = await ai_models.inpaint_region(img, mask_img)

    buf = io.BytesIO()
    result.convert("RGBA").save(buf, format="PNG")
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="image/png",
        headers={"Content-Disposition": 'attachment; filename="inpainted.png"'},
    )


@router.delete("/jobs/{job_id}", tags=["processing"])
async def cancel_job(job_id: str):
    """Cancel a pending or processing job."""
    if job_id not in jobs:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")

    j = jobs[job_id]
    if j["status"] in (JobStatus.completed, JobStatus.failed, JobStatus.cancelled):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Job is already {j['status']}.",
        )

    j["status"] = JobStatus.cancelled
    j["error"]  = "Cancelled by user"
    return {"message": f"Job {job_id} cancelled."}

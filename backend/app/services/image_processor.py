"""
Core image processing service.

Pure Pillow/OpenCV implementations for:
  - Text & image watermark application
  - Crop / resize
  - Compression
  - Format conversion

AI operations (remove_watermark, remove_background, upscale, object_removal)
are delegated to ai_models.py wrappers.
"""
from __future__ import annotations

import asyncio
import io
import logging
import math
from datetime import datetime, timezone
from typing import Dict, List

from PIL import Image, ImageDraw, ImageFont

from app.api.v1.schemas import (
    CompressConfig,
    ImageWatermark,
    JobStatus,
    OutputFormat,
    PipelineConfig,
    ResizeConfig,
    TextWatermark,
)

logger = logging.getLogger(__name__)

LOSSY_FORMATS = {OutputFormat.jpg, OutputFormat.webp, OutputFormat.avif}


# ─── Deterministic ops (crop / resize / format / compress) ───────────────────

def apply_deterministic_ops(img: Image.Image, ops: dict) -> tuple[Image.Image, int | None]:
    """
    Apply non-AI operations that work without any ML model.

    Returns (processed_image, compress_quality_or_None).
    Compression itself is applied at export time via the quality parameter.
    """
    from PIL import ImageEnhance, ImageFilter

    # Photo Enhance (brightness / contrast / saturation / sharpness)
    if ops.get("enhance"):
        brightness = float(ops.get("brightness", 1.0))
        contrast   = float(ops.get("contrast",   1.0))
        saturation = float(ops.get("saturation", 1.0))
        sharpness  = float(ops.get("sharpness",  1.0))
        if brightness != 1.0:
            img = ImageEnhance.Brightness(img).enhance(brightness)
        if contrast != 1.0:
            img = ImageEnhance.Contrast(img).enhance(contrast)
        if saturation != 1.0:
            img = ImageEnhance.Color(img).enhance(saturation)
        if sharpness != 1.0:
            img = ImageEnhance.Sharpness(img).enhance(sharpness)

    # Unblur / Sharpen (UnsharpMask)
    if ops.get("unblur"):
        strength = float(ops.get("unblur_strength", 2.0))
        img = img.filter(ImageFilter.UnsharpMask(
            radius=2, percent=int(strength * 80), threshold=3
        ))

    # Crop
    if ops.get("crop"):
        x = ops.get("crop_x", 0)
        y = ops.get("crop_y", 0)
        w = ops.get("crop_w", img.width)
        h = ops.get("crop_h", img.height)
        x2 = min(x + w, img.width)
        y2 = min(y + h, img.height)
        img = img.crop((x, y, x2, y2))

    # Resize
    if ops.get("resize"):
        rw = ops.get("resize_w", img.width)
        rh = ops.get("resize_h", img.height)
        img = img.resize((rw, rh), Image.LANCZOS)

    # Output format conversion
    out_fmt = (ops.get("output_format") or "png").lower()
    if out_fmt in ("jpg", "jpeg"):
        if img.mode in ("RGBA", "LA", "P"):
            img = img.convert("RGB")

    # Compress quality (deferred to caller for actual encoding)
    quality: int | None = None
    if ops.get("compress"):
        quality = int(ops.get("compress_quality", 85))

    return img, quality


# ─── Orchestrator ─────────────────────────────────────────────────────────────

async def process_batch_images(
    job_id: str,
    jobs: Dict[str, dict],
    image_urls: List[str],
    pipeline: PipelineConfig,
) -> None:
    """
    Background task: processes each image URL through the pipeline.
    Updates the shared jobs dict so the API can report progress.
    """
    from app.services import ai_models  # local import avoids circular deps

    jobs[job_id]["status"] = JobStatus.processing
    output_urls: List[str] = []

    for idx, url in enumerate(image_urls):
        # Respect cancellation
        if jobs[job_id]["status"] == JobStatus.cancelled:
            break

        try:
            # 1. Download image
            img = await _download_image(url)

            # 2. AI operations (async, order matters)
            if pipeline.remove_watermark:
                img = await ai_models.remove_watermark(img)

            if pipeline.remove_background:
                img = await ai_models.remove_background(img)
                if pipeline.background and pipeline.background != "transparent":
                    img = _apply_background_color(img, pipeline.background)

            if pipeline.object_removal:
                img = await ai_models.remove_object(img, pipeline.object_removal.prompt)

            if pipeline.upscale:
                img = await ai_models.upscale_image(img, pipeline.upscale_factor)

            # 3. Deterministic post-processing
            if pipeline.resize:
                img = resize_image(img, pipeline.resize)

            if pipeline.watermark:
                if isinstance(pipeline.watermark, TextWatermark):
                    img = apply_text_watermark(img, pipeline.watermark)
                elif isinstance(pipeline.watermark, ImageWatermark):
                    wm_img = await _download_image(pipeline.watermark.watermark_url)
                    img = apply_image_watermark(img, wm_img, pipeline.watermark)

            # Compression is applied at export time via quality param (already
            # handled by export_image — nothing extra needed here).

            # 4. Export / upload
            output_bytes = export_image(img, pipeline.output.format, pipeline.compress)
            # Production: upload to S3 and return the URL
            output_url = f"https://cdn.cleanify.ai/output/{job_id}/{idx}.{pipeline.output.format}"
            output_urls.append(output_url)

            jobs[job_id]["processed"] += 1

        except Exception as exc:
            logger.exception("Failed to process image %s (job %s): %s", url, job_id, exc)
            jobs[job_id]["failed"] += 1

    jobs[job_id]["status"] = (
        JobStatus.completed
        if jobs[job_id]["status"] != JobStatus.cancelled
        else JobStatus.cancelled
    )
    jobs[job_id]["output_urls"] = output_urls
    jobs[job_id]["completed_at"] = datetime.now(timezone.utc).isoformat()


# ─── Download ─────────────────────────────────────────────────────────────────

async def _download_image(url: str) -> Image.Image:
    """Download an image from a URL. Uses httpx for async HTTP."""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url)
            resp.raise_for_status()
            return Image.open(io.BytesIO(resp.content)).copy()
    except ImportError:
        # httpx not installed — return a placeholder for local dev
        logger.warning("httpx not installed; returning placeholder image for %s", url)
        placeholder = Image.new("RGB", (800, 600), color=(200, 200, 200))
        return placeholder


# ─── Resize ───────────────────────────────────────────────────────────────────

def resize_image(img: Image.Image, cfg: ResizeConfig) -> Image.Image:
    return img.resize((cfg.width, cfg.height), Image.LANCZOS)


# ─── Background fill ──────────────────────────────────────────────────────────

def _apply_background_color(img: Image.Image, hex_color: str) -> Image.Image:
    bg = Image.new("RGBA", img.size, _hex_to_rgba(hex_color))
    if img.mode != "RGBA":
        img = img.convert("RGBA")
    bg.paste(img, mask=img.split()[3])
    return bg.convert("RGB")


# ─── Text watermark ───────────────────────────────────────────────────────────

def apply_text_watermark(img: Image.Image, wm: TextWatermark) -> Image.Image:
    base    = img.convert("RGBA")
    overlay = Image.new("RGBA", base.size, (0, 0, 0, 0))
    draw    = ImageDraw.Draw(overlay)

    font_size = max(12, int(base.width * wm.size_pct / 100))
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
    except (IOError, OSError):
        font = ImageFont.load_default()

    bbox   = draw.textbbox((0, 0), wm.text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    pad    = int(base.width * 0.04)

    x_positions = {
        "left":   pad,
        "center": (base.width  - tw) // 2,
        "right":  base.width  - tw - pad,
        "tiled":  0,
    }
    y_positions = {
        "top":    pad,
        "center": (base.height - th) // 2,
        "bottom": base.height - th - pad,
        "tiled":  0,
    }

    r, g, b   = _hex_to_rgb(wm.color)
    alpha_int = int(wm.opacity * 255)

    if wm.h_position.value == "tiled" or wm.v_position.value == "tiled":
        for ty in range(0, base.height, th + 60):
            for tx in range(0, base.width, tw + 80):
                draw.text((tx, ty), wm.text, font=font, fill=(r, g, b, alpha_int))
    else:
        x = x_positions.get(wm.h_position.value, pad)
        y = y_positions.get(wm.v_position.value, pad)
        if wm.background_text:
            draw.rectangle(
                [x - 6, y - 4, x + tw + 6, y + th + 4],
                fill=(0, 0, 0, int(alpha_int * 0.55)),
            )
        draw.text((x, y), wm.text, font=font, fill=(r, g, b, alpha_int))

    if wm.rotation != 0:
        overlay = overlay.rotate(-wm.rotation, expand=False, resample=Image.BICUBIC)

    return Image.alpha_composite(base, overlay).convert("RGB")


# ─── Image watermark ──────────────────────────────────────────────────────────

def apply_image_watermark(
    img: Image.Image, wm_img: Image.Image, wm: ImageWatermark
) -> Image.Image:
    target_w  = max(10, int(img.width * wm.size_pct / 100))
    aspect    = wm_img.height / (wm_img.width or 1)
    target_h  = int(target_w * aspect)
    wm_img    = wm_img.resize((target_w, target_h), Image.LANCZOS)

    if wm.rotation != 0:
        wm_img = wm_img.rotate(-wm.rotation, expand=True, resample=Image.BICUBIC)

    if wm_img.mode != "RGBA":
        wm_img = wm_img.convert("RGBA")

    # Apply opacity to alpha channel
    r, g, b, a = wm_img.split()
    a = a.point(lambda v: int(v * wm.opacity))
    wm_img.putalpha(a)

    pad = int(img.width * 0.04)
    x_map = {
        "left":   pad,
        "center": (img.width  - wm_img.width)  // 2,
        "right":  img.width  - wm_img.width  - pad,
        "tiled":  0,
    }
    y_map = {
        "top":    pad,
        "center": (img.height - wm_img.height) // 2,
        "bottom": img.height - wm_img.height - pad,
        "tiled":  0,
    }

    base = img.convert("RGBA")

    if wm.h_position.value == "tiled" or wm.v_position.value == "tiled":
        for ty in range(0, img.height, wm_img.height + 40):
            for tx in range(0, img.width, wm_img.width + 40):
                base.paste(wm_img, (tx, ty), wm_img)
    else:
        x = x_map.get(wm.h_position.value, pad)
        y = y_map.get(wm.v_position.value, pad)
        base.paste(wm_img, (x, y), wm_img)

    return base.convert("RGB")


# ─── Export ───────────────────────────────────────────────────────────────────

def export_image(
    img: Image.Image,
    fmt: OutputFormat,
    compress: CompressConfig | None,
) -> bytes:
    buf     = io.BytesIO()
    quality = compress.quality if compress else 90
    pil_fmt = fmt.value.upper().replace("JPG", "JPEG")

    if pil_fmt in ("JPEG",):
        img = img.convert("RGB")

    if fmt in LOSSY_FORMATS:
        img.save(buf, format=pil_fmt, quality=quality, optimize=True)
    else:
        img.save(buf, format=pil_fmt, optimize=True)

    return buf.getvalue()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def _hex_to_rgba(hex_color: str, alpha: int = 255) -> tuple[int, int, int, int]:
    r, g, b = _hex_to_rgb(hex_color)
    return r, g, b, alpha

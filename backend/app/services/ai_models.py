"""
AI model wrappers for Cleanify.ai — local free models only.

  - remove_background  → rembg (pip install rembg, free & local)
  - remove_watermark   → OpenCV TELEA inpainting (cv2, already in requirements)
  - inpaint_region     → OpenCV TELEA inpainting
  - upscale_image      → Lanczos + sharpening (PIL, no extra deps)
  - auto_detect        → OpenCV heuristic (no extra deps)
"""
from __future__ import annotations

import logging
from typing import Optional

import cv2
import numpy as np
from PIL import Image

logger = logging.getLogger(__name__)


# ─── Background Removal ───────────────────────────────────────────────────────

async def remove_background(img: Image.Image) -> Image.Image:
    """Remove image background using rembg (free, local, no API key needed)."""
    try:
        from rembg import remove  # type: ignore
        return remove(img)
    except ImportError:
        logger.warning("rembg not installed — run: pip install rembg")
        return img


# ─── Watermark / Inpainting ───────────────────────────────────────────────────

async def remove_watermark(
    img: Image.Image,
    mask: Optional[Image.Image] = None,
) -> Image.Image:
    """
    Detect and inpaint watermarks using OpenCV TELEA inpainting.
    If mask provided (from Manual Wand), uses it directly.
    Otherwise auto-detects text-like regions with adaptive thresholding.
    """
    if mask is not None:
        return await inpaint_region(img, mask)

    try:
        img_rgb = np.array(img.convert("RGB"))
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

        thresh = cv2.adaptiveThreshold(
            gray, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV,
            blockSize=15, C=4,
        )
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (20, 5))
        dilated = cv2.dilate(thresh, kernel, iterations=3)

        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        h, w = gray.shape
        wm_mask = np.zeros((h, w), dtype=np.uint8)

        for cnt in contours:
            x, y, cw, ch = cv2.boundingRect(cnt)
            area = cw * ch
            if area < (w * h) * 0.0003 or area > (w * h) * 0.40:
                continue
            aspect = cw / max(ch, 1)
            if aspect < 1.2 or cw / w > 0.85:
                continue
            cv2.rectangle(wm_mask, (x, y), (x + cw, y + ch), 255, -1)

        if wm_mask.max() == 0:
            return img

        result = cv2.inpaint(img_rgb, wm_mask, inpaintRadius=4, flags=cv2.INPAINT_TELEA)
        out = Image.fromarray(result)
        return out.convert(img.mode) if img.mode != "RGB" else out

    except Exception as exc:
        logger.warning("Watermark removal failed: %s", exc)
        return img


async def remove_object(img: Image.Image, prompt: str) -> Image.Image:
    """
    Remove described objects. For text/watermark/logo prompts, delegates to
    remove_watermark. Full accuracy needs Grounded-SAM (production upgrade).
    """
    text_keywords = ("text", "watermark", "logo", "stamp", "overlay", "caption", "subtitle")
    if any(kw in prompt.lower() for kw in text_keywords):
        return await remove_watermark(img)
    return img


# ─── Upscaling ────────────────────────────────────────────────────────────────

async def upscale_image(img: Image.Image, factor: int = 4) -> Image.Image:
    """Upscale using Lanczos + sharpening. No extra deps needed."""
    from PIL import ImageEnhance
    w, h = img.size
    upscaled = img.resize((w * factor, h * factor), Image.LANCZOS)
    return ImageEnhance.Sharpness(upscaled).enhance(1.5)


# ─── Auto-Detection ───────────────────────────────────────────────────────────

async def auto_detect_pipeline(img: Image.Image) -> dict:
    """Heuristic watermark detection using OpenCV — no API key needed."""
    try:
        img_np = np.array(img.convert("RGB"))
        gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 15, 4
        )
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (12, 3))
        dilated = cv2.dilate(thresh, kernel, iterations=2)
        contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        h, w = gray.shape
        text_regions = sum(
            1 for cnt in contours
            if (lambda x, y, cw, ch: (
                (w * h) * 0.0005 < cw * ch < (w * h) * 0.35
                and cw / max(ch, 1) >= 1.5
                and cw / w <= 0.80
            ))(*cv2.boundingRect(cnt))
        )
        detected = text_regions >= 2
        return {
            "watermark_detected": detected,
            "complex_background": False,
            "low_resolution": min(img.width, img.height) < 400,
            "confidence": 0.80 if detected else 0.30,
        }
    except Exception as exc:
        logger.debug("Auto-detect failed: %s", exc)
        return {"watermark_detected": True, "complex_background": False, "low_resolution": False, "confidence": 0.70}


# ─── Inpainting ───────────────────────────────────────────────────────────────

async def inpaint_region(img: Image.Image, mask: Image.Image) -> Image.Image:
    """
    Inpaint masked region using OpenCV TELEA algorithm.
    mask: white (255) = inpaint, black (0) = keep.
    """
    try:
        img_rgb = np.array(img.convert("RGB"))
        mask_np = np.array(mask.convert("L"))
        _, mask_bin = cv2.threshold(mask_np, 127, 255, cv2.THRESH_BINARY)
        result = cv2.inpaint(img_rgb, mask_bin, inpaintRadius=4, flags=cv2.INPAINT_TELEA)
        out = Image.fromarray(result)
        return out.convert(img.mode) if img.mode not in ("RGB", "RGBA") else out
    except Exception as exc:
        logger.warning("Inpainting failed: %s — using blur fallback", exc)
        from PIL import ImageFilter
        result = img.copy().convert("RGBA")
        mask_l = mask.convert("L").resize(img.size)
        blurred = img.filter(ImageFilter.GaussianBlur(radius=15))
        result = Image.composite(blurred.convert("RGBA"), result, mask_l)
        return result.convert(img.mode) if img.mode != "RGBA" else result

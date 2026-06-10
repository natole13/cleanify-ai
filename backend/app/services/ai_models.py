"""
AI model wrappers for Cleanify.ai.

Each function is an async stub that falls back gracefully when the
underlying library is not installed.  Production deployments should
install the corresponding packages and remove the stubs.

Production stack:
  - remove_background  → rembg          (pip install rembg)
  - remove_watermark   → lama-cleaner   (pip install lama-cleaner)  or IOPaint
  - remove_object      → Grounded-SAM + LaMa inpainting
  - upscale_image      → Real-ESRGAN    (pip install realesrgan)
  - auto_detect        → GPT-4o Vision  (pip install openai)
  - inpaint_region     → IOPaint / LaMa (pip install iopaint)
"""
from __future__ import annotations

import logging
from typing import Optional

from PIL import Image

logger = logging.getLogger(__name__)


# ─── Background Removal ───────────────────────────────────────────────────────

async def remove_background(img: Image.Image) -> Image.Image:
    """
    Remove image background, returning RGBA with transparent bg.
    Production: pip install rembg
    """
    try:
        from rembg import remove  # type: ignore
        return remove(img)
    except ImportError:
        logger.debug("rembg not installed — skipping background removal")
        return img


# ─── Watermark / Inpainting ───────────────────────────────────────────────────

async def remove_watermark(
    img: Image.Image,
    mask: Optional[Image.Image] = None,
) -> Image.Image:
    """
    Detect and inpaint watermarks.
    Production: IOPaint / lama-cleaner with auto-mask generation.
    If `mask` is provided (from Manual Wand), use it directly via inpaint_region.
    """
    if mask is not None:
        return await inpaint_region(img, mask)

    try:
        # Example with iopaint (async CLI or Python API)
        # from iopaint import run_model
        # return await run_model(img, mask=mask, model="lama")
        pass
    except Exception as exc:
        logger.warning("Watermark removal model failed: %s", exc)
    return img


async def remove_object(img: Image.Image, prompt: str) -> Image.Image:
    """
    Segment and inpaint a described object.
    Production: Grounded-SAM (GroundingDINO + SAM) → LaMa inpainting.
    """
    try:
        # segment with GroundingDINO, then inpaint with LaMa
        pass
    except Exception as exc:
        logger.warning("Object removal failed for prompt '%s': %s", prompt, exc)
    return img


# ─── Upscaling ────────────────────────────────────────────────────────────────

async def upscale_image(img: Image.Image, factor: int = 4) -> Image.Image:
    """
    AI upscale using Real-ESRGAN.
    Production: pip install realesrgan
    Stub: basic Lanczos resize.
    """
    try:
        from realesrgan import RealESRGANer  # type: ignore
        # upscaler = RealESRGANer(scale=factor, ...)
        # return upscaler.enhance(img)
        pass
    except ImportError:
        pass

    # Better Lanczos fallback with sharpening
    from PIL import ImageEnhance
    w, h = img.size
    upscaled = img.resize((w * factor, h * factor), Image.LANCZOS)
    enhancer = ImageEnhance.Sharpness(upscaled)
    return enhancer.enhance(1.4)


# ─── Auto-Detection (Vision AI) ───────────────────────────────────────────────

async def auto_detect_pipeline(img: Image.Image) -> dict:
    """
    Analyse an image and recommend pipeline operations.
    Production: GPT-4o Vision or a custom binary classifier.

    Returns a dict of recommended operations with confidence scores.
    """
    try:
        import base64, io, os
        from openai import AsyncOpenAI  # type: ignore

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        b64 = base64.b64encode(buf.getvalue()).decode()

        client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        resp = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}},
                    {"type": "text", "text": (
                        "Analyse this product image. Respond with JSON only:\n"
                        '{"watermark_detected": bool, "complex_background": bool, '
                        '"low_resolution": bool, "confidence": float}'
                    )},
                ],
            }],
            max_tokens=100,
        )
        import json
        return json.loads(resp.choices[0].message.content or "{}")
    except Exception as exc:
        logger.debug("Auto-detect failed: %s — returning heuristic defaults", exc)

    return {
        "watermark_detected": True,
        "complex_background": False,
        "low_resolution": False,
        "confidence": 0.70,
    }


# ─── Inpainting ───────────────────────────────────────────────────────────────

async def inpaint_region(img: Image.Image, mask: Image.Image) -> Image.Image:
    """
    Inpaint the masked region using LaMa / IOPaint.
    Falls back to a simple content-aware fill using PIL.

    Parameters
    ----------
    img  : source image (any mode)
    mask : mask image — white (255) = area to inpaint, black (0) = keep
    """
    try:
        from iopaint.model_manager import ModelManager  # type: ignore
        from iopaint.schema import InpaintRequest, HDStrategy  # type: ignore
        import numpy as np

        img_np  = np.array(img.convert("RGB"))
        mask_np = np.array(mask.convert("L"))

        manager = ModelManager(name="lama", device="cpu")
        result_np = manager(img_np, mask_np)
        return Image.fromarray(result_np)
    except (ImportError, Exception) as exc:
        if not isinstance(exc, ImportError):
            logger.warning("IOPaint inpainting failed: %s — using PIL fallback", exc)

    # Fallback: blur-based inpainting approximation (Pillow)
    from PIL import ImageFilter

    result = img.copy().convert("RGBA")
    mask_l = mask.convert("L").resize(img.size)

    # Fill masked areas with a heavily blurred version of the image
    blurred = img.filter(ImageFilter.GaussianBlur(radius=15))
    result = Image.composite(blurred.convert("RGBA"), result, mask_l)
    return result.convert(img.mode) if img.mode != "RGBA" else result

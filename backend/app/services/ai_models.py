"""
AI model wrappers for Cleanify.ai — local free models only.

  - remove_background  → rembg with birefnet-general (pixel-perfect, local)
  - remove_watermark   → OpenCV TELEA (auto-detect) or manual mask
  - inpaint_region     → IOPaint / LaMa (local), falls back to OpenCV TELEA
  - upscale_image      → Lanczos + sharpening (PIL)
  - auto_detect        → OpenCV heuristic
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
    """
    Pixel-perfect background removal using rembg with BiRefNet model.
    BiRefNet is state-of-the-art — dramatically better than u2net for fine edges,
    hair, fur, and complex boundaries.
    First run downloads ~175 MB model to ~/.cache/; cached locally after that.
    """
    try:
        from rembg import remove, new_session  # type: ignore
        session = new_session("birefnet-general")
        return remove(img, session=session)
    except ImportError:
        logger.warning("rembg not installed — run: pip install 'rembg[cpu]'")
        return img
    except Exception as exc:
        logger.warning("BiRefNet failed (%s), retrying with u2net…", exc)
        try:
            from rembg import remove  # type: ignore
            return remove(img)
        except Exception:
            return img


# ─── Watermark / Inpainting ───────────────────────────────────────────────────

async def remove_watermark(
    img: Image.Image,
    mask: Optional[Image.Image] = None,
) -> Image.Image:
    """
    Detect and erase watermarks.
    With mask: uses it directly with LaMa inpainting.
    Auto mode: detects text-like regions with adaptive thresholding → LaMa inpaint.
    """
    if mask is not None:
        return await inpaint_region(img, mask)

    try:
        img_rgb = np.array(img.convert("RGB"))
        gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, blockSize=15, C=4,
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
            if cw / max(ch, 1) < 1.2 or cw / w > 0.85:
                continue
            cv2.rectangle(wm_mask, (x, y), (x + cw, y + ch), 255, -1)

        if wm_mask.max() == 0:
            return img

        # Use PIL Image as mask for LaMa
        mask_img = Image.fromarray(wm_mask)
        return await inpaint_region(img, mask_img)

    except Exception as exc:
        logger.warning("Watermark removal failed: %s", exc)
        return img


async def remove_object(img: Image.Image, prompt: str) -> Image.Image:
    """
    Remove objects by text description. Delegates to watermark detector for
    text/logo prompts. Full accuracy requires Grounded-SAM (production upgrade).
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
    Inpaint masked region using IOPaint / LaMa (local, no API key).
    mask: white (255) = inpaint, black (0) = keep.
    Falls back to OpenCV TELEA if iopaint is not installed.
    First run downloads ~100 MB LaMa model to ~/.cache/; cached after that.
    """
    img_rgb = np.array(img.convert("RGB"))
    mask_np = np.array(mask.convert("L"))
    _, mask_bin = cv2.threshold(mask_np, 127, 255, cv2.THRESH_BINARY)

    try:
        from iopaint.model_manager import ModelManager   # type: ignore
        from iopaint.schema import InpaintRequest, HDStrategy  # type: ignore

        manager = ModelManager(name="lama", device="cpu")
        config  = InpaintRequest(hd_strategy=HDStrategy.ORIGINAL, hd_strategy_crop_margin=32, hd_strategy_crop_trigger_size=2048)
        result_np = manager(img_rgb, mask_bin, config)
        out = Image.fromarray(result_np.astype(np.uint8))
        return out.convert(img.mode) if img.mode not in ("RGB",) else out

    except ImportError:
        logger.info("iopaint not installed — using OpenCV TELEA (run: pip install iopaint)")
    except Exception as exc:
        logger.warning("LaMa inpainting failed: %s — falling back to OpenCV TELEA", exc)

    # OpenCV TELEA fallback — good quality for small masks
    try:
        result = cv2.inpaint(img_rgb, mask_bin, inpaintRadius=4, flags=cv2.INPAINT_TELEA)
        out = Image.fromarray(result)
        return out.convert(img.mode) if img.mode != "RGB" else out
    except Exception as exc:
        logger.warning("OpenCV inpaint also failed: %s", exc)
        return img

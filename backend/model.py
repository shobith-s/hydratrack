"""
model.py — CLIP-based drink verification inference.

Loads openai/clip-vit-base-patch32 once at process startup and exposes a
single `verify_frames()` function that accepts base64-encoded JPEG strings,
runs zero-shot classification, and returns a confidence score.
"""
from __future__ import annotations

import base64
from io import BytesIO
from typing import TYPE_CHECKING

from loguru import logger

if TYPE_CHECKING:
    import torch
    from PIL import Image
    from transformers import CLIPModel, CLIPProcessor

# ---------------------------------------------------------------------------
# Module-level singletons — loaded ONCE via FastAPI lifespan
# ---------------------------------------------------------------------------
_model: "CLIPModel | None" = None
_processor: "CLIPProcessor | None" = None

MODEL_NAME = "openai/clip-vit-base-patch32"
LABELS = ["a person drinking water", "a person not drinking"]
CONFIDENCE_THRESHOLD = 0.55  # must beat random chance (0.5) by a clear margin


def load_model() -> None:
    """Call this once at application startup (inside lifespan context)."""
    global _model, _processor
    from transformers import CLIPModel, CLIPProcessor  # lazy — not needed in CI
    logger.info("Loading CLIP model: {}", MODEL_NAME)
    _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    _model = CLIPModel.from_pretrained(MODEL_NAME)
    _model.eval()
    logger.info("CLIP model loaded successfully")


def _decode_frame(b64_string: str) -> "Image.Image":
    """Decode a base64 JPEG string (no data-URI prefix) into a PIL Image."""
    # Strip data-URI prefix if browser accidentally sends it
    if "," in b64_string:
        b64_string = b64_string.split(",", 1)[1]
    from PIL import Image  # lazy — not needed in CI
    raw = base64.b64decode(b64_string)
    return Image.open(BytesIO(raw)).convert("RGB")


def verify_frames(b64_frames: list[str]) -> dict:
    """
    Run CLIP zero-shot classification on a list of base64 JPEG frames.

    Returns:
        {
            "confirmed": bool,
            "confidence": float,   # 0.0–1.0, drinking probability
            "frames_evaluated": int
        }
    """
    if _model is None or _processor is None:
        raise RuntimeError("CLIP model not loaded. Call load_model() first.")

    images = [_decode_frame(f) for f in b64_frames]

    inputs = _processor(
        text=LABELS,
        images=images,
        return_tensors="pt",
        padding=True,
    )

    import torch  # lazy — not needed in CI
    with torch.no_grad():
        outputs = _model(**inputs)
        # logits_per_image shape: [num_images, num_labels]
        probs = outputs.logits_per_image.softmax(dim=-1)  # type: ignore[attr-defined]

    # Average the "drinking" probability across all frames
    drinking_probs = probs[:, 0]  # index 0 = "a person drinking water"
    mean_confidence = float(drinking_probs.mean().item())

    confirmed = mean_confidence >= CONFIDENCE_THRESHOLD

    logger.info(
        "CLIP inference | frames={} | confidence={:.3f} | confirmed={}",
        len(images),
        mean_confidence,
        confirmed,
    )

    return {
        "confirmed": confirmed,
        "confidence": round(mean_confidence, 4),
        "frames_evaluated": len(images),
    }

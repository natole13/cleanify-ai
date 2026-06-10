# Cleanify.ai — Backend API

FastAPI async backend for batch image processing.

## Quick start

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Docs: http://localhost:8000/docs

## Credit system

| Plan | Credits | Images |
|------|---------|--------|
| Free | 1 / day | 10 / day |
| Pro  | 100/month + 5/day bonus | 1,050+/month |
| Enterprise | Unlimited | Unlimited |

**1 credit = 10 images** (all operations in a single pass).

## Key endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/v1/process-batch` | Submit a batch job |
| `GET`  | `/api/v1/jobs/{job_id}` | Poll job progress |
| `DELETE` | `/api/v1/jobs/{job_id}` | Cancel a job |
| `GET`  | `/api/v1/health` | Health check |

## Environment variables (`.env`)

```env
SECRET_KEY=your-secret-key
CORS_ORIGINS=["http://localhost:5175"]
STRIPE_SECRET_KEY=sk_...
STORAGE_BUCKET=cleanify-outputs
STORAGE_ACCESS_KEY=...
STORAGE_SECRET_KEY=...
```

## AI model installation

Install optional dependencies for production AI operations:

```bash
pip install rembg          # Background removal
pip install realesrgan     # 4× upscaling  
pip install openai         # GPT-4 Vision auto-detect
# IOPaint / lama-cleaner for watermark inpainting
```

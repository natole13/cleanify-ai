import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware

from app.core.config import settings
from app.api.v1 import endpoints

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Cleanify.ai API starting — %s", settings.APP_NAME)
    import os, pathlib
    pathlib.Path(settings.TEMP_DIR).mkdir(parents=True, exist_ok=True)
    yield
    logger.info("Cleanify.ai API shutting down")


app = FastAPI(
    title="Cleanify.ai API",
    description=(
        "Async batch image processing API.\n\n"
        "**1 credit = 10 images** — all operations applied in a single pass.\n\n"
        "Submit a batch via `POST /api/v1/process-batch`, then poll "
        "`GET /api/v1/jobs/{job_id}` for progress."
    ),
    version=settings.API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── Middleware ───────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1024)

# ─── Routes ───────────────────────────────────────────────────────────────────

app.include_router(endpoints.router, prefix="/api/v1")


@app.get("/", include_in_schema=False)
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.API_VERSION,
        "docs": "/docs",
        "credit_rule": "1 credit = 10 images",
    }

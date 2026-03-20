from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import engine, Base
from app.routers import auth, skills, logs, insights, analytics, leaderboard, settings, chat
from sqlalchemy import text
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        # Backward-compatible schema patch for existing DBs without Alembic migrations.
        # This prevents auth/login failures when newer model columns are missing.
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS bio VARCHAR(500) DEFAULT ''"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS location VARCHAR(100) DEFAULT ''"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS github_url VARCHAR(255) DEFAULT ''"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT ''"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT TRUE"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"))
        await conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()"))
    logger.info("DevTrackr backend started")
    yield
    await engine.dispose()

app = FastAPI(
    title="DevTrackr API",
    description="Intelligent Skill Execution System",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://devtrackr.io",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/v1/auth",        tags=["auth"])
app.include_router(skills.router,      prefix="/api/v1/skills",      tags=["skills"])
app.include_router(logs.router,        prefix="/api/v1/logs",         tags=["logs"])
app.include_router(insights.router,    prefix="/api/v1/insights",     tags=["insights"])
app.include_router(analytics.router,   prefix="/api/v1/analytics",    tags=["analytics"])
app.include_router(leaderboard.router, prefix="/api/v1/leaderboard",  tags=["leaderboard"])
app.include_router(settings.router,    prefix="/api/v1/settings",     tags=["settings"])
app.include_router(chat.router,        prefix="/api/v1/chat",         tags=["chat"])

@app.get("/")
async def root():
    return {
        "app": "DevTrackr API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
    }

@app.get("/health")
async def health(): return {"status": "ok", "service": "devtrackr"}
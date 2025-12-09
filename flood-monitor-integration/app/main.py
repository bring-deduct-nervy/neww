from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.routes import stations, rivers, basins, levels, alerts

STATIC_DIR = Path(__file__).parent / "static"
ROOT_DIR = Path(__file__).parent.parent

app = FastAPI(
    title="Sri Lanka Flood Data API",
    description="REST API for Sri Lanka river water level and flood monitoring data. "
                "Data sourced from the Disaster Management Center (DMC) via nuuuwan/lk_dmc_vis.",
    version="1.0.0",
    contact={
        "name": "GitHub Repository",
        "url": "https://github.com/RensithUdara/SriLankan-Flood-Dashboard",
    },
    license_info={
        "name": "MIT",
    },
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stations.router, prefix="/api/stations", tags=["Stations"])
app.include_router(rivers.router, prefix="/api/rivers", tags=["Rivers"])
app.include_router(basins.router, prefix="/api/basins", tags=["Basins"])
app.include_router(levels.router, prefix="/api/levels", tags=["Water Levels"])
app.include_router(alerts.router, prefix="/api/alerts", tags=["Alerts"])


@app.get("/", include_in_schema=False)
async def root():
    return FileResponse(ROOT_DIR / "index.html")


@app.get("/dashboard", tags=["Dashboard"])
async def main_dashboard():
    """Main interactive flood monitoring dashboard with real-time data."""
    return FileResponse(ROOT_DIR / "index.html")


@app.get("/demo/stations", tags=["Dashboard"])
async def dashboard():
    """Interactive map showing all gauging stations with real-time alert status."""
    return FileResponse(STATIC_DIR / "dashboard.html")


@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "lk-flood-api",
        "data_source": "https://github.com/nuuuwan/lk_dmc_vis",
    }

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

from app.api import auth, charts, query
from app.core.config import settings

app = FastAPI(
    title="SolViz Studio API",
    description="API for SolViz Studio - Natural Language to Visualization for Solana",
    version="0.1.0",
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Include API routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(charts.router, prefix=f"{settings.API_V1_STR}/charts", tags=["charts"])
app.include_router(query.router, prefix=f"{settings.API_V1_STR}/query", tags=["query"])


@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

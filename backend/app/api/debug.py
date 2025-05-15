from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException
from pathlib import Path
import os

from app.utils.logger import logger

router = APIRouter()

@router.get("/logs/recent", response_model=List[str])
def get_recent_logs(
    lines: int = 100
) -> Any:
    """
    Get recent log entries.
    """
    try:
        logs_dir = Path(__file__).parent.parent / "logs"
        log_files = sorted([f for f in logs_dir.glob("*.log")], key=os.path.getmtime, reverse=True)
        
        if not log_files:
            return ["No logs found"]
            
        # Get most recent log file
        latest_log = log_files[0]
        
        # Read the last N lines
        with open(latest_log, 'r') as file:
            content = file.readlines()
            return content[-lines:]
    except Exception as e:
        logger.error(f"Error retrieving logs: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving logs: {str(e)}")


@router.get("/system/info", response_model=Dict)
def get_system_info() -> Any:
    """
    Get system information for debugging.
    """
    import sys
    import platform
    from app.core.config import settings
    
    try:
        # Collect important environment variables safely
        env_vars = {
            "OPENAI_API_KEY_SET": bool(os.environ.get("OPENAI_API_KEY")),
            "FLIPSIDE_API_KEY_SET": bool(getattr(settings, "FLIPSIDE_API_KEY", None)),
            "HELIUS_API_KEY_SET": bool(getattr(settings, "HELIUS_API_KEY", None)),
            "DATABASE_URL_SET": bool(getattr(settings, "DATABASE_URL", None)),  # Only return if it's set, not the value
        }
        
        return {
            "python_version": sys.version,
            "platform": platform.platform(),
            "environment": getattr(settings, "ENVIRONMENT", "unknown"),
            "env_vars": env_vars,
            "openai_model": getattr(settings, "OPENAI_MODEL", "unknown"),
        }
    except Exception as e:
        logger.error(f"Error retrieving system info: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error retrieving system info: {str(e)}")

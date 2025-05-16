import json
import requests
from typing import Dict, List, Any, Optional
import os
from time import sleep

from app.core.config import settings
from app.utils.logger import (
    log_flipside_request,
    log_flipside_response,
    log_exception,
    logger
)
from flipside import Flipside


def run_flipside_query(sql_query: str, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Run a SQL query on Flipside Crypto and return the results using the official Flipside SDK
    """
    logger.info("Running Flipside query using Flipside SDK")
    api_key = "48652595-7e94-450a-affd-b8c080d6b410" or settings.FLIPSIDE_API_KEY
    try:
        flipside = Flipside(api_key, "https://api-v2.flipsidecrypto.xyz")  # <-- Specify API URL!
        log_flipside_request(sql_query)
        result = flipside.query(sql_query)
        log_flipside_response(result)
        return result['records']
    except Exception as e:
        log_exception(e, "run_flipside_query")
        raise

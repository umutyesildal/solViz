import logging
import os
import json
import traceback
import sys
from datetime import datetime
from pathlib import Path

# Set up logging directory
logs_dir = Path(__file__).parent.parent / "logs"
logs_dir.mkdir(exist_ok=True)

# Configure the main logger
logger = logging.getLogger("solviz")
logger.setLevel(logging.DEBUG)
logger.propagate = False  # Prevent duplicate logs

# Clear existing handlers if the logger already exists
if logger.hasHandlers():
    logger.handlers.clear()

# Create log file handlers
log_file = logs_dir / f"solviz-{datetime.now().strftime('%Y-%m-%d')}.log"
file_handler = logging.FileHandler(log_file)
file_handler.setLevel(logging.DEBUG)

# Create console handler with a higher log level
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Create formatters
file_formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
console_formatter = logging.Formatter(
    '\033[1;36m%(asctime)s\033[0m - \033[1;33m%(levelname)s\033[0m - %(message)s'
)

file_handler.setFormatter(file_formatter)
console_handler.setFormatter(console_formatter)

# Add the handlers to the logger
logger.addHandler(file_handler)
logger.addHandler(console_handler)

# Test the logger
logger.info("Logger initialized")
logger.debug("Debug logging is active")

def log_api_request(endpoint: str, method: str, request_data=None):
    """Log API request details"""
    try:
        logger.info(f"API Request: {method} {endpoint}")
        if request_data:
            logger.debug(f"Request data: {json.dumps(request_data, default=str, indent=2)}")
    except Exception as e:
        logger.error(f"Error logging API request: {str(e)}")

def log_api_response(endpoint: str, status_code: int, response_data=None):
    """Log API response details"""
    try:
        logger.info(f"API Response: {status_code} from {endpoint}")
        if response_data:
            logger.debug(f"Response data: {json.dumps(response_data, default=str, indent=2)}")
    except Exception as e:
        logger.error(f"Error logging API response: {str(e)}")

def log_openai_request(prompt: str, model: str):
    """Log OpenAI API request details"""
    try:
        logger.info(f"OpenAI Request: Using model {model}")
        logger.debug(f"Prompt: {prompt[:300]}{'...' if len(prompt) > 300 else ''}")
    except Exception as e:
        logger.error(f"Error logging OpenAI request: {str(e)}")

def log_openai_response(response_text: str):
    """Log OpenAI API response"""
    try:
        logger.info(f"OpenAI Response received, length: {len(response_text)}")
        logger.debug(f"Response text: {response_text[:300]}{'...' if len(response_text) > 300 else ''}")
    except Exception as e:
        logger.error(f"Error logging OpenAI response: {str(e)}")

def log_exception(error: Exception, context: str = None):
    """Log detailed exception information"""
    try:
        error_details = {
            "error_type": type(error).__name__,
            "error_message": str(error),
            "context": context,
            "traceback": traceback.format_exc()
        }
        logger.error(f"Exception in {context or 'unknown context'}: {type(error).__name__} - {str(error)}")
        logger.debug(f"Error details: {json.dumps(error_details, default=str, indent=2)}")
    except Exception as e:
        logger.error(f"Error logging exception: {str(e)}")

def log_flipside_request(sql_query: str):
    """Log Flipside API request details"""
    try:
        logger.info(f"Flipside API Request")
        logger.debug(f"SQL Query: {sql_query}")
    except Exception as e:
        logger.error(f"Error logging Flipside request: {str(e)}")

def log_flipside_response(response_data):
    """Log Flipside API response"""
    try:
        logger.info(f"Flipside API Response received")
        if isinstance(response_data, list) and response_data:
            logger.debug(f"Received {len(response_data)} rows of data")
            if response_data:
                logger.debug(f"Sample row: {json.dumps(response_data[0], default=str, indent=2)}")
        else:
            logger.debug(f"Response data: {json.dumps(response_data, default=str, indent=2)}")
    except Exception as e:
        logger.error(f"Error logging Flipside response: {str(e)}")

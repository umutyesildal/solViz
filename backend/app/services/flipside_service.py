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

class FlipsideClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.FLIPSIDE_API_KEY
        self.base_url = "https://api.flipsidecrypto.com"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
        logger.info("FlipsideClient initialized")
    
    def create_query(self, sql: str, ttl_minutes: int = 60) -> Dict[str, Any]:
        """Create a new query on Flipside"""
        endpoint = f"{self.base_url}/v1/queries"
        payload = {
            "sql": sql,
            "ttl_minutes": ttl_minutes
        }
        
        log_flipside_request(sql)
        try:
            response = requests.post(endpoint, headers=self.headers, json=payload)
            response.raise_for_status()
            result = response.json()
            log_flipside_response({"query_token": result.get("token")})
            return result
        except Exception as e:
            log_exception(e, "FlipsideClient.create_query")
            raise
    
    def get_query_results(self, query_id: str) -> Dict[str, Any]:
        """Get the results of a query by its ID"""
        endpoint = f"{self.base_url}/v1/queries/{query_id}"
        logger.debug(f"Checking query results for ID: {query_id}")
        try:
            response = requests.get(endpoint, headers=self.headers)
            response.raise_for_status()
            result = response.json()
            logger.debug(f"Query status: {result.get('status')}")
            return result
        except Exception as e:
            log_exception(e, "FlipsideClient.get_query_results")
            raise
    
    def wait_for_query_results(self, query_id: str, max_wait_seconds: int = 300, check_interval: int = 2) -> Dict[str, Any]:
        """Poll for query results until they are ready or until timeout"""
        endpoint = f"{self.base_url}/v1/queries/{query_id}"
        logger.info(f"Waiting for query results: {query_id}")
        
        waited_seconds = 0
        while waited_seconds < max_wait_seconds:
            try:
                response = requests.get(endpoint, headers=self.headers)
                response.raise_for_status()
                data = response.json()
                
                if data["status"] == "success":
                    log_flipside_response({"status": "success", "rows_count": len(data.get("results", {}).get("rows", []))})
                    return data
                elif data["status"] == "error":
                    error_msg = f"Query failed: {data.get('error')}"
                    logger.error(error_msg)
                    raise Exception(error_msg)
                elif waited_seconds >= max_wait_seconds:
                    error_msg = f"Timeout waiting for query results after {max_wait_seconds} seconds"
                    logger.error(error_msg)
                    raise Exception(error_msg)
                
                logger.debug(f"Query {query_id} not ready yet, waited {waited_seconds}s, status: {data.get('status')}")
                sleep(check_interval)
                waited_seconds += check_interval
                
            except requests.exceptions.RequestException as e:
                log_exception(e, f"FlipsideClient.wait_for_query_results - Error checking status after {waited_seconds}s")
                sleep(check_interval)
                waited_seconds += check_interval
        
        error_msg = f"Timeout waiting for query results after {max_wait_seconds} seconds"
        logger.error(error_msg)
        raise Exception(error_msg)
    
    def execute_query(self, sql: str) -> List[Dict[str, Any]]:
        """Execute a SQL query and return the results"""
        logger.info("Executing Flipside query")
        try:
            # Create the query
            query_response = self.create_query(sql)
            query_id = query_response["token"]
            logger.info(f"Created query with ID: {query_id}")
            
            # Wait for the results
            results = self.wait_for_query_results(query_id)
            
            # Return the rows
            rows = results.get("results", {}).get("rows", [])
            logger.info(f"Query completed successfully, returned {len(rows)} rows")
            return rows
            
        except Exception as e:
            log_exception(e, "FlipsideClient.execute_query")
            raise


def run_flipside_query(sql_query: str, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Run a SQL query on Flipside Crypto and return the results
    """
    logger.info("Running Flipside query")
    try:
        client = FlipsideClient(api_key)
        return client.execute_query(sql_query)
    except Exception as e:
        log_exception(e, "run_flipside_query")
        raise

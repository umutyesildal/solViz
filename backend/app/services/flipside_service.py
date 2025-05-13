import json
import requests
from typing import Dict, List, Any, Optional
import os
from time import sleep

from app.core.config import settings

class FlipsideClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.FLIPSIDE_API_KEY
        self.base_url = "https://api.flipsidecrypto.com"
        self.headers = {
            "Content-Type": "application/json",
            "x-api-key": self.api_key
        }
    
    def create_query(self, sql: str, ttl_minutes: int = 60) -> Dict[str, Any]:
        """Create a new query on Flipside"""
        endpoint = f"{self.base_url}/v1/queries"
        payload = {
            "sql": sql,
            "ttl_minutes": ttl_minutes
        }
        
        response = requests.post(endpoint, headers=self.headers, json=payload)
        response.raise_for_status()
        return response.json()
    
    def get_query_results(self, query_id: str) -> Dict[str, Any]:
        """Get the results of a query by its ID"""
        endpoint = f"{self.base_url}/v1/queries/{query_id}"
        response = requests.get(endpoint, headers=self.headers)
        response.raise_for_status()
        return response.json()
    
    def wait_for_query_results(self, query_id: str, max_wait_seconds: int = 300, check_interval: int = 2) -> Dict[str, Any]:
        """Poll for query results until they are ready or until timeout"""
        endpoint = f"{self.base_url}/v1/queries/{query_id}"
        
        waited_seconds = 0
        while waited_seconds < max_wait_seconds:
            response = requests.get(endpoint, headers=self.headers)
            response.raise_for_status()
            data = response.json()
            
            if data["status"] == "success":
                return data
            elif data["status"] == "error":
                raise Exception(f"Query failed: {data.get('error')}")
            elif waited_seconds >= max_wait_seconds:
                raise Exception(f"Timeout waiting for query results after {max_wait_seconds} seconds")
            
            sleep(check_interval)
            waited_seconds += check_interval
        
        raise Exception(f"Timeout waiting for query results after {max_wait_seconds} seconds")
    
    def execute_query(self, sql: str) -> List[Dict[str, Any]]:
        """Execute a SQL query and return the results"""
        # Create the query
        query_response = self.create_query(sql)
        query_id = query_response["token"]
        
        # Wait for the results
        results = self.wait_for_query_results(query_id)
        
        # Return the rows
        return results.get("results", {}).get("rows", [])


def run_flipside_query(sql_query: str, api_key: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Run a SQL query on Flipside Crypto and return the results
    """
    client = FlipsideClient(api_key)
    return client.execute_query(sql_query)

import json
import requests
from typing import Dict, List, Any, Optional

from app.core.config import settings

class HeliusClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.HELIUS_API_KEY
        self.base_url = "https://api.helius.xyz/v0"
    
    def get_account_balances(self, address: str) -> Dict[str, Any]:
        """Get token balances for a Solana address"""
        endpoint = f"{self.base_url}/addresses/{address}/balances"
        params = {"api-key": self.api_key}
        
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_transaction_history(self, address: str, limit: int = 100, before: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get transaction history for a Solana address"""
        endpoint = f"{self.base_url}/addresses/{address}/transactions"
        params = {
            "api-key": self.api_key,
            "limit": limit
        }
        
        if before:
            params["before"] = before
        
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_assets_by_owner(self, owner: str, limit: int = 100, page: int = 1) -> Dict[str, Any]:
        """Get NFTs and tokens owned by an address"""
        endpoint = f"{self.base_url}/addresses/{owner}/assets"
        params = {
            "api-key": self.api_key,
            "limit": limit,
            "page": page
        }
        
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_assets_by_group(self, group_key: str, group_value: str, limit: int = 100, page: int = 1) -> Dict[str, Any]:
        """Get NFTs by collection or group"""
        endpoint = f"{self.base_url}/assets"
        params = {
            "api-key": self.api_key,
            "groupKey": group_key,
            "groupValue": group_value,
            "limit": limit,
            "page": page
        }
        
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()
    
    def get_nft_events(self, mint: str = None, collection: str = None, event_types: List[str] = None, 
                       limit: int = 100, until: str = None, wallet: str = None) -> Dict[str, Any]:
        """Get NFT sales and other events"""
        endpoint = f"{self.base_url}/nft-events"
        params = {"api-key": self.api_key, "limit": limit}
        
        if mint:
            params["mint"] = mint
        if collection:
            params["collection"] = collection
        if event_types:
            params["types"] = ",".join(event_types)
        if until:
            params["until"] = until
        if wallet:
            params["wallet"] = wallet
        
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        return response.json()
    
    def raw_request(self, endpoint: str, method: str = "GET", params: Optional[Dict[str, Any]] = None, 
                    data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Make a raw request to the Helius API"""
        url = f"{self.base_url}/{endpoint}"
        
        if params is None:
            params = {}
        params["api-key"] = self.api_key
        
        if method.upper() == "GET":
            response = requests.get(url, params=params)
        elif method.upper() == "POST":
            response = requests.post(url, params=params, json=data)
        else:
            raise ValueError(f"Unsupported HTTP method: {method}")
        
        response.raise_for_status()
        return response.json()


def run_helius_query(query_params: Dict[str, Any], api_key: Optional[str] = None) -> Dict[str, Any]:
    """
    Run a query on Helius and return the results
    """
    client = HeliusClient(api_key)
    
    # Extract the required params from the query
    endpoint = query_params.get("endpoint", "")
    method = query_params.get("method", "GET")
    params = query_params.get("params", {})
    data = query_params.get("data", None)
    
    # For simple endpoint-based requests
    if endpoint.startswith("addresses/") and "/balances" in endpoint:
        address = endpoint.split("/")[1]
        return client.get_account_balances(address)
    elif endpoint.startswith("addresses/") and "/transactions" in endpoint:
        address = endpoint.split("/")[1]
        limit = params.get("limit", 100)
        before = params.get("before", None)
        return client.get_transaction_history(address, limit, before)
    elif endpoint.startswith("addresses/") and "/assets" in endpoint:
        owner = endpoint.split("/")[1]
        limit = params.get("limit", 100)
        page = params.get("page", 1)
        return client.get_assets_by_owner(owner, limit, page)
    elif endpoint == "assets" and "groupKey" in params and "groupValue" in params:
        group_key = params.get("groupKey")
        group_value = params.get("groupValue")
        limit = params.get("limit", 100)
        page = params.get("page", 1)
        return client.get_assets_by_group(group_key, group_value, limit, page)
    elif endpoint == "nft-events":
        return client.get_nft_events(
            mint=params.get("mint"),
            collection=params.get("collection"),
            event_types=params.get("types", "").split(",") if params.get("types") else None,
            limit=params.get("limit", 100),
            until=params.get("until"),
            wallet=params.get("wallet")
        )
    else:
        # For custom or raw requests
        return client.raw_request(endpoint, method, params, data)

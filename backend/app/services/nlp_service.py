import json
import os
from typing import Dict, Any, List, Optional
import openai

from app.core.config import settings
from app.utils.logger import (
    log_openai_request,
    log_openai_response,
    log_exception,
    logger
)

# Initialize OpenAI client with API key directly
api_key = os.environ.get("OPENAI_API_KEY", "xx")
client = openai.Client(api_key="")

FLIPSIDE_SYSTEM_PROMPT = """
You are an expert SQL assistant specializing in Solana blockchain data using Flipside crypto's SQL interface.
Convert natural language questions about Solana blockchain data into valid SQL queries for Flipside Crypto.

Relevant tables and schemas for Solana data on Flipside:
- solana.core.fact_transactions: Contains transaction data (tx_id, signers, status, etc.)
- solana.core.fact_transfers: Contains SOL and SPL token transfers (tx_id, amount, from_address, to_address, etc.)
- solana.core.dim_labels: Contains known labels for addresses (address, label_type, label, etc.)
- solana.core.fact_events: Contains program events (tx_id, program_id, event_type, etc.)
- solana.core.dim_tokens: Contains token information (mint, symbol, decimals, etc.)

Always format numbers properly for readability. Ensure your SQL is executable on Flipside Crypto's interface.
"""

HELIUS_SYSTEM_PROMPT = """
You are an expert assistant for Helius API queries on Solana blockchain data.
Convert natural language questions about Solana blockchain data into valid Helius API requests.

Common Helius API endpoints:
- getAssetsByOwner: Retrieves NFTs and tokens owned by an address
- getAssetsByGroup: Retrieves NFTs and tokens by collection or group
- getTransactionHistory: Gets transaction history for an address
- getNFTEvents: Gets NFT sales and other events
- getBalances: Gets token balances for an address

Format your response as a JSON object ready for API submission to Helius.
"""

def natural_language_to_query(nl_query: str, provider: str = "flipside") -> Dict[str, Any]:
    """
    Convert a natural language query to a SQL or API query using OpenAI
    """
    logger.info(f"Converting natural language query for {provider}")
    
    if provider == "flipside":
        system_prompt = FLIPSIDE_SYSTEM_PROMPT
        user_prompt = f"Convert this question about Solana blockchain data to a SQL query for Flipside Crypto: {nl_query}"
    elif provider == "helius":
        system_prompt = HELIUS_SYSTEM_PROMPT
        user_prompt = f"Convert this question about Solana blockchain data to a Helius API request: {nl_query}"
    else:
        error_msg = f"Provider {provider} not supported"
        logger.error(error_msg)
        raise ValueError(error_msg)

    try:
        # Log the OpenAI request
        log_openai_request(f"{system_prompt}\n\n{user_prompt}", settings.OPENAI_MODEL)
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1
        )
        
        # Extract the query from the response
        query = response.choices[0].message.content
        
        # Log the OpenAI response
        log_openai_response(query)
        
        # For Flipside, return just the SQL query
        if provider == "flipside":
            # Strip out any markdown formatting if present
            if "```sql" in query:
                query = query.split("```sql")[1].split("```")[0].strip()
            elif "```" in query:
                query = query.split("```")[1].split("```")[0].strip()
            
            logger.info("Successfully converted natural language to SQL query")
            return {
                "query": query,
                "provider": "flipside",
                "nl_query": nl_query
            }
        
        # For Helius, parse the JSON response
        elif provider == "helius":
            # Extract JSON if contained in markdown code block
            if "```json" in query:
                query = query.split("```json")[1].split("```")[0].strip()
            elif "```" in query:
                query = query.split("```")[1].split("```")[0].strip()
            
            # Parse the JSON
            try:
                api_query = json.loads(query)
                logger.info("Successfully converted natural language to Helius API query")
                return {
                    "query": api_query,
                    "provider": "helius",
                    "nl_query": nl_query
                }
            except json.JSONDecodeError as e:
                log_exception(e, "Error parsing JSON response from OpenAI")
                logger.warning("Could not parse JSON, returning raw response")
                return {
                    "query": query,
                    "provider": "helius",
                    "nl_query": nl_query
                }
    
    except Exception as e:
        log_exception(e, "natural_language_to_query")
        raise Exception(f"Error generating query: {str(e)}")


def generate_vega_spec(data: List[Dict[str, Any]], nl_query: str) -> Dict[str, Any]:
    """
    Generate a Vega-Lite visualization specification based on data and the natural language query
    """
    logger.info("Generating Vega-Lite visualization specification")
    # Analyze the data structure
    if not data or len(data) == 0:
        logger.warning("No data available for visualization")
        return {
            "mark": "text",
            "encoding": {},
            "data": {"values": [{"text": "No data available"}]},
            "text": {"field": "text"}
        }

    try:
        # Sample a small subset of data for OpenAI to analyze
        sample_data = data[:5]
        
        sample_json = json.dumps(sample_data)
        
        # Create a prompt for OpenAI
        system_prompt = """
        You are a data visualization expert specializing in creating Vega-Lite specifications.
        Given a dataset sample and a natural language query, create a Vega-Lite specification that best visualizes the data.
        Return ONLY the JSON for the Vega-Lite specification without any explanations or markdown.
        """
        
        user_prompt = f"""
        Natural language query: {nl_query}
        
        Here's a sample of the data (first 5 rows):
        {sample_json}
        
        Create a Vega-Lite specification that:
        1. Effectively visualizes this data in relation to the query
        2. Uses appropriate mark types (bar, line, area, etc.)
        3. Has clear axis labels and titles
        4. Uses a clean color scheme
        5. Includes proper formatting for numbers and dates
        
        Return ONLY the Vega-Lite specification as valid JSON.
        """
        
        # Log the OpenAI request
        log_openai_request(f"Vega-Lite spec generation for query: {nl_query}", settings.OPENAI_MODEL)
        
        response = client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1
        )
        
        # Extract the Vega-Lite specification from the response
        vega_spec_text = response.choices[0].message.content
        
        # Log the OpenAI response
        log_openai_response(vega_spec_text)
        
        # Strip out any markdown formatting if present
        if "```json" in vega_spec_text:
            vega_spec_text = vega_spec_text.split("```json")[1].split("```")[0].strip()
        elif "```" in vega_spec_text:
            vega_spec_text = vega_spec_text.split("```")[1].split("```")[0].strip()
        
        # Parse the JSON
        vega_spec = json.loads(vega_spec_text)
        logger.info("Successfully generated Vega-Lite specification")
        
        # Add the data to the spec
        vega_spec["data"] = {"values": data}
        
        return vega_spec
    
    except Exception as e:
        log_exception(e, "generate_vega_spec")
        logger.warning("Error generating Vega-Lite spec, falling back to default visualization")
        
        # If there's any error, return a simple default visualization
        return {
            "data": {"values": data},
            "mark": "bar",
            "encoding": {
                "x": {"field": list(data[0].keys())[0], "type": "nominal"},
                "y": {"field": list(data[0].keys())[1], "type": "quantitative"}
            },
            "title": "Data Visualization"
        }

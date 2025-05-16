import json
import os
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple

import openai
from flipside import Flipside

from app.core.config import settings
from app.utils.logger import (
    log_openai_request,
    log_openai_response,
    log_exception,
    logger
)

# Initialize OpenAI client with API key directly
client = openai.Client(api_key="")

# --- System prompts for non-assistant API calls ---
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

# --- ASSISTANT CONFIG ---
ASSISTANT_ID = os.environ.get("OPENAI_ASSISTANT_ID") or "asst_sAoKoIP7ufWOeQAcxdjN25OP"
MAX_RETRIES = 3

# --- THREAD MANAGEMENT ---
thread_cache = {}  # Simple in-memory cache of user_id -> thread_id mappings

def agentic_nl_to_sql_and_data(nl_query: str, user_id: int = None, thread_id: str = None, db=None) -> Dict[str, Any]:
    """
    Main function for conversational, agentic Solana blockchain data exploration.
    This function integrates the OpenAI Assistant API with Flipside data queries.
    
    Args:
        nl_query: Natural language query from the user
        user_id: Optional user ID for thread persistence
        thread_id: Optional thread ID for continuing conversations
        db: Database session for storing conversation history
        
    Returns:
        Dict with:
        - data: SQL query results (if any) or empty list
        - sql: SQL query (if generated) or empty string
        - vega_spec: Visualization spec (if data available) or empty dict  
        - assistant_message: The assistant's response text
        - thread_id: Thread ID for conversation continuity
    """
    # Process the natural language query using the Assistant API
    result = process_nl_query(nl_query, user_id, thread_id, db)
    
    # Map the result to expected output format
    return {
        "data": result.get("data", []),
        "sql": result.get("query", ""),  # Renamed from query to sql for API consistency
        "vega_spec": result.get("vega_spec", {}),
        "assistant_message": result.get("assistant_message", ""),
        "thread_id": result.get("thread_id", "")
    }

def get_or_create_thread(client, user_id: int = None, thread_id: str = None, db=None) -> str:
    """Get an existing thread or create a new one"""
    if thread_id:
        # If thread_id is provided, return it
        return thread_id
    
    # Check if user has an existing thread in memory cache
    if user_id and user_id in thread_cache:
        return thread_cache[user_id]
    
    # Create new thread
    thread = client.beta.threads.create()
    thread_id = thread.id
    
    # Store thread in database if db session and user_id are provided
    if db and user_id:
        from app.models.models import ConversationThread
        
        # Check if thread already exists in db (unlikely but to be safe)
        db_thread = db.query(ConversationThread).filter(
            ConversationThread.thread_id == thread_id
        ).first()
        
        if not db_thread:
            # Create a new thread record in database
            db_thread = ConversationThread(
                user_id=user_id,
                thread_id=thread_id,
                title=f"New Conversation {thread_id[:8]}"
            )
            db.add(db_thread)
            db.commit()
    
    # Cache the thread id if user_id provided
    if user_id:
        thread_cache[user_id] = thread_id
        
    return thread_id

# --- MAIN ASSISTANT INTERACTION FUNCTION ---

def process_nl_query(nl_query: str, user_id: int = None, thread_id: str = None, db=None) -> Dict[str, Any]:
    """
    Process natural language query using OpenAI Assistant
    
    Returns a dict with:
    - data: The query results (if any)
    - query: The SQL query (if generated) or a placeholder
    - vega_spec: Visualization spec (if data available) or a placeholder
    - assistant_message: The assistant's response 
    - thread_id: The thread ID for continuing the conversation
    - requires_clarification: Whether the assistant is asking for clarification
    """
    logger.info(f"Processing natural language query with Assistant API: '{nl_query}'")
    
    # Get or create thread
    thread_id = get_or_create_thread(client, user_id, thread_id, db)
    
    # Send user message to Assistant
    message = client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=nl_query
    )
    
    # Store user message in database if db session is provided
    if db and user_id:
        from app.models.models import ConversationMessage, ConversationThread
        
        # Get the thread and update last_activity_at
        db_thread = db.query(ConversationThread).filter(
            ConversationThread.thread_id == thread_id
        ).first()
        
        if db_thread:
            # Update thread activity
            db_thread.last_activity_at = datetime.now()
            db.add(db_thread)
            
            # Store user message
            db_message = ConversationMessage(
                thread_id=thread_id,
                role="user",
                content=nl_query
            )
            db.add(db_message)
            db.commit()
    
    # Run Assistant
    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=ASSISTANT_ID
    )
    
    # Wait for completion
    run = _wait_for_run(client, thread_id, run.id)
    
    if run.status != "completed":
        logger.error(f"Assistant run failed with status: {run.status}")
        return {
            "data": [],
            "query": "Error: Assistant failed to process the request",
            "vega_spec": {"error": True},
            "assistant_message": f"Sorry, I encountered an error: {run.status}",
            "thread_id": thread_id,
            "requires_clarification": False
        }
    
    # Get the latest assistant message
    messages = client.beta.threads.messages.list(thread_id=thread_id, order="desc", limit=1)
    if not messages.data or messages.data[0].role != "assistant":
        logger.error("No assistant message found")
        return {
            "data": [],
            "query": "Error: No response from assistant",
            "vega_spec": {"error": True},
            "assistant_message": "Sorry, I couldn't generate a response",
            "thread_id": thread_id,
            "requires_clarification": False
        }
    
    # Extract text content, handling different content types properly
    assistant_message = ""
    for content_block in messages.data[0].content:
        if hasattr(content_block, 'text') and content_block.text and hasattr(content_block.text, 'value'):
            assistant_message += content_block.text.value
        elif content_block.type == 'text':
            assistant_message += content_block.text.value if hasattr(content_block, 'text') else ""
        elif content_block.type == 'image_file':
            # Skip image content or add placeholder text
            assistant_message += "\n[Image attachment not displayed]\n"
    
    if not assistant_message.strip():
        logger.error("No text content found in assistant response")
        return {
            "data": [],
            "query": "Error: No extractable text in response",
            "vega_spec": {"error": True},
            "assistant_message": "Sorry, I couldn't generate a proper text response",
            "thread_id": thread_id,
            "requires_clarification": False
        }
    
    # Store assistant message in database if db session is provided
    if db and thread_id:
        from app.models.models import ConversationMessage
        
        # Store assistant message
        db_message = ConversationMessage(
            thread_id=thread_id,
            role="assistant",
            content=assistant_message
        )
        db.add(db_message)
        db.commit()
    
    # Clean up the assistant message to remove SQL thinking and keep only the conversational part
    cleaned_message = _clean_assistant_message(assistant_message)
    
    # Check if we have SQL or a clarification request
    sql_query, has_sql = _extract_sql_from_message(assistant_message)
    
    if not has_sql:
        # This is a clarification request
        logger.info("Assistant is asking for clarification")
        return {
            "data": [],
            "query": "",  # Empty string, not None (to satisfy schema)
            "vega_spec": {},  # Empty dict, not None (to satisfy schema)
            "assistant_message": cleaned_message,
            "thread_id": thread_id,
            "requires_clarification": True
        }
    
    # We have SQL, try to execute it
    logger.info(f"Extracted SQL from Assistant: {sql_query[:100]}...")
    
    try:
        data = _run_sql_query_with_retries(sql_query, thread_id)
        # If we got data, generate visualization
        if data:
            vega_spec = generate_vega_spec(data, nl_query)
            return {
                "data": data,
                "query": sql_query,
                "vega_spec": vega_spec,
                "assistant_message": cleaned_message,
                "thread_id": thread_id,
                "requires_clarification": False
            }
    except Exception as e:
        logger.error(f"Error executing SQL query: {str(e)}")
        
    # If we get here, either initial SQL failed or no data 
    return {
        "data": [],
        "query": sql_query,
        "vega_spec": {},
        "assistant_message": "I created a SQL query but it failed to execute. Please check your question and try again.",
        "thread_id": thread_id,
        "requires_clarification": False
    }

# --- HELPER FUNCTIONS ---

def _wait_for_run(client, thread_id: str, run_id: str, timeout: int = 300) -> Any:
    """Wait for an Assistant run to complete, with timeout"""
    start_time = time.time()
    while time.time() - start_time < timeout:
        run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run_id
        )
        if run.status in ["completed", "failed", "cancelled"]:
            return run
        time.sleep(1)  # Poll every second
        
    # Timeout reached
    logger.warning(f"Run {run_id} timed out")
    return run

def _extract_sql_from_message(message: str) -> Tuple[str, bool]:
    """Extract SQL from an assistant message, return SQL and whether SQL was found"""
    # Try to find SQL in code blocks
    if "```sql" in message:
        sql = message.split("```sql")[1].split("```", 1)[0].strip()
        return sql, True
    elif "```" in message:
        sql = message.split("```", 1)[1].split("```", 1)[0].strip()
        # Check if this looks like SQL
        if sql.lower().startswith("select") or "from" in sql.lower():
            return sql, True
    
    # Try to find a SELECT statement
    idx = message.lower().find("select ")
    if idx != -1 and " from " in message.lower()[idx:]:
        sql = message[idx:]
        return sql, True
        
    # No SQL found
    return "", False

def _run_sql_query_with_retries(sql_query: str, thread_id: str) -> List[Dict[str, Any]]:
    """Execute SQL query with retries on failure, asking Assistant to fix if needed"""
    flipside = Flipside("48652595-7e94-450a-affd-b8c080d6b410", "https://api-v2.flipsidecrypto.xyz")
    error_msg = None
    
    for attempt in range(MAX_RETRIES):
        try:
            log_openai_request(f"Executing SQL: {sql_query[:100]}...", "flipside")
            log_flipside_request(sql_query)
            result = flipside.query(sql_query)
            
            # Handle different result formats
            if hasattr(result, 'records'):
                # Direct attribute access
                records = result.records
            elif hasattr(result, 'results'):
                # Some versions might use results instead
                records = result.results
            elif isinstance(result, dict) and 'records' in result:
                # Dictionary format
                records = result['records']
            else:
                # Assume the result itself is the records
                records = result
                
            log_flipside_response(f"Got {len(records)} records")
            return records
        except Exception as e:
            error_msg = str(e)
            log_exception(e, f"SQL execution error (attempt {attempt+1}/{MAX_RETRIES})")
            
            if attempt < MAX_RETRIES - 1:
                # Ask assistant to fix the query
                client.beta.threads.messages.create(
                    thread_id=thread_id,
                    role="user",
                    content=f"The SQL query failed with this error: {error_msg}. Please fix the query and try again."
                )
                
                # Run Assistant
                run = client.beta.threads.runs.create(
                    thread_id=thread_id,
                    assistant_id=ASSISTANT_ID
                )
                
                # Wait for completion
                run = _wait_for_run(client, thread_id, run.id)
                
                if run.status == "completed":
                    # Get the latest assistant message
                    messages = client.beta.threads.messages.list(thread_id=thread_id, order="desc", limit=1)
                    if messages.data and messages.data[0].role == "assistant":
                        assistant_message = messages.data[0].content[0].text.value
                        new_sql, has_sql = _extract_sql_from_message(assistant_message)
                        if has_sql:
                            sql_query = new_sql  # Update SQL for next attempt
                
    # If we get here, all retries failed
    logger.error(f"Failed to execute SQL query after {MAX_RETRIES} attempts: {error_msg}")
    raise Exception(f"SQL execution failed: {error_msg}")

# --- API LOGGING HELPERS ---
def log_flipside_request(sql_query: str) -> None:
    """Log a Flipside SQL query request"""
    logger.info(f"Executing Flipside query: {sql_query[:100]}...")

def log_flipside_response(response_summary: str) -> None:
    """Log a Flipside query response"""
    logger.info(f"Flipside response: {response_summary}")

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

def _clean_assistant_message(message: str) -> str:
    """
    Cleans up the assistant message to make it more user-friendly.
    Removes SQL code blocks, thinking processes, etc.
    """
    # Remove SQL code blocks
    if "```sql" in message:
        parts = message.split("```sql")
        before_sql = parts[0]
        after_sql = "".join(parts[1:]).split("```", 1)[1] if "```" in parts[1] else ""
        message = before_sql + after_sql
    
    # Remove any code blocks (not just SQL)
    while "```" in message:
        parts = message.split("```", 1)
        before_code = parts[0]
        remaining = parts[1]
        
        if "```" in remaining:
            after_code = remaining.split("```", 1)[1]
            message = before_code + after_code
        else:
            message = before_code
    
    # Remove thinking process markers
    thinking_patterns = [
        "Let me analyze this query",
        "Let me think about this",
        "Here's how I'll approach this",
        "I'll write a SQL query",
        "First, I need to",
        "Let's create a SQL query",
    ]
    
    for pattern in thinking_patterns:
        if pattern in message:
            # Try to keep only the final answer or explanation
            parts = message.split(pattern, 1)
            message = parts[0].strip()
            
    # If we've removed too much or the message is empty, return a default message
    if not message.strip():
        return "I've processed your query and created a visualization based on the Solana blockchain data you requested."
    
    return message.strip()

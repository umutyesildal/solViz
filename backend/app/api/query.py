from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, get_db
from app.models.models import User
from app.schemas.schemas import NaturalLanguageQuery, QueryResult
from app.services.nlp_service import agentic_nl_to_sql_and_data, natural_language_to_query, generate_vega_spec
from app.services.flipside_service import run_flipside_query
from app.services.helius_service import run_helius_query
from app.utils.logger import logger, log_api_request, log_api_response, log_exception

router = APIRouter()


@router.post("/", response_model=QueryResult)
def process_nl_query(
    *,
    db: Session = Depends(get_db),
    query_in: NaturalLanguageQuery,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Process a natural language query and return the results with a visualization spec
    """
    log_api_request("/api/v1/query", "POST", {
        "query": query_in.query,
        "provider": query_in.provider,
        "user_id": current_user.id
    })
    
    logger.info(f"Processing natural language query: '{query_in.query}' with provider '{query_in.provider}'")
    
    try:
        if query_in.provider == "flipside":
            agentic_result = agentic_nl_to_sql_and_data(
                query_in.query,
                user_id=current_user.id,
                thread_id=getattr(query_in, 'thread_id', None),
                db=db
            )
            # If no SQL/data but we have a response, this is likely a clarification
            if not agentic_result["data"]:
                return {
                    "data": [],
                    "query": "",  # Empty string instead of None to satisfy schema
                    "vega_spec": {},  # Empty dict instead of None to satisfy schema
                    "assistant_message": agentic_result["assistant_message"],
                    "thread_id": agentic_result["thread_id"],
                    "requires_clarification": True  # This is a clarification request
                }
            return {
                "data": agentic_result["data"],
                "query": agentic_result["sql"],  # Note: renamed from "sql" to "query" to match schema
                "vega_spec": agentic_result["vega_spec"],
                "assistant_message": agentic_result["assistant_message"],
                "thread_id": agentic_result["thread_id"],
                "requires_clarification": False  # Adding required field
            }
        elif query_in.provider == "helius":
            api_query = natural_language_to_query(query_in.query, provider="helius")["query"]
            logger.info(f"Executing Helius API query")
            results = run_helius_query(api_query)
            vega_spec = generate_vega_spec(results, query_in.query)
            return {
                "data": results,
                "query": api_query,
                "vega_spec": vega_spec,
                "assistant_message": "I've processed your Helius API query successfully.",
                "thread_id": None,
                "requires_clarification": False
            }
        else:
            error_msg = f"Provider {query_in.provider} not supported"
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
    except Exception as e:
        error_msg = str(e)
        log_exception(e, f"Error processing query '{query_in.query}'")
        log_api_response("/api/v1/query", 500, {"error": error_msg})
        raise HTTPException(status_code=500, detail=error_msg)

from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, get_db
from app.models.models import User
from app.schemas.schemas import NaturalLanguageQuery, QueryResult
from app.services.nlp_service import natural_language_to_query, generate_vega_spec
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
        # Convert natural language to a query
        query_data = natural_language_to_query(query_in.query, provider=query_in.provider)
        
        # Execute the query against the appropriate provider
        if query_in.provider == "flipside":
            sql_query = query_data["query"]
            logger.info(f"Executing SQL query: {sql_query[:100]}...")
            results = run_flipside_query(sql_query)
        elif query_in.provider == "helius":
            api_query = query_data["query"]
            logger.info(f"Executing Helius API query")
            results = run_helius_query(api_query)
        else:
            error_msg = f"Provider {query_in.provider} not supported"
            logger.error(error_msg)
            raise HTTPException(status_code=400, detail=error_msg)
        
        # Generate a Vega-Lite visualization specification
        vega_spec = generate_vega_spec(results, query_in.query)
        
        # Log successful response
        logger.info(f"Successfully processed query, returning {len(results)} rows of data")
        log_api_response("/api/v1/query", 200, {"data_length": len(results)})
        
        # Return the results and visualization spec
        return {
            "data": results,
            "query": query_data["query"],
            "vega_spec": vega_spec
        }
    except Exception as e:
        error_msg = str(e)
        log_exception(e, f"Error processing query '{query_in.query}'")
        log_api_response("/api/v1/query", 500, {"error": error_msg})
        raise HTTPException(status_code=500, detail=error_msg)

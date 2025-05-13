from typing import Any, Dict

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, get_db
from app.models.models import User
from app.schemas.schemas import NaturalLanguageQuery, QueryResult
from app.services.nlp_service import natural_language_to_query, generate_vega_spec
from app.services.flipside_service import run_flipside_query
from app.services.helius_service import run_helius_query

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
    try:
        # Convert natural language to a query
        query_data = natural_language_to_query(query_in.query, provider=query_in.provider)
        
        # Execute the query against the appropriate provider
        if query_in.provider == "flipside":
            sql_query = query_data["query"]
            results = run_flipside_query(sql_query)
        elif query_in.provider == "helius":
            api_query = query_data["query"]
            results = run_helius_query(api_query)
        else:
            raise HTTPException(status_code=400, detail=f"Provider {query_in.provider} not supported")
        
        # Generate a Vega-Lite visualization specification
        vega_spec = generate_vega_spec(results, query_in.query)
        
        # Return the results and visualization spec
        return {
            "data": results,
            "query": query_data["query"],
            "vega_spec": vega_spec
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

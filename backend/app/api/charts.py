from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, get_db
from app.models.models import Chart, User
from app.schemas.schemas import ChartCreate, ChartUpdate, Chart as ChartSchema

router = APIRouter()


@router.get("/", response_model=List[ChartSchema])
def read_charts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve charts.
    """
    return db.query(Chart).filter(Chart.user_id == current_user.id).offset(skip).limit(limit).all()


@router.post("/", response_model=ChartSchema)
def create_chart(
    *,
    db: Session = Depends(get_db),
    chart_in: ChartCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new chart.
    """
    chart = Chart(
        user_id=current_user.id,
        title=chart_in.title,
        description=chart_in.description,
        query=chart_in.query,
        natural_language_query=chart_in.natural_language_query,
        provider=chart_in.provider,
        data=chart_in.data,
        vega_spec=chart_in.vega_spec,
        is_public=chart_in.is_public,
    )
    db.add(chart)
    db.commit()
    db.refresh(chart)
    return chart


@router.get("/public", response_model=List[ChartSchema])
def read_public_charts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve public charts.
    """
    return db.query(Chart).filter(Chart.is_public == True).offset(skip).limit(limit).all()


@router.get("/{chart_id}", response_model=ChartSchema)
def read_chart(
    *,
    db: Session = Depends(get_db),
    chart_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get chart by ID.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    if not chart.is_public and chart.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return chart


@router.put("/{chart_id}", response_model=ChartSchema)
def update_chart(
    *,
    db: Session = Depends(get_db),
    chart_id: int,
    chart_in: ChartUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a chart.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    if chart.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    update_data = chart_in.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(chart, field, value)
    
    db.add(chart)
    db.commit()
    db.refresh(chart)
    return chart


@router.delete("/{chart_id}", response_model=ChartSchema)
def delete_chart(
    *,
    db: Session = Depends(get_db),
    chart_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a chart.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    if chart.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    db.delete(chart)
    db.commit()
    return chart

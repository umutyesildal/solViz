from typing import Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, get_db
from app.models.models import Chart, User, Tag, chart_tags
from app.schemas.schemas import ChartCreate, ChartUpdate, Chart as ChartSchema, TagCreate, Tag as TagSchema

router = APIRouter()


@router.get("/", response_model=List[ChartSchema])
def read_charts(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    tag: Optional[str] = None,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Retrieve charts. Filter by tag if provided.
    """
    query = db.query(Chart).filter(Chart.user_id == current_user.id)
    
    # Filter by tag if provided
    if tag:
        tag_obj = db.query(Tag).filter(Tag.name == tag).first()
        if tag_obj:
            query = query.join(chart_tags).filter(chart_tags.c.tag_id == tag_obj.id)
    
    return query.order_by(Chart.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=ChartSchema)
def create_chart(
    *,
    db: Session = Depends(get_db),
    chart_in: ChartCreate,
    tags: Optional[List[str]] = Body(None),
    thread_id: Optional[str] = Body(None),
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
        last_refreshed_at=datetime.now(),
        execution_time_ms=0,  # This would be set based on actual execution time
        view_count=0,
    )
    db.add(chart)
    db.flush()  # Get the ID without committing transaction
    
    # Add tags if provided
    if tags:
        for tag_name in tags:
            # Get or create tag
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.flush()  # Get the ID without committing transaction
            
            # Associate tag with chart
            db.execute(chart_tags.insert().values(chart_id=chart.id, tag_id=tag.id))
    
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
    tags: Optional[List[str]] = Body(None),
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
    
    # Update tags if provided
    if tags is not None:
        # Clear existing tags
        db.execute(chart_tags.delete().where(chart_tags.c.chart_id == chart_id))
        
        # Add new tags
        for tag_name in tags:
            # Get or create tag
            tag = db.query(Tag).filter(Tag.name == tag_name).first()
            if not tag:
                tag = Tag(name=tag_name)
                db.add(tag)
                db.flush()  # Get the ID without committing transaction
            
            # Associate tag with chart
            db.execute(chart_tags.insert().values(chart_id=chart_id, tag_id=tag.id))
    
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


@router.post("/{chart_id}/view")
def increment_chart_view(
    *,
    db: Session = Depends(get_db),
    chart_id: int,
    current_user: Optional[User] = Depends(get_current_user),
) -> Any:
    """
    Increment the view count for a chart.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    # Only allow viewing public charts or charts owned by the user
    if not chart.is_public and (not current_user or chart.user_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Increment view count
    chart.view_count = chart.view_count + 1
    db.add(chart)
    db.commit()
    
    return {"status": "success", "view_count": chart.view_count}


@router.get("/{chart_id}/tags", response_model=List[TagSchema])
def read_chart_tags(
    *,
    db: Session = Depends(get_db),
    chart_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get all tags for a chart.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    if not chart.is_public and chart.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    return chart.tags

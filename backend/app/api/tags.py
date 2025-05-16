from typing import Any, List, Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.deps import get_current_user, get_db
from app.models.models import Tag, Chart, Dashboard, chart_tags, dashboard_tags, User
from app.schemas.schemas import Tag as TagSchema, TagCreate, TagUpdate

router = APIRouter()


@router.get("/", response_model=List[TagSchema])
def read_tags(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve all tags.
    """
    return db.query(Tag).offset(skip).limit(limit).all()


@router.post("/", response_model=TagSchema)
def create_tag(
    *,
    db: Session = Depends(get_db),
    tag_in: TagCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create a new tag.
    """
    # Check if tag already exists
    existing_tag = db.query(Tag).filter(Tag.name == tag_in.name).first()
    if existing_tag:
        return existing_tag
    
    tag = Tag(name=tag_in.name)
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.put("/{tag_id}", response_model=TagSchema)
def update_tag(
    *,
    db: Session = Depends(get_db),
    tag_id: int,
    tag_in: TagUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update a tag.
    """
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    if tag_in.name is not None:
        tag.name = tag_in.name
    
    db.add(tag)
    db.commit()
    db.refresh(tag)
    return tag


@router.delete("/{tag_id}", response_model=TagSchema)
def delete_tag(
    *,
    db: Session = Depends(get_db),
    tag_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Delete a tag.
    """
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    db.delete(tag)
    db.commit()
    return tag


@router.post("/charts/{chart_id}/tags/{tag_id}")
def add_tag_to_chart(
    *,
    db: Session = Depends(get_db),
    chart_id: int,
    tag_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add a tag to a chart.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    if chart.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check if relation already exists
    exists = db.query(chart_tags).filter_by(chart_id=chart_id, tag_id=tag_id).first()
    if not exists:
        # Add tag to chart
        stmt = chart_tags.insert().values(chart_id=chart_id, tag_id=tag_id)
        db.execute(stmt)
        db.commit()
    
    return {"status": "success", "message": f"Tag '{tag.name}' added to chart"}


@router.delete("/charts/{chart_id}/tags/{tag_id}")
def remove_tag_from_chart(
    *,
    db: Session = Depends(get_db),
    chart_id: int,
    tag_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove a tag from a chart.
    """
    chart = db.query(Chart).filter(Chart.id == chart_id).first()
    if not chart:
        raise HTTPException(status_code=404, detail="Chart not found")
    
    if chart.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete the relation
    stmt = chart_tags.delete().where(
        chart_tags.c.chart_id == chart_id,
        chart_tags.c.tag_id == tag_id
    )
    db.execute(stmt)
    db.commit()
    
    return {"status": "success", "message": "Tag removed from chart"}


@router.post("/dashboards/{dashboard_id}/tags/{tag_id}")
def add_tag_to_dashboard(
    *,
    db: Session = Depends(get_db),
    dashboard_id: int,
    tag_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Add a tag to a dashboard.
    """
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    if dashboard.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check if relation already exists
    exists = db.query(dashboard_tags).filter_by(dashboard_id=dashboard_id, tag_id=tag_id).first()
    if not exists:
        # Add tag to dashboard
        stmt = dashboard_tags.insert().values(dashboard_id=dashboard_id, tag_id=tag_id)
        db.execute(stmt)
        db.commit()
    
    return {"status": "success", "message": f"Tag '{tag.name}' added to dashboard"}


@router.delete("/dashboards/{dashboard_id}/tags/{tag_id}")
def remove_tag_from_dashboard(
    *,
    db: Session = Depends(get_db),
    dashboard_id: int,
    tag_id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Remove a tag from a dashboard.
    """
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    
    if dashboard.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    # Delete the relation
    stmt = dashboard_tags.delete().where(
        dashboard_tags.c.dashboard_id == dashboard_id,
        dashboard_tags.c.tag_id == tag_id
    )
    db.execute(stmt)
    db.commit()
    
    return {"status": "success", "message": "Tag removed from dashboard"}

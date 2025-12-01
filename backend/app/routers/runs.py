from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from ..database import get_db
from ..models import User, Run, RunStep
from ..schemas import RunResponse, RunListResponse
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/runs", tags=["runs"])


@router.get("/", response_model=list[RunListResponse])
async def list_runs(
    project_id: UUID | None = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List runs"""
    query = select(Run)
    if project_id:
        query = query.where(Run.project_id == project_id)
    
    result = await db.execute(query.limit(100))
    runs = result.scalars().all()
    
    return [
        RunListResponse(
            id=run.id,
            project_id=run.project_id,
            external_id=run.external_id,
            agent_name=run.agent_name,
            status=run.status,
            started_at=run.started_at,
            ended_at=run.ended_at,
            step_count=0,
            duration_ms=None
        )
        for run in runs
    ]


@router.get("/{run_id}", response_model=RunResponse)
async def get_run(
    run_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get run details"""
    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return RunResponse.from_orm(run)

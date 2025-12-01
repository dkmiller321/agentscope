from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from ..database import get_db
from ..models import Project, Run, RunStep
from ..schemas import RunCreate, RunStepCreate, RunUpdate, RunResponse, Message
from ..dependencies import get_project_from_api_key

router = APIRouter(prefix="/api/ingest", tags=["ingest"])


@router.post("/run", response_model=RunResponse)
async def create_run(
    run_data: RunCreate,
    project: Project = Depends(get_project_from_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Create a new run (SDK endpoint)"""
    run = Run(
        project_id=project.id,
        external_id=run_data.external_id,
        agent_name=run_data.agent_name,
        input=run_data.input,
        meta_data=run_data.meta_data
    )
    db.add(run)
    await db.commit()
    await db.refresh(run)
    return RunResponse.from_orm(run)


@router.post("/run/{run_id}/step", response_model=Message)
async def add_run_step(
    run_id: UUID,
    step_data: RunStepCreate,
    project: Project = Depends(get_project_from_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Add a step to a run (SDK endpoint)"""
    from sqlalchemy import select, func
    
    # Get current max step_index
    result = await db.execute(
        select(func.coalesce(func.max(RunStep.step_index), -1))
        .where(RunStep.run_id == run_id)
    )
    max_index = result.scalar()
    
    step = RunStep(
        run_id=run_id,
        step_index=max_index + 1,
        step_type=step_data.step_type,
        name=step_data.name,
        input=step_data.input,
        output=step_data.output,
        meta_data=step_data.meta_data,
        error=step_data.error,
        tokens_used=step_data.tokens_used,
        latency_ms=step_data.latency_ms,
        started_at=step_data.started_at,
        ended_at=step_data.ended_at
    )
    db.add(step)
    await db.commit()
    return Message(message="Step added successfully")


@router.patch("/run/{run_id}", response_model=Message)
async def update_run(
    run_id: UUID,
    run_data: RunUpdate,
    project: Project = Depends(get_project_from_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Update run status/output (SDK endpoint)"""
    from sqlalchemy import select
    
    result = await db.execute(select(Run).where(Run.id == run_id))
    run = result.scalar_one_or_none()
    if not run:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Run not found")
    
    if run_data.status:
        run.status = run_data.status
    if run_data.output:
        run.output = run_data.output
    if run_data.error:
        run.error = run_data.error
    if run_data.ended_at:
        run.ended_at = run_data.ended_at
    
    await db.commit()
    return Message(message="Run updated successfully")

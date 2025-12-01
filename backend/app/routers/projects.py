from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from uuid import UUID
from ..database import get_db
from ..models import User, Project, Run
from ..schemas import ProjectCreate, ProjectUpdate, ProjectResponse, ProjectStats, Message
from ..dependencies import get_current_user

router = APIRouter(prefix="/api/projects", tags=["projects"])


@router.get("/", response_model=list[ProjectResponse])
async def list_projects(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """List all projects for current user"""
    result = await db.execute(
        select(Project).where(Project.user_id == current_user.id)
    )
    projects = result.scalars().all()
    return [ProjectResponse.from_orm(p) for p in projects]


@router.post("/", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new project"""
    project = Project(
        user_id=current_user.id,
        name=project_data.name,
        description=project_data.description
    )
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return ProjectResponse.from_orm(project)


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get project details"""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return ProjectResponse.from_orm(project)


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update project"""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project_data.name is not None:
        project.name = project_data.name
    if project_data.description is not None:
        project.description = project_data.description
    
    await db.commit()
    await db.refresh(project)
    return ProjectResponse.from_orm(project)


@router.delete("/{project_id}", response_model=Message)
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete project"""
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    await db.delete(project)
    await db.commit()
    return Message(message="Project deleted successfully")


@router.get("/{project_id}/stats", response_model=ProjectStats)
async def get_project_stats(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get project statistics"""
    # Verify project ownership
    result = await db.execute(
        select(Project).where(
            Project.id == project_id,
            Project.user_id == current_user.id
        )
    )
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Get total runs
    total_runs_result = await db.execute(
        select(func.count(Run.id)).where(Run.project_id == project_id)
    )
    total_runs = total_runs_result.scalar() or 0
    
    # Get failed runs
    failed_runs_result = await db.execute(
        select(func.count(Run.id)).where(
            Run.project_id == project_id,
            Run.status == "failed"
        )
    )
    failed_runs = failed_runs_result.scalar() or 0
    
    return ProjectStats(
        total_runs=total_runs,
        failed_runs=failed_runs,
        avg_latency_ms=None,
        test_pass_rate=None,
        recent_runs=total_runs
    )

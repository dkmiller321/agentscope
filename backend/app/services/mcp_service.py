from sqlalchemy import func
from sqlalchemy.ext.asyncio import AsyncSession


class McpService:
    """Service for MCP-related operations"""
    
    @staticmethod
    async def calculate_stats(db: AsyncSession, project_id: str) -> dict:
        """
        Calculate MCP statistics for a project
        Returns dict with total_calls, error_rate, avg_latency, most_used_tools
        """
        from ..models import McpLog, McpTool
        
        # Get total calls
        total_calls_result = await db.execute(
            func.count(McpLog.id).filter(McpLog.project_id == project_id)
        )
        total_calls = total_calls_result.scalar() or 0
        
        # Get error count
        error_count_result = await db.execute(
            func.count(McpLog.id).filter(
                McpLog.project_id == project_id,
                McpLog.log_type == "error"
            )
        )
        error_count = error_count_result.scalar() or 0
        
        # Calculate error rate
        error_rate = (error_count / total_calls * 100) if total_calls > 0 else 0.0
        
        # Get average latency
        avg_latency_result = await db.execute(
            func.avg(McpLog.latency_ms).filter(McpLog.project_id == project_id)
        )
        avg_latency = avg_latency_result.scalar()
        
        return {
            "total_calls": total_calls,
            "error_rate": round(error_rate, 2),
            "avg_latency_ms": round(avg_latency, 2) if avg_latency else None,
            "most_used_tools": []  # Can be enhanced with actual query
        }

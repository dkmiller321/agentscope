class RunService:
    """Service for run-related operations"""
    
    @staticmethod
    def calculate_duration_ms(started_at, ended_at) -> int | None:
        """Calculate duration in milliseconds between two timestamps"""
        if not ended_at or not started_at:
            return None
        delta = ended_at - started_at
        return int(delta.total_seconds() * 1000)
    
    @staticmethod
    def calculate_total_tokens(steps: list) -> int:
        """Calculate total tokens used across all steps"""
        return sum(step.tokens_used or 0 for step in steps)

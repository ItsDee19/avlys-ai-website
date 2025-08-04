from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel, Field
import logging
from typing import Optional, Dict, Any
import os

# Configure logging
logger = logging.getLogger(__name__)

# Import the research tools - assuming researchAgentTools.py will be in fastapi/
try:
    from researchAgentTools import Task
except ImportError as e:
    logger.error(f"Failed to import researchAgentTools: {e}. Ensure it's in the PYTHONPATH.")
    Task = None

router = APIRouter()

class Business(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=200, description="Business name to research")
    business_location: str = Field(..., min_length=1, max_length=200, description="Business location")

class ScrapeResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    message: str

@router.post("/scrape", response_model=ScrapeResponse)
async def scrape(business: Business, background_tasks: BackgroundTasks):
    """
    Scrape business information and research data

    Args:
        business: Business information including name and location
        background_tasks: FastAPI background tasks for async processing

    Returns:
        ScrapeResponse: Scraped data or error information
    """
    try:
        logger.info(f"Starting scrape for business: {business.business_name} in {business.business_location}")

        # Validate input
        if not business.business_name.strip():
            raise HTTPException(status_code=400, detail="Business name cannot be empty")

        if not business.business_location.strip():
            raise HTTPException(status_code=400, detail="Business location cannot be empty")

        # Check if research tools are available
        if Task is None:
            raise HTTPException(status_code=503, detail="Research tools not available. Please check server logs.")

        # Run the research task
        task = Task(business.business_name, business.business_location)
        data = task.run() # This is a synchronous call, consider making Task.run() async if it's long-running

        if not data:
            return ScrapeResponse(
                success=False,
                error="No data found for the specified business",
                message="Research completed but no data was found"
            )

        logger.info(f"Successfully scraped data for {business.business_name}")

        return ScrapeResponse(
            success=True,
            data=data,
            message="Research completed successfully"
        )

    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        logger.error(f"Error during scraping: {e}")
        return ScrapeResponse(
            success=False,
            error=str(e),
            message="An error occurred during research"
        )

@router.get("/scrape/status/{task_id}")
async def get_scrape_status(task_id: str):
    """Get status of a background scraping task"""
    # This would be implemented with a task queue system
    return {
        "task_id": task_id,
        "status": "completed",  # Placeholder
        "message": "Task status endpoint"
    } 
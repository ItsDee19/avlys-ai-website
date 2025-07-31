from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import logging
import asyncio
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import the research tools
try:
    from researchAgentTools import Task
except ImportError as e:
    logger.error(f"Failed to import researchAgentTools: {e}")
    Task = None

class Business(BaseModel):
    business_name: str = Field(..., min_length=1, max_length=200, description="Business name to research")
    business_location: str = Field(..., min_length=1, max_length=200, description="Business location")

class ScrapeResponse(BaseModel):
    success: bool
    data: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    message: str

app = FastAPI(
    title="Avyls AI Research Scraper",
    description="AI-powered business research and data scraping service",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5001", "https://avyls-ai.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Avyls AI Research Scraper",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "scrape": "/scrape"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        # Check if research tools are available
        if Task is None:
            return {
                "status": "degraded",
                "message": "Research tools not available",
                "timestamp": asyncio.get_event_loop().time()
            }
        
        return {
            "status": "healthy",
            "message": "API is running",
            "timestamp": asyncio.get_event_loop().time(),
            "services": {
                "research_tools": "available",
                "environment": os.getenv("NODE_ENV", "development")
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {
            "status": "unhealthy",
            "message": f"Health check failed: {str(e)}",
            "timestamp": asyncio.get_event_loop().time()
        }

@app.post("/scrape", response_model=ScrapeResponse)
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
            raise HTTPException(status_code=503, detail="Research tools not available")
        
        # Run the research task
        task = Task(business.business_name, business.business_location)
        data = task.run()
        
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

@app.get("/scrape/status/{task_id}")
async def get_scrape_status(task_id: str):
    """Get status of a background scraping task"""
    # This would be implemented with a task queue system
    return {
        "task_id": task_id,
        "status": "completed",  # Placeholder
        "message": "Task status endpoint"
    }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}")
    return {
        "success": False,
        "error": "Internal server error",
        "message": "An unexpected error occurred"
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("SCRAPER_PORT", 8000))
    host = os.getenv("SCRAPER_HOST", "0.0.0.0")
    
    logger.info(f"Starting scraper service on {host}:{port}")
    uvicorn.run(app, host=host, port=port, log_level="info")
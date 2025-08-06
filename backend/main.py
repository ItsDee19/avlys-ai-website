from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict, Any
from routers import deployment_app, scraper_api
from routers.deployment_agent.deployment_agents import DeploymentAgent
from routers import authorize
import asyncio # Import asyncio for health endpoint timestamp
import logging # Import logging for detailed health endpoint
import os # Import os for environment variables in health endpoint
from database.db import client

# Configure logging for main app as well
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import Task for health check - assume it's now in fastapi/
try:
    from researchAgentTools import Task
except ImportError as e:
    logger.error(f"Failed to import researchAgentTools in main app: {e}. Health check will be degraded.")
    Task = None

app = FastAPI(
    title="Avyls AI Service API",
    description="Central API for deployment, scraping, and authorization",
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

deployment_agent = DeploymentAgent()
deployment_app.deployment_agent = deployment_agent

app.include_router(deployment_app.router, prefix="/deploy", tags=['deployment agent'])
app.include_router(scraper_api.router, tags=['scraping agent'])
app.include_router(authorize.router, prefix="/authorize", tags=['authorization'])

@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": "Avyls AI Service API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "health": "/health",
            "deploy": "/deploy",
            "scrape": "/scrape",
            "authorize": "/authorize"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    try:
        # Check if research tools are available
        research_tools_status = "available"
        research_tools_message = ""
        if Task is None:
            research_tools_status = "degraded"
            research_tools_message = "Research tools not available. Check fastapi/researchAgentTools.py import."

        return {
            "status": "healthy",
            "message": "API is running",
            "timestamp": asyncio.get_event_loop().time(),
            "services": {
                "deployment_agent": "available", # Assuming it's always available if app starts
                "scraping_tools": research_tools_status,
                "environment": os.getenv("NODE_ENV", "development")
            },
            "notes": research_tools_message
        }
    except Exception as e:
        logger.exception("Health check failed")  # Logs the full stack trace
        return {
            "status": "unhealthy",
            "message": "Health check failed due to an internal error.",
            "timestamp": asyncio.get_event_loop().time()
        }
        

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
    
#!/usr/bin/env python3
"""
Startup script for the Avyls AI Research Scraper service
"""

import os
import sys
import logging
import uvicorn
from pathlib import Path

# Add the current directory to Python path
sys.path.append(str(Path(__file__).parent))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('scraper.log')
    ]
)

logger = logging.getLogger(__name__)

def check_dependencies():
    """Check if all required dependencies are available"""
    required_packages = [
        'fastapi',
        'uvicorn',
        'pydantic',
        'requests',
        'selenium',
        'beautifulsoup4'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        logger.error(f"Missing required packages: {', '.join(missing_packages)}")
        logger.error("Please install dependencies with: pip install -r requirements.txt")
        return False
    
    logger.info("All dependencies are available")
    return True

def check_environment():
    """Check environment variables and configuration"""
    required_env_vars = [
        'SERPAPI_KEY',  # For Google search functionality
        'GROQ_API_KEY'  # For AI insights
    ]
    
    missing_env_vars = []
    for var in required_env_vars:
        if not os.getenv(var):
            missing_env_vars.append(var)
    
    if missing_env_vars:
        logger.warning(f"Missing environment variables: {', '.join(missing_env_vars)}")
        logger.warning("Some features may not work properly")
        return False
    
    logger.info("Environment configuration is complete")
    return True

def main():
    """Main startup function"""
    logger.info("Starting Avyls AI Research Scraper...")
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check environment
    check_environment()
    
    # Get configuration
    port = int(os.getenv("SCRAPER_PORT", 8000))
    host = os.getenv("SCRAPER_HOST", "0.0.0.0")
    reload = os.getenv("SCRAPER_RELOAD", "false").lower() == "true"
    
    logger.info(f"Configuration: host={host}, port={port}, reload={reload}")
    
    try:
        # Start the server
        uvicorn.run(
            "main:app",
            host=host,
            port=port,
            reload=reload,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        logger.info("Shutting down scraper service...")
    except Exception as e:
        logger.error(f"Failed to start scraper service: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 
from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import List, Dict, Any
from routers.deployment_agent.deployment_agents import DeploymentAgent

class Campaign(BaseModel):
    user_id: str
    campaign_id: str
    deployment_id: str
    
class Scheduler(BaseModel):
    socials: List[Any] = Field(default_factory=list)
    content: Dict[str, Any] = Field(default_factory=dict)
    info: Dict[str, Any] = Field(default_factory=dict)

router = APIRouter()

deployment_agent: DeploymentAgent = None

@router.post("/initialize_campaign")
async def initialize_campaign(campaign:Campaign):
    
    result = deployment_agent.initialize_campaign(campaign.user_id, campaign.campaign_id, campaign.deployment_id)
    return {
        "message" : result
    }
    
@router.post("/schedule_campaigns")
async def schedule_campaigns(scheduler: Scheduler):
    
    message = deployment_agent.schedule_campaigns(scheduler.socials, scheduler.content, scheduler.info)
    return {
        "message": message
    }
from pydantic import BaseModel, Field
from typing import Optional
import uuid
from datetime import datetime

class AccessToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    platform: str  
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    
def generate_token_document(platform: str, access_token: str, page_id: str, ig_id: str, expires_in: int):
    return {
        "_id": str(uuid.uuid4()),
        # "user_id": user_id,
        "platform": platform,
        "access_token": access_token,
        "page_id": page_id,
        "instagram_id": ig_id,
        "expires_in": expires_in,
        "created_at": datetime.now()
    }
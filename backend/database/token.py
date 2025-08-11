from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class AccessToken(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    platform: str
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    created_at: datetime = Field(default_factory=datetime.now)

def generate_token_document(user_id: str, platform: str, access_token: str, refresh_token: Optional[str], expires_in: int, page_id: Optional[str] = None, ig_id: Optional[str] = None):
    return {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "platform": platform,
        "access_token": access_token,
        "refresh_token": refresh_token,
        "expires_in": expires_in,
        "page_id": page_id if page_id else None,
        "instagram_id": ig_id if ig_id else None,
        "created_at": datetime.now()
    }

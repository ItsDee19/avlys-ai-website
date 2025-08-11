from .db import access_tokens_collection
from .token import AccessToken

async def save_access_token(token_data: AccessToken):
    await access_tokens_collection.insert_one(token_data)

async def get_token_by_user_and_platform(user_id: str, platform: str):
    return await access_tokens_collection.find_one({"user_id": user_id, "platform": platform})

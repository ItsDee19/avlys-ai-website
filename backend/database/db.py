from motor.motor_asyncio import AsyncIOMotorClient
import os

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGODB_URI)
database = client["oauth_db"]

access_tokens_collection = database["access_tokens"]
user_credentials_collection = database["user_credentials"]
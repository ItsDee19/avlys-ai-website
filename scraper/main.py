from fastapi import FastAPI
from pydantic import BaseModel
from researchAgentTools import Task

class Business(BaseModel):
    business_name: str
    business_location: str

app = FastAPI()

@app.get("/health")
async def health():
    return {"message": "API is running"}

@app.post("/scrape")
async def scrape(business: Business):
    task = Task(business.business_name, business.business_location)
    data = task.run()
    return data
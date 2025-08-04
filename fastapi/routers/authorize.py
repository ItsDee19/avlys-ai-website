from fastapi import APIRouter, Request, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse
import httpx
import os
from urllib.parse import urlencode
from datetime import datetime, timedelta
from database.crud import save_access_token
from database.token import AccessToken, generate_token_document
from firebase_admin import auth as firebase_auth

router = APIRouter()

SCOPES = [
    "pages_manage_posts",
    "pages_read_engagement",
    "pages_show_list",
    "instagram_basic",
    "instagram_content_publish"
]


FB_APP_ID = os.getenv("FB_APP_ID")
FB_APP_SECRET = os.getenv("FB_APP_SECRET")
REDIRECT_URI = os.getenv("FB_REDIRECT_URI")

async def get_user_id_from_firebase(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    id_token = authorization.replace("Bearer ", "")
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")


@router.get("/connect_facebook")
async def connect_facebook():
    params = {
        "client_id": FB_APP_ID,
        "redirect_uri": REDIRECT_URI,
        "scope": ",".join(SCOPES),
        "response_type": "code",
    }
    
    fb_oauth_url = f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"
    return RedirectResponse(fb_oauth_url)

@router.get("/auth/facebook/callback")
async def facebook_callback(request: Request):
    # , user_id: str = Depends(get_user_id_from_firebase
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authentication code missing")
    
    async with httpx.AsyncClient() as client:
        token_res = await client.get("https://graph.facebook.com/v19.0/oauth/access_token", params={
            "client_id": FB_APP_ID,
            "redirect_uri": REDIRECT_URI,
            "client_secret": FB_APP_SECRET,
            "code": code
        })
        token_data = token_res.json()
        short_token = token_data.get("access_token")
        
        if not short_token:
            raise HTTPException(status_code=400, detail="Failed to retrieve short token")
        
        long_token_res = await client.get("https://graph.facebook.com/v19.0/oauth/access_token", params={
            "grant_type": "fb_exchange_token",
            "client_id": FB_APP_ID,
            "client_secret": FB_APP_SECRET,
            "fb_exchange_token": short_token
        })
        long_token_data = long_token_res.json()
        access_token = long_token_data.get("access_token")
        expires_in = long_token_data.get("expires_in")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="No facebook page found")
        
        pages_res = await client.get("https://graph.facebook.com/me/accounts", params={
            "access_token": access_token
        })
        
        pages = pages_res.json().get("data", [])
        
        if not pages:
            raise HTTPException(status_code=400, detail="No Facebook pages found")
        page_id = pages[0]["id"]
        
        ig_res = await client.get(f"https://graph.facebook.com/{page_id}", params={
            "fields": "instagram_business_account",
            "access_token": access_token
        })
        ig_data = ig_res.json()
        ig_id = ig_data.get("instagram_business_account", {}).get("id")

        if not ig_id:
            raise HTTPException(status_code=400, detail="No connected Instagram account found")
        
        token_doc = generate_token_document("facebook", access_token, page_id, ig_id, expires_in)
        await save_access_token.insert_one(token_doc)

        return {
            "message": "Access token saved successfully",
            # "user_id": user_id,
            "page_id": page_id,
            "instagram_id": ig_id,
            "expires_in": expires_in
        }
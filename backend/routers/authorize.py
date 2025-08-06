from fastapi import APIRouter, Request, HTTPException, Depends, Header
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
import os
import base64
from urllib.parse import urlencode
from datetime import datetime, timedelta
from database.crud import save_access_token
from database.token import AccessToken, generate_token_document
from firebase_admin import auth as firebase_auth
from uuid import uuid4
import hashlib
from database.db import database
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

state_collection = database["oauth_states"]

def get_or_generate_user_id(request: Request) -> str:
    user_id = request.cookies.get("user_id")
    if not user_id:
        user_id = str(uuid4())
    return user_id

# Facebook config
FB_APP_ID = os.getenv("FB_APP_ID")
FB_APP_SECRET = os.getenv("FB_APP_SECRET")
FB_REDIRECT_URI = os.getenv("FB_REDIRECT_URI") or "http://localhost:8000/authorize/auth/facebook/callback"

# Twitter config
TWITTER_CLIENT_ID = os.getenv("TWITTER_CLIENT_ID")
TWITTER_CLIENT_SECRET = os.getenv("TWITTER_CLIENT_SECRET")
TWITTER_REDIRECT_URI = os.getenv("TWITTER_REDIRECT_URI")

TWITTER_OAUTH_AUTHORIZE_URL = "https://twitter.com/i/oauth2/authorize"
TWITTER_OAUTH_TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
TWITTER_SCOPES = [
    "tweet.read",
    "tweet.write",
    "users.read",
    "like.read",
    "follows.read",
    "offline.access",
    "media.write"
]

def generate_pkce_pair():
    """Generate PKCE code verifier and challenge"""
    code_verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b"=").decode("utf-8")
    code_challenge = base64.urlsafe_b64encode(
        hashlib.sha256(code_verifier.encode()).digest()
    ).rstrip(b"=").decode("utf-8")
    return code_verifier, code_challenge

async def get_user_id_from_firebase(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    id_token = authorization.replace("Bearer ", "")
    try:
        decoded_token = firebase_auth.verify_id_token(id_token)
        return decoded_token["uid"]
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid Firebase token")

# Facebook endpoints
@router.get("/facebook/config")
async def get_facebook_config():
    return {
        "fb_app_id_set": bool(FB_APP_ID),
        "fb_app_secret_set": bool(FB_APP_SECRET),
        "redirect_uri_set": bool(FB_REDIRECT_URI),
        "fb_app_id": FB_APP_ID[:10] + "..." if FB_APP_ID and len(FB_APP_ID) > 10 else FB_APP_ID,
        "redirect_uri": FB_REDIRECT_URI
    }

@router.get("/connect_facebook")
async def connect_facebook():
    if not FB_APP_ID or not FB_APP_SECRET:
        raise HTTPException(status_code=500, detail="Facebook app credentials not properly configured")

    params = {
        "client_id": FB_APP_ID,
        "redirect_uri": FB_REDIRECT_URI,
        "response_type": "code",
    }

    fb_oauth_url = f"https://www.facebook.com/v19.0/dialog/oauth?{urlencode(params)}"
    return RedirectResponse(fb_oauth_url)

@router.get("/auth/facebook/callback")
async def facebook_callback(request: Request):
    code = request.query_params.get("code")
    if not code:
        raise HTTPException(status_code=400, detail="Authentication code missing")

    async with httpx.AsyncClient() as client:
        token_res = await client.get("https://graph.facebook.com/v19.0/oauth/access_token", params={
            "client_id": FB_APP_ID,
            "redirect_uri": FB_REDIRECT_URI,
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
            raise HTTPException(status_code=400, detail="No Facebook page found")

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

        user_id = get_or_generate_user_id(request)
        token_doc = generate_token_document(user_id, "facebook", access_token, None, expires_in, page_id, ig_id)
        await save_access_token(token_doc)

        return {
            "message": "Access token saved successfully",
            "page_id": page_id,
            "instagram_id": ig_id,
            "expires_in": expires_in,
            "has_instagram": bool(ig_id)
        }

# Twitter endpoints
@router.get("/twitter/config")
async def get_twitter_config():
    """Debug endpoint to check Twitter configuration"""
    return {
        "client_id_set": bool(TWITTER_CLIENT_ID),
        "client_secret_set": bool(TWITTER_CLIENT_SECRET),
        "redirect_uri_set": bool(TWITTER_REDIRECT_URI),
        "redirect_uri": TWITTER_REDIRECT_URI,
        "scopes": TWITTER_SCOPES
    }

@router.get("/connect-twitter")
async def connect_twitter():
    """Initiate Twitter OAuth flow"""
    # Validate configuration
    if not TWITTER_CLIENT_ID or not TWITTER_CLIENT_SECRET or not TWITTER_REDIRECT_URI:
        raise HTTPException(
            status_code=500, 
            detail="Twitter OAuth credentials not properly configured. Check TWITTER_CLIENT_ID, TWITTER_CLIENT_SECRET, and TWITTER_REDIRECT_URI environment variables."
        )
    
    logger.info(f"Starting Twitter OAuth with Client ID: {TWITTER_CLIENT_ID[:10]}...")
    logger.info(f"Redirect URI: {TWITTER_REDIRECT_URI}")
    
    # Generate PKCE parameters
    code_verifier, code_challenge = generate_pkce_pair()
    state = base64.urlsafe_b64encode(os.urandom(32)).decode("utf-8").rstrip("=")
    
    # Store state with expiration
    state_doc = {
        "state": state,
        "code_verifier": code_verifier,
        "created_at": datetime.now(),
        "expires_at": datetime.now() + timedelta(minutes=10)
    }
    
    await state_collection.insert_one(state_doc)
    logger.info(f"Stored state: {state}")
    
    # Build authorization URL
    params = {
        "response_type": "code",
        "client_id": TWITTER_CLIENT_ID,
        "redirect_uri": TWITTER_REDIRECT_URI,
        "scope": " ".join(TWITTER_SCOPES),
        "state": state,
        "code_challenge": code_challenge,
        "code_challenge_method": "S256"
    }
    
    auth_url = f"{TWITTER_OAUTH_AUTHORIZE_URL}?{urlencode(params)}"
    logger.info(f"Redirecting to: {auth_url}")
    
    return RedirectResponse(auth_url)

@router.get("/twitter/callback")
async def twitter_callback(request: Request):
    """Handle Twitter OAuth callback"""
    logger.info("=== Twitter OAuth Callback ===")
    
    # Log all query parameters for debugging
    all_params = dict(request.query_params)
    logger.info(f"All query params: {all_params}")
    
    # Extract parameters
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    state = state.rstrip("=")
    state_record = await state_collection.find_one({"state": state})
    if not state_record:
        raise HTTPException(status_code=400, detail="Invalid or expired state parameter")
    
    if datetime.now() > state_record.get("expires_at", datetime.now()):
        await state_collection.delete_one({"state": state})
        raise HTTPException(status_code=400, detail="State parameter expired")
    error = request.query_params.get("error")
    error_description = request.query_params.get("error_description")
    
    logger.info(f"Code: {code[:20] + '...' if code else 'None'}")
    logger.info(f"State: {state}")
    logger.info(f"Error: {error}")
    logger.info(f"Error description: {error_description}")
    
    # Handle OAuth errors
    if error:
        error_msg = f"OAuth error: {error}"
        if error_description:
            error_msg += f" - {error_description}"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
    
    # Validate required parameters
    if not code or not state:
        raise HTTPException(status_code=400, detail="Missing authorization code or state parameter")
    
    # Find and validate state
    try:
        state_record = await state_collection.find_one({"state": state})
        if not state_record:
            logger.error(f"State not found: {state}")
            raise HTTPException(status_code=400, detail="Invalid or expired state parameter")
        
        # Check expiration
        if datetime.now() > state_record.get("expires_at", datetime.now()):
            await state_collection.delete_one({"state": state})
            logger.error("State expired")
            raise HTTPException(status_code=400, detail="State parameter expired")
        
        logger.info(f"State validated successfully, created at: {state_record['created_at']}")
        
    except Exception as e:
        logger.error(f"State validation error: {str(e)}")
        raise HTTPException(status_code=500, detail="State validation failed")
    
    # Prepare token exchange
    token_url = TWITTER_OAUTH_TOKEN_URL
    
    # Create Basic Auth header
    credentials = f"{TWITTER_CLIENT_ID}:{TWITTER_CLIENT_SECRET}"
    encoded_credentials = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": f"Basic {encoded_credentials}",
        "User-Agent": "Avyls-OAuth-Client/1.0"
    }
    
    # Prepare request data
    token_data = {
        "grant_type": "authorization_code",
        "client_id": TWITTER_CLIENT_ID,
        "redirect_uri": TWITTER_REDIRECT_URI,
        "code": code,
        "code_verifier": state_record.get("code_verifier")
    }
    
    logger.info("Token exchange request:")
    logger.info(f"  URL: {token_url}")
    logger.info(f"  Client ID: {TWITTER_CLIENT_ID[:10]}...")
    logger.info(f"  Redirect URI: {TWITTER_REDIRECT_URI}")
    logger.info(f"  Code: {code[:20]}...")
    logger.info(f"  Code verifier: {state_record.get('code_verifier', '')[:20]}...")
    
    try:
        # Make token exchange request
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(token_url, data=token_data, headers=headers)
            
            logger.info(f"Token response status: {response.status_code}")
            logger.info(f"Token response headers: {dict(response.headers)}")
            
            # Log response body (be careful with sensitive data in production)
            response_text = response.text
            logger.info(f"Token response body: {response_text}")
            
    except httpx.TimeoutException:
        logger.error("Token request timed out")
        raise HTTPException(status_code=408, detail="Token request timed out")
    except Exception as e:
        logger.error(f"Token request failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Token request failed: {str(e)}")
    
    # Clean up state record
    try:
        await state_collection.delete_one({"state": state})
        logger.info("State cleaned up successfully")
    except Exception as e:
        logger.warning(f"Failed to clean up state: {str(e)}")
    
    # Handle response
    if response.status_code != 200:
        try:
            error_response = response.json()
            error_detail = error_response.get("error_description", error_response.get("error", "Unknown error"))
        except:
            error_detail = response_text
        
        logger.error(f"Token exchange failed: {error_detail}")
        
        return JSONResponse(
            status_code=400,
            content={
                "error": "Token exchange failed",
                "status_code": response.status_code,
                "details": error_detail,
                "raw_response": response_text
            }
        )
    
    # Parse successful response
    try:
        token_response = response.json()
        logger.info(f"Token exchange successful. Keys: {list(token_response.keys())}")
        
        # Extract tokens
        access_token = token_response.get("access_token")
        refresh_token = token_response.get("refresh_token")
        expires_in = token_response.get("expires_in")
        
        if not access_token:
            raise HTTPException(status_code=400, detail="No access token received")
        
        # Get user info
        user_info = None
        try:
            async with httpx.AsyncClient() as client:
                user_response = await client.get(
                    "https://api.twitter.com/2/users/me",
                    headers={"Authorization": f"Bearer {access_token}"}
                )
                if user_response.status_code == 200:
                    user_info = user_response.json()
                    logger.info(f"User info retrieved: {user_info.get('data', {}).get('username', 'Unknown')}")
        except Exception as e:
            logger.warning(f"Failed to get user info: {str(e)}")
        try:
            
            logger.info("Token saved to database (implement token saving logic)")
        except Exception as e:
            logger.error(f"Failed to save token: {str(e)}")
            # Don't fail the request if token saving fails
            
        user_id = get_or_generate_user_id(request)
        token_doc = generate_token_document(user_id, "twitter", access_token, None, expires_in)
        await save_access_token(token_doc)
        
        # Return success response
        return {
            "message": "Twitter authentication successful",
            "access_token": access_token[:20] + "..." if access_token else None,
            "refresh_token": refresh_token[:20] + "..." if refresh_token else None,
            "expires_in": expires_in,
            "user_info": user_info.get("data") if user_info else None,
            "token_type": token_response.get("token_type", "bearer")
        }
        
    except Exception as e:
        logger.error(f"Failed to process token response: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process authentication response")

# Cleanup endpoint for expired states
@router.delete("/oauth/cleanup")
async def cleanup_expired_states():
    """Clean up expired OAuth states"""
    try:
        result = await state_collection.delete_many({
            "expires_at": {"$lt": datetime.now()}
        })
        return {"message": f"Cleaned up {result.deleted_count} expired states"}
    except Exception as e:
        logger.error(f"Cleanup failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Cleanup failed")
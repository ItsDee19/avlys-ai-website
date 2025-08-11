from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger
from datetime import datetime, timedelta, timezone
import httpx
from bson import ObjectId
import asyncio
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
import os
import aiofiles
from urllib.parse import urlparse

TWITTER_AUTH_URL = "http://127.0.0.1:8000/authorize/connect-twitter" 
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

class SchedulePosts:
    
    def __init__(self, db) -> None:
        self.db = db
        self.access_tokens_collection = db["access_tokens"]
        self.scheduler = AsyncIOScheduler()
        self.scheduler.start()
        
    def schedule_instagram_post(self, timestamp, content, user_id):
        pass
    
    def schedule_facebook_post(self, timestamp, content, user_id):
        pass
    
    async def schedule_twitter_post(self, timestamp, content, user_id):
        logger.info(f"Attempting to schedule tweet for user: {user_id} at {timestamp}")

        token_data = await self.access_tokens_collection.find_one({"user_id": user_id})
        if not token_data:
            logger.warning(f"No access token found for user {user_id}. Redirecting to auth.")
            return RedirectResponse(url=f"{TWITTER_AUTH_URL}?user_id={user_id}")

        expires_at_str = token_data.get("expires_at")
        if expires_at_str:
            expires_at = datetime.fromisoformat(expires_at_str)
            if datetime.now(timezone.utc) >= expires_at:
                logger.warning(f"Access token expired for user {user_id}. Redirecting to auth.")
                return RedirectResponse(url=f"{TWITTER_AUTH_URL}?user_id={user_id}")

        run_time = datetime.fromisoformat(timestamp)
        
        # Now we can directly schedule the async method
        self.scheduler.add_job(
            self._async_post_tweet,
            trigger=DateTrigger(run_date=run_time),
            args=[content, user_id],
            id=f"tweet_{user_id}_{timestamp}",
            replace_existing=True
        )
        logger.info(f"✅ Scheduled tweet for user {user_id} at {run_time}")

    def _prepare_tweet_text(self, content):
        """Prepare tweet text with hashtags"""
        text_parts = []
        
        # Add main text if present
        if content.get('text'):
            text_parts.append(content['text'])
        
        # Add hashtags if present
        if content.get('hashtags'):
            hashtags = content['hashtags']
            if isinstance(hashtags, list):
                # Join hashtags with spaces, ensure they start with #
                formatted_hashtags = []
                for tag in hashtags:
                    if isinstance(tag, str):
                        tag = tag.strip()
                        if not tag.startswith('#'):
                            tag = f"#{tag}"
                        formatted_hashtags.append(tag)
                if formatted_hashtags:
                    text_parts.append(' '.join(formatted_hashtags))
            elif isinstance(hashtags, str):
                # Handle single hashtag string
                hashtags = hashtags.strip()
                if not hashtags.startswith('#'):
                    hashtags = f"#{hashtags}"
                text_parts.append(hashtags)
        
        return ' '.join(text_parts) if text_parts else ""

    async def _download_media(self, url, temp_dir="temp_media"):
        """Download media from URL (HTTP/HTTPS) or process base64 data URL and return local file path"""
        try:
            # Create temp directory if it doesn't exist
            os.makedirs(temp_dir, exist_ok=True)
            
            # Check if it's a base64 data URL
            if url.startswith('data:'):
                return await self._process_data_url(url, temp_dir)
            
            # Handle regular HTTP/HTTPS URLs
            # Get filename from URL
            parsed_url = urlparse(url)
            filename = os.path.basename(parsed_url.path)
            if not filename or '.' not in filename:
                # Generate filename based on URL hash if no proper filename
                import hashlib
                url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
                # Try to get file extension from Content-Type header
                async with httpx.AsyncClient() as client:
                    head_response = await client.head(url)
                    content_type = head_response.headers.get('content-type', '')
                    if 'image/jpeg' in content_type or 'image/jpg' in content_type:
                        filename = f"media_{url_hash}.jpg"
                    elif 'image/png' in content_type:
                        filename = f"media_{url_hash}.png"
                    elif 'image/gif' in content_type:
                        filename = f"media_{url_hash}.gif"
                    elif 'image/webp' in content_type:
                        filename = f"media_{url_hash}.webp"
                    else:
                        filename = f"media_{url_hash}.jpg"  # default
            
            local_path = os.path.join(temp_dir, filename)
            
            # Download the file with proper user agent
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            
            async with httpx.AsyncClient(headers=headers, timeout=30.0) as client:
                response = await client.get(url)
                response.raise_for_status()
                
                async with aiofiles.open(local_path, 'wb') as f:
                    await f.write(response.content)
            
            logger.info(f"Downloaded media from {url} to {local_path}")
            return local_path
            
        except Exception as e:
            logger.error(f"Failed to download media from {url}: {e}")
            return None

    async def _process_data_url(self, data_url, temp_dir):
        """Process base64 data URL and save as local file"""
        try:
            import base64
            import hashlib
            
            logger.info(f"Processing data URL (first 100 chars): {data_url[:100]}...")
            
            # Parse the data URL
            # Format: data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...
            if ';base64,' not in data_url:
                logger.error(f"Invalid data URL format: {data_url[:50]}...")
                return None
            
            # Extract mime type and base64 data
            header, base64_data = data_url.split(';base64,', 1)
            mime_type = header.replace('data:', '')
            
            logger.info(f"Extracted MIME type: {mime_type}")
            logger.info(f"Base64 data length: {len(base64_data)} characters")
            
            # Determine file extension based on mime type
            mime_to_ext = {
                'image/jpeg': '.jpg',
                'image/jpg': '.jpg',
                'image/png': '.png',
                'image/gif': '.gif',
                'image/webp': '.webp',
                'video/mp4': '.mp4',
                'video/webm': '.webm',
                'video/mov': '.mov',
                'video/avi': '.avi'
            }
            
            file_ext = mime_to_ext.get(mime_type, '.jpg')  # default to .jpg
            logger.info(f"Using file extension: {file_ext}")
            
            # Generate filename
            data_hash = hashlib.md5(base64_data.encode()).hexdigest()[:8]
            filename = f"data_media_{data_hash}{file_ext}"
            local_path = os.path.join(temp_dir, filename)
            
            logger.info(f"Generated filename: {filename}")
            
            # Validate and clean base64 data
            # Remove any whitespace or newlines
            base64_data = base64_data.strip().replace('\n', '').replace('\r', '').replace(' ', '')
            
            # Add padding if necessary
            missing_padding = len(base64_data) % 4
            if missing_padding:
                base64_data += '=' * (4 - missing_padding)
                logger.info(f"Added {4 - missing_padding} padding characters")
            
            # Decode and save the file
            try:
                file_data = base64.b64decode(base64_data)
                logger.info(f"Successfully decoded base64 data. File size: {len(file_data)} bytes")
            except Exception as decode_error:
                logger.error(f"Base64 decode error: {decode_error}")
                return None
            
            async with aiofiles.open(local_path, 'wb') as f:
                await f.write(file_data)
            
            logger.info(f"Successfully processed data URL and saved to {local_path}")
            return local_path
            
        except Exception as e:
            logger.error(f"Failed to process data URL: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return None

    async def _upload_media_to_twitter(self, file_path, access_token):
        """Upload media to Twitter using simple upload only (avoiding 403 issues)"""
        try:
            # Check if file exists and get its size
            if not os.path.exists(file_path):
                logger.error(f"File does not exist: {file_path}")
                return None
                
            file_size = os.path.getsize(file_path)
            logger.info(f"Uploading file: {file_path}, size: {file_size} bytes")
            
            # Check file size limits according to Twitter API docs
            file_ext = os.path.splitext(file_path)[1].lower()
            if file_ext in ['.jpg', '.jpeg', '.png', '.webp']:
                if file_size > 5 * 1024 * 1024:  # 5MB limit for images
                    logger.error(f"Image file too large: {file_size} bytes (max 5MB)")
                    return None
                media_type = "image/jpeg" if file_ext in ['.jpg', '.jpeg'] else f"image/{file_ext[1:]}"
                media_category = "tweet_image"
            elif file_ext == '.gif':
                if file_size > 15 * 1024 * 1024:  # 15MB limit for GIFs
                    logger.error(f"GIF file too large: {file_size} bytes (max 15MB)")
                    return None
                media_type = "image/gif"
                media_category = "tweet_gif"
            elif file_ext in ['.mp4', '.mov', '.avi', '.webm']:
                if file_size > 512 * 1024 * 1024:  # 512MB limit for videos
                    logger.error(f"Video file too large: {file_size} bytes (max 512MB)")
                    return None
                media_type = "video/mp4" if file_ext == '.mp4' else f"video/{file_ext[1:]}"
                media_category = "tweet_video"  # Changed from amplify_video
            else:
                logger.warning(f"Unknown file extension: {file_ext}, defaulting to image")
                media_type = "image/jpeg"  # Changed from application/octet-stream
                media_category = "tweet_image"
            
            logger.info(f"Media type: {media_type}, category: {media_category}")
            
            # Always use simple upload to avoid 403 issues with chunked upload
            logger.info("Using simple upload")
            return await self._simple_upload(file_path, access_token, media_type, media_category)
                
        except Exception as e:
            logger.error(f"Error uploading media to Twitter: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return None
        finally:
            # Clean up local file
            try:
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Cleaned up local file: {file_path}")
            except Exception as e:
                logger.warning(f"Failed to clean up file {file_path}: {e}")

    async def _simple_upload(self, file_path, access_token, media_type, media_category):
        """Simple upload for images only - FIXED VERSION"""
        try:
            url = "https://upload.twitter.com/1.1/media/upload.json"
            
            # FIXED: Don't set Content-Type header for multipart uploads
            headers = {
                "Authorization": f"Bearer {access_token}"
                # Removed Content-Type - let httpx set it automatically for multipart
            }
            
            async with aiofiles.open(file_path, 'rb') as f:
                file_content = await f.read()
            
            # FIXED: Proper file tuple format
            files = {
                'media': (os.path.basename(file_path), file_content, media_type)
            }
            
            # FIXED: Remove media_category for now to test
            data = {}  # Start with empty data
            
            logger.info(f"Simple upload to: {url}")
            logger.info(f"Upload headers: {headers}")
            logger.info(f"File size: {len(file_content)} bytes")
            logger.info(f"Media type: {media_type}")
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(url, headers=headers, files=files, data=data)
                
            return await self._handle_upload_response(response)
                
        except Exception as e:
            logger.error(f"Error in simple upload: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            return None

    async def _handle_upload_response(self, response):
        """Handle upload response and extract media_id"""
        logger.info(f"Upload response status: {response.status_code}")
        logger.info(f"Upload response headers: {dict(response.headers)}")
        
        if response.status_code in [200, 201]:
            try:
                media_data = response.json()
                media_id = media_data.get('media_id_string')
                logger.info(f"Media uploaded successfully, media_id: {media_id}")
                logger.info(f"Full response: {media_data}")
                return media_id
            except Exception as parse_error:
                logger.error(f"Could not parse success response: {parse_error}")
                return None
        else:
            logger.error(f"Failed to upload media: {response.status_code}")
            logger.error(f"Response text: {response.text}")
            
            # Enhanced error handling for 403
            if response.status_code == 403:
                logger.error("403 Forbidden - This could be due to:")
                logger.error("1. Invalid or expired Bearer token")
                logger.error("2. App doesn't have media upload permissions")
                logger.error("3. Token doesn't have write permissions")
                logger.error("4. Rate limiting")
                logger.error("Please check your Twitter App settings and regenerate tokens if needed")
            
            # Try to parse error response
            try:
                if response.text:  # Only parse if there's content
                    error_data = response.json()
                    logger.error(f"Error details: {error_data}")
                    
                    # Check for specific error types
                    if 'errors' in error_data:
                        for error in error_data['errors']:
                            error_code = error.get('code')
                            error_message = error.get('message', '')
                            logger.error(f"Twitter API Error {error_code}: {error_message}")
                            
                            # Handle specific error codes
                            if error_code == 32:
                                logger.error("Authentication failed - token may be invalid or expired")
                            elif error_code == 220:
                                logger.error("Your credentials do not allow access to this resource")
                            elif error_code == 324:
                                logger.error("The validation of media ids failed")
                else:
                    logger.error("Empty response body - likely a permission/authentication issue")
                            
            except Exception as parse_error:
                logger.error(f"Could not parse error response: {parse_error}")
                logger.error("This often happens with 403 errors that return empty responses")
            
            return None

    # Remove the chunked upload method to avoid 403 issues
    # async def _chunked_upload(self, ...):  # REMOVED

    async def _process_media_content(self, content, access_token):
        """Process images and videos, return list of media_ids"""
        media_ids = []
        
        # Process images
        if content.get('images'):
            images = content['images']
            if isinstance(images, str):
                images = [images]  # Convert single URL to list
            
            logger.info(f"Processing {len(images)} images")
            
            for i, image_url in enumerate(images):
                if len(media_ids) >= 4:  # Twitter allows max 4 media items
                    logger.warning("Maximum 4 media items allowed, skipping remaining images")
                    break
                
                logger.info(f"Processing image {i+1}/{len(images)}")
                
                if not image_url or not isinstance(image_url, str):
                    logger.warning(f"Invalid image URL at index {i}: {type(image_url)}")
                    continue
                    
                local_path = await self._download_media(image_url)
                if local_path:
                    media_id = await self._upload_media_to_twitter(local_path, access_token)
                    if media_id:
                        media_ids.append(media_id)
                        logger.info(f"Successfully processed image {i+1}, media_id: {media_id}")
                    else:
                        logger.error(f"Failed to upload image {i+1} to Twitter")
                else:
                    logger.error(f"Failed to download/process image {i+1}")
        
        # Skip videos for now due to complexity - focus on getting images working first
        if content.get('videos'):
            logger.warning("Video upload temporarily disabled - focusing on image uploads first")
        
        logger.info(f"Final media_ids count: {len(media_ids)}")
        return media_ids
            
    async def _async_post_tweet(self, content, user_id):
        logger.info(f"Starting async post tweet job for user {user_id}")
        logger.info(f"Content to post: {content}")
        
        try:
            token_data = await self.access_tokens_collection.find_one({"user_id": user_id})
            if not token_data:
                logger.error(f"No access token found at posting time for user {user_id}")
                return

            access_token = token_data.get("access_token")
            
            # Log token info (first and last 10 chars only for security)
            if access_token:
                token_preview = f"{access_token[:10]}...{access_token[-10:]}" if len(access_token) > 20 else "SHORT_TOKEN"
                logger.info(f"Using access token: {token_preview}")
            else:
                logger.error("Access token is None or empty")
                return
            
            # Prepare tweet text with hashtags
            tweet_text = self._prepare_tweet_text(content)
            
            # Process media content (images only for now)
            media_ids = await self._process_media_content(content, access_token)
            
            # Prepare the payload
            url = "https://api.twitter.com/2/tweets"  # Using v2 API for posting
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            }
            
            payload = {}
            if tweet_text:
                payload["text"] = tweet_text
            
            if media_ids:
                payload["media"] = {
                    "media_ids": media_ids
                }
            
            # Ensure we have either text or media
            if not tweet_text and not media_ids:
                logger.error("No text or media content found for tweet")
                return
            
            logger.info(f"Final payload: {payload}")

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=payload)

            if response.status_code == 201:
                logger.info(f"✅ Tweet posted successfully for user {user_id}")
                response_data = response.json()
                logger.info(f"Tweet ID: {response_data.get('data', {}).get('id', 'Unknown')}")
            elif response.status_code == 401:
                logger.warning(f"⚠️ Unauthorized: Access token may have expired for user {user_id}")
                logger.warning("Please regenerate your Twitter tokens")
            elif response.status_code == 403:
                logger.error(f"❌ Forbidden: App permissions insufficient for user {user_id}")
                logger.error("Check that your Twitter App has Read and Write permissions")
            else:
                logger.error(f"❌ Failed to post tweet for user {user_id}: {response.status_code} - {response.text}")
                
        except Exception as e:
            logger.error(f"❌ Error in _async_post_tweet: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")

    async def test_schedule_twitter_post_now(self):
        logger.info("Starting test: test_schedule_twitter_post_now")

        token_data_cursor = self.access_tokens_collection.find().sort([("_id", -1)]).limit(1)
        token_data_list = await token_data_cursor.to_list(length=1)

        if not token_data_list:
            logger.warning("No token found in DB")
            return

        token_data = token_data_list[0]
        user_id = token_data.get("user_id")
        if not user_id:
            logger.error("User ID not found in token data")
            return

        now_plus_1_sec = datetime.now(timezone.utc) + timedelta(seconds=1)
        timestamp_str = now_plus_1_sec.isoformat()

        test_content = {
            "text": "Hello from simplifiedoooo test!",
            "hashtags": ["test", "working"],
            "images": [
                "https://i.ytimg.com/vi/vXIek3627DY/maxresdefault.jpg" 
            ]
        }

        logger.info(f"Scheduling test tweet for user {user_id} at {timestamp_str}")
        await self.schedule_twitter_post(
            timestamp=timestamp_str,
            content=test_content,
            user_id=user_id
        )
        logger.info("✅ Test tweet scheduled successfully")
        return "Test tweet scheduled"
    
    def shutdown(self):
        """Call this when shutting down your application"""
        if self.scheduler.running:
            self.scheduler.shutdown()
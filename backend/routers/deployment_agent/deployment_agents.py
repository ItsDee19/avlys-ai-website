from datetime import time, timedelta, datetime
import os 
from dotenv import load_dotenv
import redis
import json
from .schedule_posts import SchedulePosts
from database.db import database

class DeploymentAgent:

    def __init__(self):
        try:
            self.db = database
        except Exception as e:
            raise Exception(f"Failed to connect to database")

        try:
            with open(r'D:\Avlys\avlys-ai-website\backend\routers\deployment_agent\deployment.json', 'r') as f:
                self.deployment_dict = json.load(f)
        except FileNotFoundError:
            raise FileNotFoundError("deployment.json file not found")
        except json.JSONDecodeError:
            raise ValueError("deployment.json contains invalid JSON")

        self.weekday_map = {
            "Monday": 0,
            "Tuesday": 1,
            "Wednesday": 2,
            "Thursday": 3,
            "Friday": 4,
            "Saturday": 5,
            "Sunday": 6,
        }
        self.scheduler = SchedulePosts(self.db)

    async def initialize_campaign(self, user_id, campaign_id, deployment_id):
        
        self.user_id = user_id
        self.campaign_id = campaign_id
        self.deployment_id = deployment_id
        
        creds = {
            "user_id": user_id,
            "campaign_id": campaign_id,
            "deployment_id": deployment_id,
            "status": "user initialized"
        }
        
        try:
            await self.db["user_credentials"].create_index(
            [("user_id", 1), ("campaign_id", 1), ("deployment_id", 1)],
            unique=True
        )
        except Exception as e:
            raise Exception(f"Failed to save user credentials: {e}")


    def schedule_campaigns(self, socials:list, content: dict, info: dict):
        for social in socials:
            try:
                if social == "instagram":
                    creds = info.get('instagram', {})
                    self.deploy_to_instagram(content.get('instagram', {}), creds.get('user_id'))

                elif social == "facebook":
                    creds = info.get('facebook', {})
                    self.deploy_to_facebook(content.get('facebook', {}), creds.get('user_id'))

                elif social == "twitter":
                    creds = info.get('twitter', {})
                    self.deploy_to_twitter(content.get('twitter', {}), creds.get('user_id'))
            
            except Exception as e:
                print(f"Error scheduling for {social}: {e}")

        try:
            self.redis_db.hset(f"deployment:{self.user_id}:{self.campaign_id}:{self.deployment_id}", "status", "completed")
        except Exception as e:
            print(f"Error updating Redis status: {e}")

        return "Posts scheduled for deployment"
    
    def _find_closest_datetime(self, time_config, now, today_weekday):
        closest_dt = None
        for item in time_config:
            target_day = item['day']
            target_time_str = item['time']
            target_time = datetime.strptime(target_time_str, "%H:%M").time()

            delta_days = (target_day - today_weekday + 7) % 7
            if delta_days == 0 and target_time <= now.time():
                delta_days = 7

            scheduled_date = now + timedelta(days=delta_days)
            scheduled_dt = datetime.combine(scheduled_date.date(), target_time)

            if closest_dt is None or scheduled_dt < closest_dt:
                closest_dt = scheduled_dt

        return closest_dt

    def deploy_to_instagram(self, content, user_id):
        try:
            time_config = self.deployment_dict.get('instagram')
            content_types = content.get('content_type', [])
            now = datetime.fromisoformat(content.get('date', {}).get('now'))
            today_weekday = content.get('date', {}).get('today_weekday')

            if not isinstance(content_types, list):
                content_types = [content_types]

            for ctype in content_types:
                if ctype in time_config:
                    closest_dt = self._find_closest_datetime(time_config.get(ctype, []), now, today_weekday)
                    if closest_dt:
                        self.scheduler.schedule_instagram_post(timestamp=int(closest_dt.timestamp()), content=content, user_id=user_id)
        except Exception as e:
            print(f"Instagram deployment error: {e}")

    def deploy_to_facebook(self, content, user_id):
        try:
            time_config = self.deployment_dict.get('facebook')
            now = datetime.fromisoformat(content.get('date', {}).get('now'))
            today_weekday = content.get('date', {}).get('today_weekday')

            closest_dt = self._find_closest_datetime(time_config, now, today_weekday)
            if closest_dt:
                self.scheduler.schedule_facebook_post(timestamp=int(closest_dt.timestamp()), content=content, user_id=user_id)
        except Exception as e:
            print(f"Facebook deployment error: {e}")

    def deploy_to_twitter(self, content, user_id):
        try:
            time_config = self.deployment_dict.get('twitter')
            now = datetime.fromisoformat(content.get('date', {}).get('now'))
            today_weekday = content.get('date', {}).get('today_weekday')

            closest_dt = self._find_closest_datetime(time_config, now, today_weekday)
            if closest_dt:
                self.scheduler.schedule_twitter_post(timestamp=int(closest_dt.timestamp()), content=content, user_id=user_id, )
        except Exception as e:
            print(f"Twitter deployment error: {e}")
            
    

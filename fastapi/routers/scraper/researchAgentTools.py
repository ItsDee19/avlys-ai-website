from geopy.geocoders import Nominatim
from serpapi import GoogleSearch
import dotenv
import os
import json
import re
from .init_twitter import get_driver, load_cookies
import time
from selenium.webdriver.common.by import By
from pytrends.request import TrendReq
from groq import Groq
import re

dotenv.load_dotenv()

class ResearchTools:

    def __init__(self, business_name, location='India'):
        self.business_name = business_name
        self.location = location


    def get_business(self):
        params = {
            "engine": "google_maps",
            "q": f"{self.business_name} {self.location}",
            "type": "search",
            "api_key": os.getenv("SERPAPI_KEY")
        }

        search = GoogleSearch(params)
        results = search.get_dict()

        extracted_data = {}
        extracted_data['business_name'] = self.business_name
        extracted_data['location'] = self.location

        if results.get('place_results'):
            place_results = results['place_results']
        elif results.get('local_results'):
            local_result = results['local_results'][0]
            place_id = local_result.get('place_id')

            params = {
                "engine": "google_maps",
                "place_id": place_id,
                "type": "search",
                "api_key": os.getenv("SERPAPI_KEY")
            }
            search = GoogleSearch(params)
            place_results = search.get_dict()
        else:
            print(f"No results found for {self.business_name}.")
            return {}
        
        print("Scraping Business Data")
        print("=" * 60)
        
        extracted_data["place_id"] = place_results.get("place_id")
        extracted_data["title"] = place_results.get('title')
        extracted_data["description"] = place_results.get("description")
        extracted_data["reviews_link"] = place_results.get("reviews_link")
        extracted_data["photos_link"] = place_results.get("photos_link")
        extracted_data["latitude"] = place_results.get('gps_coordinates', {}).get('latitude')
        extracted_data["longitude"] = place_results.get('gps_coordinates', {}).get('longitude')
        extracted_data["address"] = place_results.get("address")
        extracted_data["booking_link"] = place_results.get("booking_link")
        extracted_data["website"] = place_results.get("website")
        extracted_data["phone"] = place_results.get("phone")

        images = place_results.get("images", [])
        if images:
            extracted_data["thumbnail_url"] = images[0].get("thumbnail")

        user_reviews = place_results.get("user_reviews", {}).get("most_relevant", [])
        extracted_data["reviews"] = [review.get("description") for review in user_reviews[:6]]

        if extracted_data.get('latitude') and extracted_data.get('longitude'):
            geolocator = Nominatim(user_agent="get_neighbourhood-agent")
            location = geolocator.reverse(
                (extracted_data['latitude'], extracted_data['longitude']),
                exactly_one=True,
                addressdetails=True
            )
            address = location.raw.get('address', {})
            extracted_data['road'] = address.get('road')
            extracted_data['locality'] = address.get('state_district')

        return extracted_data

class Scraper():
    
    def __init__(self, extracted_data):
        self.extracted_data = extracted_data
        self.client = Groq()
        
        
    def scrape_twitter(self):
        driver = get_driver()
        query_parts = [
            self.extracted_data.get('title'),
            self.extracted_data.get('road'),
            self.extracted_data.get('locality'), 
            self.extracted_data.get('business_name'),
            self.extracted_data.get('location')
        ]
        
        print("Scraping Twitter Data")
        print("=" * 60)
        
        combined_query = " ".join([q for q in query_parts if q])
        query_parts.append(combined_query)
        results = []
        
        try:
            success = load_cookies(driver, os.getenv("COOKIES_FILE"))
            if not success:
                print("Unable to load cookies")
                driver.quit()
                return
            
            for q in query_parts:
                if not q:
                    continue
                driver.get(f"https://x.com/search?q={q}&src=typed_query")
                time.sleep(5)
                
                tweets = driver.find_elements(By.XPATH, '//div[@data-testid="tweetText"]')
                for i, tweet in enumerate(tweets[:10]):
                    text = tweet.text
                    hashtags = re.findall(r"#\w+", text)
                    results.append({
                        "query": q,
                        "text": text,
                        "hashtags": hashtags
                    })
        finally:
            driver.quit()
            
        self.extracted_data['twitter_results'] = results
        return self.extracted_data


    def scrape_google_news(self):
        
        print("Scraping News Data")
        print("=" * 60)
        
        params = {
        "engine": "google_news",
        "q": f"{self.extracted_data.get('title')} {self.extracted_data.get('location')}",
        "gl": "in",
        "hl": "en",
        "api_key": os.getenv("SERPAPI_KEY")
        }
        
        search = GoogleSearch(params)
        results = search.get_dict()
        if results:
            if results["news_results"]:
                news_results = results["news_results"][:6]
                news_summary = [
                {
                    "title": news["title"],
                    "source": news["source"]["name"]
                }
                for news in news_results
            ]
                self.extracted_data['news_results'] = news_summary
            
        return self.extracted_data
    
    def scrape_google_events(self):
                
        print("Scraping Events Data")
        print("=" * 60)
        
        params = {
        "engine": "google_events",
        "q": f"Events in {self.extracted_data.get('location')}",
        "hl": "en",
        "gl": "in",
        "api_key": os.getenv("SERPAPI_KEY")
        }

        search = GoogleSearch(params)
        results = search.get_dict()
        event_results = results["events_results"]
        events_summary = [
        {
            "title": event["title"],
            "description": event["description"]
        }
        for event in event_results
        if "title" in event and "description" in event
    ]
        self.extracted_data['event_results'] = events_summary
        return self.extracted_data        
        
    def  get_cultural_insights(self):
                
        print("Scraping Culture and Market Data")
        print("=" * 60)
        
        completion = self.client.chat.completions.create(
        model="meta-llama/llama-4-scout-17b-16e-instruct",
        messages=[
        {
            "role": "system",
            "content": "You are a specialist in Indian culture and lifestyle of various Indian states. You know the market trends of every Indian city.Return only a JSON object with keys like `culture`, `lifestyle`, `preferences`, `dislikes`, etc. Avoid text outside the JSON block."
        },
        {
            "role": "user",
            "content": f"What is the culture and lifestyle of people living in {self.extracted_data.get('location')}? Do you have any information on {self.extracted_data.get('business_name')} and what people like and dont like?\n"
        },

        ],
        temperature=0.7,
        max_completion_tokens=1024,
        top_p=1,
        stream=False,
        stop=None,
        )
        
        message = completion.choices[0].message
        content = message.content
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", content, re.DOTALL)
        if match:
            json_string = match.group(1)
        else:
            json_string = content  

        try:
            parsed_json = json.loads(json_string)
            self.extracted_data.update(parsed_json)
            return self.extracted_data

        except json.JSONDecodeError as e:
            print("❌ Failed to parse JSON:", e)
            print("🔍 Raw content:", content)

        finally:
            return self.extracted_data
            

class Task():
    
    def __init__(self,business_name, location):
        self.business_name = business_name
        self.location = location
        
    def run(self):
        
        print("Running task")
        print("=" * 60)
        
        research = ResearchTools(self.business_name, self.location)
        data = research.get_business()
        scraper = Scraper(data)
        scraped_data = scraper.scrape_twitter()
        scraped_data = scraper.scrape_google_events()
        scraped_data = scraper.scrape_google_news()
        scraped_data = scraper.get_cultural_insights()
        
        return scraped_data
        
          
# def main():
#     business_name = 'Hard Rock Cafe'
#     business_location = 'Park Street'
    
#     task = Task(business_name, business_location)
#     data = task.run()
    
#     with open(f"extracted_data_{business_name}_{business_location.replace(',', '').replace(' ', '_')}.json", "w", encoding="utf-8") as f:
#         f.write(json.dumps(data, ensure_ascii=False) + "\n")

# if __name__ == "__main__":
#     main()

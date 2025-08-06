import time
import pickle
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
import requests
from undetected_chromedriver import Chrome
import random
import os

TWITTER_URL = "https://twitter.com/i/flow/login"
COOKIES_FILE = "twitter_cookies.pkl"

def get_driver():
    
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--start-maximized")
    options.add_argument("--disable-blink-features=AutomationControlled")
    driver = Chrome(options=options)
    return driver

def load_cookies(driver, cookies_file):
    if not os.path.exists(cookies_file):
        print("cookie file not found")
        return False
    
    driver.get("https://x.com/")
    time.sleep(5)
    
    with open(cookies_file, "rb") as f:
        cookies = pickle.load(f)
        
    for cookie in cookies:
        if 'expiry' in cookie:
            del cookie['expiry']
            
        try:
            driver.add_cookie(cookie)
        except Exception as e:
            print(f"⚠️ Failed to add cookie: {cookie.get('name')} - {e}")
            
    driver.refresh()
    time.sleep(5)
    return True
 
if __name__ == "__main__":
    driver = get_driver()
    try:
        success = load_cookies(driver, COOKIES_FILE)
        if not success:
            print("False")

        time.sleep(5)
        print("✅ Logged in. Page title:", driver.title)
    
    finally:
        print("✅ Browser session finished. Closing...")
        driver.quit()


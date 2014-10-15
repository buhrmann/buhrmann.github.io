import requests
from bs4 import BeautifulSoup as bs

 r = requests.get("https://www.linkedin.com/in/thomasbuhrmann")
 html = r.text
 
 s = bs(html)
 
  s.find_all("span", class_='title')
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

class TestDriver:

    def setUp(self, page_url):
        self.url = page_url
        chrome_options = Options()
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument("--headless")
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920x1080")

        self.webdriver = webdriver.Chrome(options=chrome_options)
        self.webdriver.set_page_load_timeout(120)
        self.webdriver.get(self.url)

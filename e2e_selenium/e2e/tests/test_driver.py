from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.firefox.options import Options
from config import Config
import time

class TestDriver():

    def setUp(self, page_url):
        self.url = page_url
        chrome_options = Options()

        # if Config.DOCKER:
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920x1080")

        self.webdriver = webdriver.Chrome(options=chrome_options)
        self.webdriver.get(self.url)

    # Take screenshot on TestCase failure
    def tearDown(self):
        if self.test_failed:
            datetime = time.strftime(' %H:%M:%S %d_%m_%Y')
            test_method_name = self._testMethodName + datetime
            self.webdriver.save_screenshot("reports/bug-screenshots/%s.png" % test_method_name)

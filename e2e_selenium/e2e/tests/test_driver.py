from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from pyvirtualdisplay import Display

class TestDriver:

    def setUp(self, page_url):
        display = Display(visible=0, size=(1920, 1080))
        display.start()
        self.url = page_url
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--window-size=1920x1080")
        self.webdriver = webdriver.Chrome(options=chrome_options)
        self.webdriver.get(self.url)
        # capture the screen
        self.webdriver.get_screenshot_as_file("capture.png")

        display.stop()


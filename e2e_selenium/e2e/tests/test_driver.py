from selenium import webdriver

class TestDriver:

    def setUp(self, page_url):

        self.url = page_url
        self.webdriver = webdriver.Chrome()
        self.webdriver.get(self.url)


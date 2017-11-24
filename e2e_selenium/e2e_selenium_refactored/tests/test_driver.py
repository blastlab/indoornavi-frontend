from selenium import webdriver

class TestDriver:

    def setUp(self, page_uri):
        self.url = 'http://localhost:4200/'
        self.uri = page_uri
        self.webdriver = webdriver.Chrome()
        self.webdriver.get(self.url+self.uri)

    def tearDown(self):
        self.driver.quit()

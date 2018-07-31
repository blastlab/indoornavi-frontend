from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import os


class TestDriver(object):

    def setUp(self, page_url):

        self.url = page_url
        chrome_options = Options()
        chrome_options.add_argument('--disable-extensions')
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--start-maximized")

        self.webdriver = webdriver.Chrome(options=chrome_options)
        self.webdriver.set_page_load_timeout(120)
        self.webdriver.get(self.url)

    # Take screenshot on TestCase failure
    def tearDown(self):
        if self.test_failed:
            _reports_path = 'test-reports/bug-screenshots'
            _browser_log_path = 'test-reports/browser-console'
            _browser_log_content = self.webdriver.get_log('browser')
            try:
              os.makedirs(_reports_path)
              os.makedirs(_browser_log_path)
            except OSError:
              pass

            datetime = time.strftime(' %H:%M:%S %d_%m_%Y')
            test_method_name = self._testMethodName + datetime
            self.webdriver.save_screenshot("{0}/{1}.png".format(_reports_path, test_method_name))
            if _browser_log_content:
                with open("{0}/{1}.log".format(_browser_log_path, test_method_name), "w") as text_file:
                  print("Test Browser console log saved in : "
                        "{0}/{1}.log file\n\n {2}".format(_browser_log_path, test_method_name, _browser_log_content),
                        file=text_file)

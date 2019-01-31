from selenium import webdriver
from selenium.webdriver.chrome.options import Options
import time
import os
import logging


class TestDriver(object):

    def setUp(self, page_url):

        self.url = page_url
        chrome_options = Options()
        chrome_options.add_argument('--disable-extensions')
        chrome_options.add_argument("--window-size=1920x1080")
        chrome_options.add_argument("--headless")
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument("--no-sandbox")

        self.webdriver = webdriver.Chrome(options=chrome_options)
        self.webdriver.set_page_load_timeout(30)
        # self.webdriver.set_window_size(1920, 1080)
        self.webdriver.get(self.url)

    # Take screenshot on TestCase failure
    def tearDown(self):
        browser_log_content = self.webdriver.get_log('browser')
        log_teardown = logging.getLogger("TEARDOWN: ")
        log_teardown.info("BROWSER CONSOLE LOGS:\n{0}".format(browser_log_content))

        if self.test_failed:
            TestDriver.fail_snapshot(self)

    def fail_snapshot(self, optional=None):

            debug_snapshot_name = optional if optional is not None else ''

            snap = logging.getLogger("-- TEST FAILED - SNAPSHOT --")
            snap.info(self.webdriver.current_url)
            snap.info(debug_snapshot_name)

            _reports_path = 'test-reports/bug-screenshots'
            _browser_log_path = 'test-reports/browser-console'
            _browser_log_content = self.webdriver.get_log('browser')
            try:
                os.makedirs(_reports_path)
                os.makedirs(_browser_log_path)
            except OSError:
                pass

            datetime = time.strftime(' %H:%M:%S %d_%m_%Y')
            temp_method_name = '_' if not hasattr(self.__class__, '_testMethodName') else self._testMethodName

            snap.info(temp_method_name)

            test_method_name = temp_method_name + datetime + debug_snapshot_name

            self.webdriver.save_screenshot("{0}/{1}.png".format(_reports_path, test_method_name))

            if _browser_log_content:
                with open("{0}/{1}.log".format(_browser_log_path, test_method_name), "w") as text_file:
                    snap.info("Test Browser console log saved in : {0}/{1}.log file\n\n {2}"
                              .format(_browser_log_path, test_method_name, _browser_log_content))
                    print("Test Browser console log saved in : "
                          "{0}/{1}.log file\n\n {2}".format(_browser_log_path, test_method_name, _browser_log_content),
                          file=text_file)

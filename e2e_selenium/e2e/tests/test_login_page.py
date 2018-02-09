import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.login_page import LoginPage

class TestLoginPage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.page_url = LoginPage.login_url
        cls.webdriver = webdriver
        TestDriver.setUp(cls, cls.page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.option = 1

    def __init_test_method(self):
        # [TS001].Check if page is loaded correctly
        self.assertTrue(self.page.check_page_loaded_correctly)
        # [TS002].Check button contains 'login' text
        self.assertEqual(self.page.get_button_text(), 'Login')

    # TC001
    def test_login_valid_credentials(self):
        """Test login with valid credentials"""
        self.__init_test_method()

        # [TS003].Clear form, fill with correct data and submit
        self.assertEqual(self.page.login_process(self.option), 'Complexes')
        self.test_failed = False

    # TC002 (invalid password) & TC003 (invalid username)
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        for option in range(2, 4):
            self.__init_test_method()
            self.assertTrue(self.page.login_process(option))

        self.test_failed = False

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

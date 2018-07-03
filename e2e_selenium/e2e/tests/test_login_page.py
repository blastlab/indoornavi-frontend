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

    def setUp(self):
        self.test_failed = True
        self.webdriver.delete_all_cookies()
        self.webdriver.execute_script('window.localStorage.clear();')
        self.webdriver.refresh()
        self.assertTrue(self.page.check_page_loaded_correctly)
        self.assertEqual(self.page.get_button_text(), 'Login')

    # TC001
    def test_login_valid_credentials(self):

        """Test login with valid credentials"""

        self.assertEqual(self.page.login_process(self.option), 'Complexes')
        self.test_failed = False

    # TC002 (invalid password) & TC003 (invalid username)
    def test_login_invalid_credentials(self):

        """Test login with invalid credentials"""

        for option in range(2, 4):
            self.assertTrue(self.page.login_process(option))
        self.test_failed = False

    def test_logout(self):

        """Test logout"""

        self.assertEqual(self.page.login_process(self.option), 'Complexes')
        # click dropdown button
        self.assertTrue(self.page.is_dropdown_button_clickable())
        self.page.click_dropdown_button()
        # is logout button clickable
        self.assertTrue(self.page.is_logout_button_clickable())
        # click logout button
        self.page.click_logout_button()
        self.assertFalse(self.webdriver.execute_script("return window.localStorage.length;"))
        self.assertEqual(self.webdriver.current_url[-5:], 'login')
        self.test_failed = False

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

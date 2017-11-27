import os
import sys
import unittest
from selenium import webdriver
from test_driver import TestDriver
cwd = os.getcwd()
sys.path.append(cwd + '/pages/')
from login_page import LoginPage

class TestLoginPage(unittest.TestCase):

    def setUp(self):
        self.page_url  = LoginPage.login_url
        self.webdriver = webdriver
        TestDriver.setUp(self, self.page_url)

    def test_login_valid_credentials(self):
        # test step 1.Check if page is loaded correctly
        page = LoginPage(self.webdriver)
        page.check_page_loaded_correctly()
        # self.assertTrue(LoginPage.check_page_loaded_correctly)
        # test step 2.Check button contains 'login' text
        # LoginPage.find_login_button(self)
        # print()
        # print()
        # self.assertEquals(LoginPage.find_login_button, 'Login')

    # def test_login_invalid_password(self):
    #     print('[TC002] test_login_invalid_password')
    #
    # def test_login_invalid_username(self):
    #     print('[TC003] test_login_invalid_username')

    def tearDown(self):
        self.webdriver.quit()

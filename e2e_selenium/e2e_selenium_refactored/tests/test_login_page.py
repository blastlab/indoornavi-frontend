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
        self.page = LoginPage(self.webdriver)
        self.option = 1

    def __init_test_method(self):
        # [TS001].Check if page is loaded correctly
        self.assertTrue(self.page.check_page_loaded_correctly)
        # [TS002].Check button contains 'login' text
        self.assertEqual(self.page.get_button_text(), 'Login')

    # TC001
    def test_login_valid_credentials(self):
        self.__init_test_method()
        # [TS003].Clear form, fill with correct data and sumbit
        self.assertEqual(self.page.login_with_valid_data(self.option), 'Complexes')

    # TC002
    def test_login_invalid_password(self):
        self.option = 2
        self.__init_test_method()
        # [TS003].Clear form, fill with incorrect password and sumbit

        self.assertEqual(self.page.login_with_valid_data(self.option))

    # def test_login_invalid_password(self):
    #     # create Object LoginPage
    #     page = LoginPage(self.webdriver)
    #     # [TS001].Check if page is loaded correctly
    #     self.assertTrue(page.check_page_loaded_correctly)
    #     # [TS002].Check button contains 'login' text
    #     self.assertEqual(page.get_button_text(), 'Login')
    #     # [TS003].Clear form, fill with invalid password and sumbit
    #     self.assertEqual(page.login_with_invalid_data(), 'Your building complexes')
    #
    # def test_login_invalid_username(self):
    #     print('[TC003] test_login_invalid_username')


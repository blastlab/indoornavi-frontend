import os
import sys
import unittest
from selenium import webdriver
from test_driver import TestDriver
cwd = os.getcwd()
sys.path.append(cwd + 'pages/')
from login_page import LoginPage
sys.path.append('/home/motlowski/Desktop/Indoornavi/frontend/e2e_selenium/e2e/pages/constructions')
from complexes_page import ComplexesPage

class TestComplexesPage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.login_page_url = LoginPage.login_url
        cls.webdriver = webdriver
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.complexes_page = ComplexesPage(cls.webdriver)
        cls.option = 1

    def multi_assertion(self):
        # create list for all returned True or False
        asserts = []

        dropdown_present = self.complexes_page.is_dropdown_button_present()
        add_button_present = self.complexes_page.is_add_button_present()
        column_title_present = self.complexes_page.get_construction_column_title()
        complexes_counter = self.complexes_page.check_if_there_is_any_row()

        asserts.append(dropdown_present)
        asserts.append(add_button_present)
        asserts.append(column_title_present)
        asserts.append(complexes_counter)

        # Check if there is any False in array
        return False if False in asserts else True

    def test_complexes_page_is_loaded_correctly(self):

        # Check few conditionals:
        # - Dropdown button displayed
        # - Add button displayed
        # - Title is displayed
        # - Table Header is displayed properly
        self.assertEqual(self.page.login_process(self.option), 'Complexes')

        self.assertTrue(self.multi_assertion())
        

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

import os
import sys
import unittest
from selenium import webdriver
from test_driver import TestDriver
cwd = os.getcwd()
sys.path.append(cwd + 'pages/')
sys.path.append('/home/motlowski/Desktop/Indoornavi/frontend/e2e_selenium/e2e/pages/constructions')
from login_page import LoginPage
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
        # login before each test case
        cls.page.login_process(cls.option)

    def multi_assertion(self):
        # create list for all returned True or False
        asserts = []

        dropdown_present = self.complexes_page.is_dropdown_button_present()
        add_button_present = self.complexes_page.is_add_button_present()
        column_title_present = self.complexes_page.check_construction_column_title()
        complexes_counter = self.complexes_page.check_if_there_is_any_row()

        asserts.append(dropdown_present)
        asserts.append(add_button_present)
        asserts.append(column_title_present)
        asserts.append(complexes_counter)

        # Check if there is any False in array
        return False if False in asserts else True

    def test_complexes_page_is_loaded_correctly(self):
        self.assertTrue(self.multi_assertion())

    # [TC004] Test of adding complex correctly
    # [TC005] Test of adding complex with too long name
    # [TC006] Test of adding complex with too short name
    # [TC007] Test of adding complex with exisitng name
    # [TC008] Test of adding complex with forbidden signs
    # def test_add_complex_correctly(self):
        # 1/Click add button
        # 2/Modal window with title
        # 3/Save and Cancel Button
        # 4/Fill Input
        # 5/Save Click and redirect
        # 6/Check if element is displayed & in addition growl with text
        # 6/Remove Row

    def test_add_new_complex_correctly(self):
        self.complexes_page.add_button_click()
        # Zmienic tytul modala
        # self.assertTrue(self.complexes_page.check_modal_title())
        # self.assertTrue(self.complexes_page.is_save_button_present())
        # self.assertTrue(self.complexes_page.is_cancel_button_present())
        self.complexes_page.enter_complex_name()
        self.complexes_page.save_add_new_complex()

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

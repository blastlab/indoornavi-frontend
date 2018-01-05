import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.constructions.complexes_page import ComplexesPage
from pages.login_page import LoginPage

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
        cls.complexes_page.create_complex_db_env()
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

    def test_add_new_complex_correctly(self):

        self.complexes_page.add_button_click()
        # TODO Zmienic tytul modala
        # self.assertTrue(self.complexes_page.check_modal_title())
        self.assertTrue(self.complexes_page.is_save_button_present())
        self.assertTrue(self.complexes_page.is_cancel_button_present())
        self.complexes_page.enter_complex_name()
        # TODO sprawdzic ilosc wpisow przed dodaniem
        # self.complexes_page.get_complexes_count()
        self.complexes_page.save_add_new_complex()
        # TODO sprawdzenie ilosci wpisow po dodaniu
        # self.complexes_page.get_complexes_count()
        # TODO sprawdzenie czy element sie pojawil
        self.complexes_page.if_complex_appear()
        self.assertEqual(self.complexes_page.if_complex_saved_in_db(), 'TestComplex')

    @classmethod
    def tearDownClass(cls):
        # cls.complexes_page.rollback_db('testik')
        cls.webdriver.quit()

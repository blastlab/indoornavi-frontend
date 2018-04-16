import unittest
import time
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.constructions.test_base import TestBase
from pages.constructions.construction_page import ConstructionPage
from pages.base_page import BasePage
from pages.constructions.floors_page import FloorsPage
from pages.login_page import LoginPage
from pages.constructions.map_page import MapPage

class TestMapPage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.webdriver = webdriver
        cls.login_page_url = LoginPage.login_url
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.base_page = BasePage(cls.webdriver)
        cls.floors_page = FloorsPage(cls.webdriver)
        cls.map_page = MapPage(cls.webdriver)
        cls.construction_page = ConstructionPage(cls.webdriver, 'map')
        cls.option = 1
        # login before each test case
        cls.base_page.truncate_db()
        cls.construction_page.create_construction_db_env()
        cls.page.login_process(cls.option)

    # TC[001]
    def _test_01_map_page_is_loaded_correctly(self):
        """Test that map page is loaded correctly"""
        self.construction_page.redirect_button_click()
        self.construction_page.is_redirect_button_present()
        self.construction_page.redirect_button_click()
        self.construction_page.is_redirect_button_present()
        self.construction_page.redirect_button_click()
        # Test that there is upload content
        self.assertTrue(self.map_page.is_upload_content_present())
        # Test that there is upload button
        self.assertTrue(self.map_page.is_upload_map_button_present())

    # TC[002]
    def _test_02_add_map_correctly(self):
        """Test adding new map correctly"""
        self.map_page.add_button_click()
        # TODO Zmienic tytul modala -  Add floor / Add new floor
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        self.assertTrue(self.construction_page.is_save_button_present())
        self.assertTrue(self.construction_page.is_cancel_button_present())
        self.construction_page.enter_construction_name()
        # TODO sprawdzic ilosc wpisow przed dodaniem
        # self.complexes_page.get_complexes_count()
        self.construction_page.save_add_new_construction()
        # TODO sprawdzenie ilosci wpisow po dodaniu
        # self.complexes_page.get_complexes_count()
        # TODO sprawdzenie czy toast sie wyswietlil
        # Check that toast is displayed
        self.assertTrue(self.construction_page.is_new_construction_toast_present())
        # Check that new complex is displayed
        self.assertTrue(self.construction_page.is_new_construction_present())
        # Check that toast disappeared
        self.assertTrue(self.construction_page.is_construction_toast_disappear())
        # Check that new complex has been saved in db
        self.assertEqual(self.construction_page.if_saved_in_db(), 'TestFloor')

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

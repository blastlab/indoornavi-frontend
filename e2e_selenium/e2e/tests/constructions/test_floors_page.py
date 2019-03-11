import unittest
import time
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.constructions.construction_page import ConstructionPage
from pages.base_page import BasePage
from pages.constructions.floors_page import FloorsPage
from pages.login_page import LoginPage


class TestFloorsPage(unittest.TestCase, FloorsPage):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.webdriver = webdriver
        cls.login_page_url = LoginPage.login_url
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.floors_page = FloorsPage(cls.webdriver, 'floor')
        cls.floors_page.truncate_db()
        cls.floors_page.create_construction_db_env()
        cls.option = 1
        # truncate db & create env before all tests
        # login before all tests
        cls.page.login_process(cls.option)
        # check the tested page is loaded correctly
        cls.webdriver.get(cls.base_url+"/complexes")
        cls.floors_page_is_loaded_correctly(cls)

    def floors_page_is_loaded_correctly(self):
        """Test that floors page is loaded correctly"""

        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()
        # time.sleep(5)
        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()
        # assert self.floors_page.multi_assertion()
        self.test_failed = False

    def setUp(self):
        self.test_failed = True
        self.floors_page.truncate_db()
        self.floors_page.create_construction_db_env()
        self.webdriver.refresh()

    # TC[002]
    def test_02_add_new_floor_correctly(self):

        """Test adding new floor correctly"""
        self.assertTrue(self.floors_page.is_add_button_clickable())
        self.floors_page.add_button_click()
        # TODO Zmienic tytul modala -  Add floor / Add new floor
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        self.assertTrue(self.floors_page.is_save_button_present())
        self.assertTrue(self.floors_page.is_cancel_button_present())
        self.floors_page.enter_construction_name()
        self.floors_page.save_add_new_construction()
        # TODO sprawdzenie ilosci wpisow po dodaniu
        # self.complexes_page.get_complexes_count()
        # Check that toast is displayed
        self.assertTrue(self.floors_page.is_new_construction_toast_present())
        # Check that new complex is displayed
        self.assertTrue(self.floors_page.is_new_construction_present())
        # Check that toast disappeared
        self.assertTrue(self.floors_page.is_construction_toast_disappear())
        # Check that new complex has been saved in db
        self.assertEqual(self.floors_page.if_saved_in_db(), 'TestFloor')
        self.test_failed = False

    # TC[003]
    # TODO do zrobienia walidacja na limit znakow
    # def test_add_floor_with_negative_minmax_charaters(self):

    # TC[004]
    def _test_04_delete_floor_correctly(self):
        """Test that deleting floor is correct"""

        self.assertTrue(self.floors_page.is_remove_button_clickable())
        # Click last floor remove button
        self.floors_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.floors_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.floors_page.is_yes_button_present())
        self.assertTrue(self.floors_page.is_no_button_present())
        # # # TODO sprawdzenie ilosci wpisow przed dodaniem
        # Click yes - confirm remove floor
        self.floors_page.click_yes_button()
        # # # TODO sprawdzenie ilosci wgit pisow po usunieciu
        # Check that toast is displayed
        self.assertTrue(self.floors_page.is_remove_construction_toast_present())
        # Check that toast is disappeared
        self.assertTrue(self.floors_page.is_remove_construction_toast_disappear())
        # Check that new floor has been saved in db -> now last floor name is Test Floor B
        self.assertEqual(self.floors_page.if_saved_in_db(), 'Test Floor A')
        self.test_failed = False

    # TC[005]
    def test_05_delete_floor_cancel(self):
        """Test cancel deleting action is correct"""

        self.assertTrue(self.floors_page.is_remove_button_clickable())
        # Click last floor remove button
        self.floors_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.floors_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.floors_page.is_yes_button_present())
        self.assertTrue(self.floors_page.is_no_button_present())
        self.floors_page.click_no_button()
        self.assertTrue(self.floors_page.is_confirm_remove_window_disappear())
        # Check that the confirm remove modal disappeared
        self.test_failed = False

    # TC[006]
    def test_06_edit_floor_correctly(self):
        """Test that edit floor action is correct"""

        # Check that edit button click is clickable
        self.assertTrue(self.floors_page.is_edit_button_present())

        self.floors_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit floor
        # self.assertTrue(self.floors_page.check_add_modal_title())
        self.assertTrue(self.floors_page.is_save_button_present())
        self.assertTrue(self.floors_page.is_cancel_button_present())
        self.floors_page.enter_edit_construction_name()
        # Save click
        self.floors_page.save_edit_click()
        # Check that toast is displayed
        self.assertTrue(self.floors_page.is_edit_construction_toast_present())
        # Check that toast is disappear
        self.assertTrue(self.floors_page.is_edit_construction_toast_disappear())
        # Check that new floor is displayed
        self.assertTrue(self.floors_page.is_edited_construction_present())
        # Check that new floor has been saved in db
        self.assertEqual(self.floors_page.if_saved_in_db(), 'TestEditFloor')
        self.test_failed = False

    # # # TODO Test sprawdzajacy edycje po wprowadzeniu istniejacego juz pietra
    # TC[007]
    def test_07_edit_floor_negative_existing_level(self):

        """Test editing floor action with existing level"""

        # Check that edit button click is clickable
        self.assertTrue(self.floors_page.is_edit_button_present())

        self.floors_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit floor
        # self.assertTrue(self.floors_page.check_add_modal_title())
        self.assertTrue(self.floors_page.is_save_button_present())
        self.assertTrue(self.floors_page.is_cancel_button_present())
        self.floors_page.enter_edit_construction_name()
        self.floors_page.enter_existing_level()
        # Save click
        self.floors_page.save_edit_click()
        # Check that warning toast is displayed
        self.assertTrue(self.floors_page.is_warning_toast_present())
        self.test_failed = False

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

import unittest
import time
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.constructions.test_base import TestBase
from pages.constructions.construction_page import ConstructionPage
from pages.base_page import BasePage
from pages.constructions.buildings_page import BuildingsPage
from pages.login_page import LoginPage

class TestBuildingsPage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.login_page_url = LoginPage.login_url
        cls.webdriver = webdriver
        TestDriver.setUp(cls, cls.login_page_url)
        cls.base_page = BasePage(cls.webdriver)
        cls.page = LoginPage(cls.webdriver)
        cls.buildings_page = BuildingsPage(cls.webdriver)
        cls.construction_page = ConstructionPage(cls.webdriver, 'building')
        cls.option = 1
        # login before each test case
        cls.base_page.truncate_db()
        cls.construction_page.create_construction_db_env()
        cls.page.login_process(cls.option)

    def _test_building_page_is_loaded_correctly(self):
        """Test that building page has been correctly loaded"""
        self.construction_page.redirect_button_click()
        self.assertTrue(TestBase.multi_assertion(self))

    def test_add_new_building_correctly(self):
        """Test adding new building correctly"""
        self.construction_page.redirect_button_click()
        self.construction_page.add_button_click()
        # TODO Zmienic tytul modala -  Add building / Add new building
        # self.assertTrue(self.construction_page.check_add_modal_title())
        self.assertTrue(self.construction_page.is_save_button_present())
        self.assertTrue(self.construction_page.is_cancel_button_present())
        self.construction_page.enter_construction_name()
        # TODO sprawdzic ilosc wpisow przed dodaniem
        # self.construction_page.get_buildings_count()
        self.construction_page.save_add_new_construction()
        # TODO sprawdzenie ilosci wpisow po dodaniu
        # self.construction_page.get_buildings_count()
        # TODO sprawdzenie czy toast sie wyswietlil
        # Check that toast is displayed
        self.assertTrue(self.construction_page.is_new_construction_toast_present())
        # Check that new building is displayed
        self.assertTrue(self.construction_page.is_new_construction_present())
        # Check that toast disappeared
        self.assertTrue(self.construction_page.is_construction_toast_disappear())
        # Check that new building has been saved in db
        self.assertEqual(self.construction_page.if_saved_in_db(), 'TestBuilding')

    # TC[002]
    def test_add_new_building_negative_empty_input_and_cancel_click(self):
        """Test that building will be added with empty input"""
        # 1.Check adding with empty input
        self.construction_page.add_button_click()
        self.construction_page.save_add_new_construction()
        self.assertEqual(self.construction_page.error_message_name(), 'Name is required.')
        self.construction_page.cancel_add_new_construction()

    # TODO do zrobienia walidacja na niedozwolone znaki
    # TC[003]
    def _test_add_new_building_negative_illegal_characters(self):
        """Test that building will be added with illegal characters"""
        self.construction_page.add_button_click()
        self.construction_page.enter_illegal_chars()
        self.construction_page.save_add_new_construction()
        self.assertEqual(self.construction_page.error_message_construction_name(), 'Input field contains illegal characters.')
        self.construction_page.cancel_add_new_construction()

    # TC[004]
    # TODO do zrobienia walidacja na limit znakow
    # def test_add_complex_with_negative_minmax_charaters(self):

    # TC[005]
    def test_delete_building_correctly(self):
        """Test that building will be deleted correctly"""
        # Click last building remove button
        self.construction_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.construction_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.construction_page.is_yes_button_present())
        self.assertTrue(self.construction_page.is_no_button_present())
        # TODO sprawdzenie ilosci wpisow przed dodaniem
        # self.construction_page.get_buildings_count()
        # Click yes - confirm remove building
        self.construction_page.click_yes_button()
        # self.construction_page.save_add_new_building()
        # TODO sprawdzenie ilosci wgit pisow po usunieciu
        # self.construction_page.get_buildings_count()
        # Check that toast is displayed
        self.assertTrue(self.construction_page.is_remove_construction_toast_present())
        # Check that new building is disappeared
        # self.assertTrue(self.construction_page.is_removed_building_disappeared())
        # TODO sprawdzenie czy wpis w bazie danych został usunięty ()
        # Check that new building has been saved in db -> now last building name is Test Industry
        self.assertEqual(self.construction_page.if_saved_in_db(), 'Test Building B')

    # TC[006]
    def test_delete_building_cancel(self):
        """Test cancel of deleting building """
        # Click last building remove button
        self.construction_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.construction_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.construction_page.is_yes_button_present())
        self.assertTrue(self.construction_page.is_no_button_present())
        self.construction_page.click_no_button()
        self.assertFalse(self.construction_page.is_confirm_remove_window_displayed())
        # Check that the confirm remove modal disappeared

    # TC[007]
    # TODO Jesli uzytkownik kliknie poza modal, okno sie zamyka
    def _test_delete_complex_click_outside_modal(self):
      print('TEST - DELETE - Resignation - outside modal click')

    # TC[008]
    def test_edit_building_correctly(self):
        """Test editing building correctly"""
        self.construction_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit building
        # self.assertTrue(self.construction_page.check_add_modal_title())
        self.assertTrue(self.construction_page.is_save_button_present())
        self.assertTrue(self.construction_page.is_cancel_button_present())
        # TODO Check that the chosen element contains the same name
        self.construction_page.enter_edit_construction_name()
        # Save click
        self.construction_page.save_edit_click()
        # Check that toast is displayed
        self.assertTrue(self.construction_page.is_edit_construction_toast_present())
        # Check that new building is displayed
        self.assertTrue(self.construction_page.is_edited_construction_present())
        # Check that new building has been saved in db
        self.assertEqual(self.construction_page.if_saved_in_db(), 'TestEditBuilding')

    # TC[009] TODO dokonczyc test
    def test_edit_building_negative_empty_input(self):
        """Test editing building with empty input"""
        self.construction_page.edit_button_click()
        self.construction_page.clear_edit_input()
        self.construction_page.save_edit_click()
        self.assertEqual(self.construction_page.error_message_name(), 'Name is required.')

    # TC[012]
    # TODO do zrobienia walidacja na limit znakow
    # def test_edit_complex_with_negative_minmax_charaters(self):

    # TC[013]
    def test_edit_building_cancel(self):
        """Test cancel editing building"""
        # Click last building edit button
        self.construction_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit building
        # self.assertTrue(self.construction_page.check_add_modal_title())
        # Check that save / cancel button present
        self.assertTrue(self.construction_page.is_save_button_present())
        self.assertTrue(self.construction_page.is_cancel_button_present())
        self.construction_page.cancel_button_click()
        self.assertFalse(self.construction_page.is_edit_modal_displayed())

    # TC[014]
    # TODO najprawdopodobniej za stara wersja chromedriver -  test nie przechodzi
    def _test_redirect_building_to_floors_page(self):
        # Click last complex redirect click
        self.construction_page.redirect_button_click()
        self.assertTrue(self.construction_page.check_construction_column_title_after_redirect())

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

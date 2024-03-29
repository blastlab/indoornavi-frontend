import unittest
import time
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.constructions.construction_page import ConstructionPage
from pages.base_page import BasePage
from pages.constructions.buildings_page import BuildingsPage
from pages.login_page import LoginPage


class TestBuildingsPage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.login_page_url = LoginPage.login_url
        cls.webdriver = webdriver
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.buildings_page = BuildingsPage(cls.webdriver, 'building')
        # cls.complexes_page = ComplexesPage(cls.webdriver, 'complex')
        # cls.construction_page = ConstructionPage(cls.webdriver, 'building')
        cls.option = 1
        # truncate db & create env before all tests
        cls.buildings_page.truncate_db()
        cls.buildings_page.create_construction_db_env()
        # login before all tests
        cls.page.login_process(cls.option)
        # check the tested page is loaded correctly
        cls.building_page_is_loaded_correctly(cls)

    def building_page_is_loaded_correctly(self):

        """Before - Test that building page has been correctly loaded"""

        assert self.buildings_page.is_redirect_button_clickable()
        self.buildings_page.redirect_button_click()
        assert self.buildings_page.multi_assertion()
        self.test_failed = False

    def setUp(self):
        self.test_failed = True
        self.buildings_page.truncate_db()
        self.buildings_page.create_construction_db_env()
        self.webdriver.refresh()

    def test_02_add_new_building_correctly(self):

        """Test adding new building correctly"""

        self.assertTrue(self.buildings_page.is_add_button_clickable())

        self.buildings_page.add_button_click()
        # TODO Zmienic tytul modala -  Add building / Add new building
        # self.assertTrue(self.buildings_page.check_add_modal_title())
        self.assertTrue(self.buildings_page.is_save_button_present())
        self.assertTrue(self.buildings_page.is_cancel_button_present())
        self.buildings_page.enter_construction_name()
        # TODO sprawdzic ilosc wpisow przed dodaniem
        # self.buildings_page.get_buildings_count()
        self.buildings_page.save_add_new_construction()
        # TODO sprawdzenie ilosci wpisow po dodaniu
        # self.buildings_page.get_buildings_count()
        # TODO sprawdzenie czy toast sie wyswietlil
        # Check that toast is displayed
        self.assertTrue(self.buildings_page.is_new_construction_toast_present())
        # Check that new building is displayed
        self.assertTrue(self.buildings_page.is_new_construction_present())
        # Check that toast disappeared
        self.assertTrue(self.buildings_page.is_construction_toast_disappear())
        # Check that new building has been saved in db
        self.assertEqual(self.buildings_page.if_saved_in_db(), 'TestBuilding')
        self.test_failed = False

    def test_03_add_new_building_negative_empty_input_and_cancel_click(self):

        """Test that building will be added with empty input"""

        # 1.Check adding with empty input
        self.assertTrue(self.buildings_page.is_add_button_clickable())

        self.buildings_page.add_button_click()
        self.buildings_page.save_add_new_construction()
        self.assertEqual(self.buildings_page.error_message_name(), 'Building name is required.')
        self.buildings_page.cancel_add_new_construction()
        self.test_failed = False

    def _test_04_add_new_building_negative_illegal_characters(self):

        """Test that building will be added with illegal characters"""

        self.assertTrue(self.buildings_page.is_add_button_clickable())

        self.buildings_page.add_button_click()
        self.buildings_page.enter_illegal_chars()
        self.buildings_page.save_add_new_construction()
        self.assertEqual(self.buildings_page.error_message_construction_name(), 'Input field contains illegal characters.')
        self.buildings_page.cancel_add_new_construction()
        self.test_failed = False

    def test_05_delete_building_correctly(self):
        """Test that building will be deleted correctly"""

        self.assertTrue(self.buildings_page.is_remove_button_clickable())
        # Click last building remove button
        self.buildings_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.buildings_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.buildings_page.is_yes_button_present())
        self.assertTrue(self.buildings_page.is_no_button_present())
        # TODO sprawdzenie ilosci wpisow przed dodaniem
        # self.buildings_page.get_buildings_count()
        # Click yes - confirm remove building
        self.buildings_page.click_yes_button()
        # self.buildings_page.save_add_new_building()
        # TODO sprawdzenie ilosci wgit pisow po usunieciu
        # self.buildings_page.get_buildings_count()
        # Check that toast is displayed
        self.assertTrue(self.buildings_page.is_remove_construction_toast_present())
        # Check that new building is disappeared
        # self.assertTrue(self.buildings_page.is_removed_building_disappeared())
        # TODO sprawdzenie czy wpis w bazie danych został usunięty ()
        # Check that new building has been saved in db -> now last building name is Test Industry
        self.assertEqual(self.buildings_page.if_saved_in_db(), 'Test Building A')
        self.test_failed = False

    def test_06_delete_building_cancel(self):
        """Test cancel of deleting building """

        self.assertTrue(self.buildings_page.is_remove_button_clickable())
        # Click last building remove button
        self.buildings_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.buildings_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.buildings_page.is_yes_button_present())
        self.assertTrue(self.buildings_page.is_no_button_present())
        self.buildings_page.click_no_button()
        self.assertTrue(self.buildings_page.is_confirm_remove_window_disappear())
        # Check that the confirm remove modal disappeared
        self.test_failed = False

    def test_07_edit_building_correctly(self):
        """Test editing building correctly"""

        self.assertTrue(self.buildings_page.is_edit_button_present())
        self.buildings_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit building
        # self.assertTrue(self.buildings_page.check_add_modal_title())
        self.assertTrue(self.buildings_page.is_save_button_present())
        self.assertTrue(self.buildings_page.is_cancel_button_present())
        # TODO Check that the chosen element contains the same name
        self.buildings_page.enter_edit_construction_name()
        # Save click
        self.buildings_page.save_edit_click()
        # Check that toast is displayed
        self.assertTrue(self.buildings_page.is_edit_construction_toast_present())
        # Check that toast is disappeared
        self.assertTrue(self.buildings_page.is_edit_construction_toast_disappear())
        # Check that new building is displayed
        self.assertTrue(self.buildings_page.is_edited_construction_present())
        # Check that new building has been saved in db
        self.assertEqual(self.buildings_page.if_saved_in_db(), 'TestEditBuilding')
        self.test_failed = False

    def test_08_edit_building_negative_empty_input(self):
        """Test editing building with empty input"""

        self.assertTrue(self.buildings_page.is_edit_button_present())
        self.buildings_page.edit_button_click()
        self.buildings_page.clear_edit_input()
        self.buildings_page.save_edit_click()
        self.assertEqual(self.buildings_page.error_message_name(), 'Building name is required.')
        self.buildings_page.cancel_button_click()
        self.test_failed = False

    def test_09_edit_building_cancel(self):
        """Test cancel editing building"""

        self.assertTrue(self.buildings_page.is_edit_button_present())
        # Click last building edit button
        self.buildings_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit building
        # self.assertTrue(self.buildings_page.check_add_modal_title())
        # Check that save / cancel button present
        self.assertTrue(self.buildings_page.is_save_button_present())
        self.assertTrue(self.buildings_page.is_cancel_button_present())
        self.buildings_page.cancel_button_click()
        self.assertFalse(self.buildings_page.is_edit_modal_displayed())
        self.test_failed = False

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

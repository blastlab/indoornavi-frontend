import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.constructions.test_base import TestBase
from pages.constructions.construction_page import ConstructionPage
from pages.base_page import BasePage
from pages.constructions.complexes_page import ComplexesPage
from pages.login_page import LoginPage

class TestComplexesPage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.webdriver = webdriver
        cls.login_page_url = LoginPage.login_url
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.base_page = BasePage(cls.webdriver)
        cls.complexes_page = ComplexesPage(cls.webdriver)
        cls.construction_page = ConstructionPage(cls.webdriver, 'complex')
        cls.option = 1
        # login before each test case
        cls.base_page.truncate_db()
        cls.construction_page.create_construction_db_env()
        cls.page.login_process(cls.option)

    def _test_complexes_page_is_loaded_correctly(self):
        """Test that complexes page has been correctly loaded"""
        self.assertTrue(TestBase.multi_assertion(self))

    # TC[001]
    def test_add_new_complex_correctly(self):
        """Test adding new complex correctly"""

        self.assertTrue(TestBase.multi_assertion(self))
        self.complexes_page.add_button_click()
        # TODO Zmienic tytul modala -  Add complex / Add new complex
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        self.assertTrue(self.construction_page.is_save_button_present())
        self.assertTrue(self.construction_page.is_cancel_button_present())
        self.construction_page.enter_construction_name()
        self.construction_page.save_add_new_construction()

        # Check that toast is displayed
        self.assertTrue(self.construction_page.is_new_construction_toast_present())
        # Check that new complex is displayed
        self.assertTrue(self.construction_page.is_new_construction_present())
        # Check that toast disappeared
        self.assertTrue(self.construction_page.is_construction_toast_disappear())
        # Check that new complex has been saved in db
        self.assertEqual(self.construction_page.if_saved_in_db(), 'TestComplex')
        self.test_failed = False

    # TC[002]
    def test_add_new_complex_negative_empty_input_and_cancel_click(self):
        """Test adding new complex with empty input"""

        self.complexes_page.add_button_click()
        self.construction_page.save_add_new_construction()
        self.assertEqual(self.construction_page.error_message_name(), 'Complex name is required.')
        self.construction_page.cancel_add_new_construction()
        self.test_failed = False

    # TODO do zrobienia walidacja na niedozwolone znaki
    # TC[003]
    # def test_add_new_complex_negative_illegal_characters(self):
    #     self.complexes_page.add_button_click()
    #     self.complexes_page.enter_illegal_chars()
    #     self.complexes_page.save_add_new_complex()
    #     self.assertEqual(self.complexes_page.error_message_complex_name(), 'Input field contains illegal characters.')
    #     self.complexes_page.cancel_add_new_complex()

    # TC[004]
    # TODO do zrobienia walidacja na limit znakow
    # def test_add_complex_with_negative_minmax_charaters(self):

    # TC[005]
    def test_delete_complex_correctly(self):
        """Test deleting complex correctly"""

        # Click last complex remove button
        self.construction_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.construction_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.construction_page.is_yes_button_present())
        self.assertTrue(self.construction_page.is_no_button_present())
        self.construction_page.click_yes_button()

        # Check that toast is displayed
        self.assertTrue(self.construction_page.is_remove_construction_toast_present())
        # Check that new complex is disappeared
        # self.assertTrue(self.complexes_page.is_removed_complex_disappeared())

        # Check that new complex has been saved in db -> now last complex name is Test Industry
        self.assertEqual(self.construction_page.if_saved_in_db(), 'Test Industry')
        self.test_failed = False

    # TC[006]
    def test_delete_complex_cancel(self):
        """Test canceling delete complex """
        # Click last complex remove button
        self.construction_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.construction_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.construction_page.is_yes_button_present())
        self.assertTrue(self.construction_page.is_no_button_present())
        self.construction_page.click_no_button()
        self.assertFalse(self.construction_page.is_confirm_remove_window_displayed())
        # Check that the confirm remove modal disappeared
        self.test_failed = False

    # TC[007]
    # TODO Jesli uzytkownik kliknie poza modal, okno sie zamyka
    def _test_delete_complex_click_outside_modal(self):
        print('TEST - DELETE - Resignation - outside modal click')

    # TC[008]
    def test_edit_complex_correctly(self):
        """Test editing complex correctly"""
        self.construction_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit complex
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        self.assertTrue(self.construction_page.is_save_button_present())
        self.assertTrue(self.construction_page.is_cancel_button_present())
        # TODO Check that the chosen element contains the same name
        self.construction_page.enter_edit_construction_name()
        # Save click
        self.construction_page.save_edit_click()
        # Check that toast is displayed
        self.assertTrue(self.construction_page.is_edit_construction_toast_present())
        # Check that new complex is displayed
        self.assertTrue(self.construction_page.is_edited_construction_present())
        # Check that new complex has been saved in db
        self.assertEqual(self.construction_page.if_saved_in_db(), 'TestEditComplex')
        self.test_failed = False

    # TC[009] TODO dokonczyc test
    def test_edit_complex_negative_empty_input(self):
        """Test editing complex when input is empty"""

        self.construction_page.edit_button_click()
        self.construction_page.clear_edit_input()
        self.construction_page.save_edit_click()
        self.assertEqual(self.construction_page.error_message_name(), 'Complex name is required.')
        self.test_failed = False

    # TC[012]
    # TODO do zrobienia walidacja na limit znakow
    # def test_edit_complex_with_negative_minmax_charaters(self):

    # TC[013]
    def test_edit_complex_cancel(self):
        """Test canceling edit complex"""
        # Click last complex edit button
        self.construction_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit complex
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        # Check that save / cancel button present
        self.assertTrue(self.construction_page.is_save_button_present())
        self.assertTrue(self.construction_page.is_cancel_button_present())
        self.construction_page.cancel_button_click()
        self.assertFalse(self.construction_page.is_edit_modal_displayed())
        self.test_failed = False

    # TC[014]
    # TODO najprawdopodobniej za stara wersja chromedriver -  test nie przechodzi
        # Check that save / cancel button present        self.assertTrue(self.complexes_page.is_save_button_present())
        # self.assertTrue(self.complexes_page.is_cancel_button_present())
        # self.complexes_page.cancel_button_click()
        # self.assertFalse(self.complexes_page.is_edit_modal_displayed())
    def _test_redirect_complex_to_buildings_page(self):
        # Click last complex redirect click
        self.complexes_page.redirect_button_click()
        # header = self.complexes_page.buildings_table_header
        # self.assertTrue(self.complexes_page.check_construction_column_title(header))

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

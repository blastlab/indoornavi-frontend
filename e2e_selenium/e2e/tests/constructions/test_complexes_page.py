import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
# from tests.constructions.test_base import TestBase
from pages.constructions.complexes_page import ConstructionPage
# from pages.complexes_page import BasePage
from pages.constructions.complexes_page import ComplexesPage
from pages.login_page import LoginPage


class TestComplexesPage(unittest.TestCase, ComplexesPage):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.webdriver = webdriver
        cls.login_page_url = LoginPage.login_url
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.complexes_page = ComplexesPage(cls.webdriver, 'complex')
        cls.option = 1
        # truncate db & create env before all tests
        cls.complexes_page.truncate_db()
        cls.complexes_page.create_construction_db_env()
        # login before all tests
        cls.page.login_process(cls.option)
        # check the tested page is loaded correctly
        cls.webdriver.get(cls.base_url+'/complexes')
        cls.complexes_page_is_loaded_correctly(cls)

    def complexes_page_is_loaded_correctly(self):

        """Before - Test that complexes page has been correctly loaded"""

        assert (self.complexes_page.multi_assertion())

    def setUp(self):
        self.test_failed = True
        self.complexes_page.truncate_db()
        self.complexes_page.create_construction_db_env()
        self.webdriver.refresh()

    def test_01_add_new_complex_correctly(self):

        """Test adding new complex correctly"""

        self.assertTrue(self.complexes_page.is_add_button_present())
        self.complexes_page.add_button_click()
        # TODO Zmienic tytul modala -  Add complex / Add new complex
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        self.assertTrue(self.complexes_page.is_save_button_present())
        self.assertTrue(self.complexes_page.is_cancel_button_present())
        self.complexes_page.enter_construction_name()
        self.complexes_page.save_add_new_construction()

        # Check that toast is displayed
        self.assertTrue(self.complexes_page.is_new_construction_toast_present())
        # Check that new complex is displayed
        self.assertTrue(self.complexes_page.is_new_construction_present())
        # Check that toast disappeared
        self.assertTrue(self.complexes_page.is_construction_toast_disappear())
        # Check that new complex has been saved in db
        self.assertEqual(self.complexes_page.if_saved_in_db(), 'TestComplex')
        self.test_failed = False

    def test_02_add_new_complex_negative_empty_input_and_cancel_click(self):

        """Test adding new complex with empty input"""

        self.assertTrue(self.complexes_page.is_add_button_present())
        self.complexes_page.add_button_click()
        self.complexes_page.save_add_new_construction()
        self.assertEqual(self.complexes_page.error_message_name(), 'Complex name is required.')
        self.complexes_page.cancel_add_new_construction()
        self.test_failed = False

    def _test_03_delete_complex_correctly(self):

        """Test deleting complex correctly"""

        self.assertTrue(self.complexes_page.is_remove_button_clickable())
        # Click last complex remove button
        self.complexes_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.complexes_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.complexes_page.is_yes_button_present())
        self.assertTrue(self.complexes_page.is_no_button_present())
        self.complexes_page.click_yes_button()

        # Check that toast is displayed
        self.assertTrue(self.complexes_page.is_remove_construction_toast_present())
        # Check that toast is displayed
        self.assertTrue(self.complexes_page.is_remove_construction_toast_disappear())

        # Check that new complex is disappeared
        # self.assertTrue(self.complexes_page.is_removed_complex_disappeared())

        # Check that new complex has been saved in db -> now last complex name is Test Industry
        self.assertEqual(self.complexes_page.if_saved_in_db(), 'Test Mall')
        self.test_failed = False

    def test_04_delete_complex_cancel(self):

        """Test canceling delete complex """

        self.assertTrue(self.complexes_page.is_remove_button_clickable())
        # Click last complex remove button
        self.complexes_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.complexes_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.complexes_page.is_yes_button_present())
        self.assertTrue(self.complexes_page.is_no_button_present())
        self.complexes_page.click_no_button()
        self.assertTrue(self.complexes_page.is_confirm_remove_window_disappear())
        # Check that the confirm remove modal disappeared
        self.test_failed = False

    def test_05_edit_complex_correctly(self):

        """Test editing complex correctly"""

        # Check that edit button click is clickable
        self.assertTrue(self.complexes_page.is_edit_button_present())
        # Click edit button
        self.complexes_page.edit_button_click()
        self.assertTrue(self.complexes_page.is_save_button_present())
        self.assertTrue(self.complexes_page.is_cancel_button_present())
        # TODO Check that the chosen element contains the same name
        self.complexes_page.enter_edit_construction_name()
        # Save click
        self.complexes_page.save_edit_click()
        # Check that toast is displayed
        self.assertTrue(self.complexes_page.is_edit_construction_toast_present())
        # Check that toast is disappeared
        self.assertTrue(self.complexes_page.is_edit_construction_toast_disappear())
        # Check that new complex is displayed
        self.assertTrue(self.complexes_page.is_edited_construction_present())
        # Check that new complex has been saved in db
        self.assertEqual(self.complexes_page.if_saved_in_db(), 'TestEditComplex')
        self.test_failed = False

    def test_06_edit_complex_negative_empty_input(self):

        """Test editing complex when input is empty"""

        # Check that edit button click is clickable
        self.assertTrue(self.complexes_page.is_edit_button_present())

        self.complexes_page.edit_button_click()
        self.complexes_page.clear_edit_input()
        self.complexes_page.save_edit_click()
        self.assertEqual(self.complexes_page.error_message_name(), 'Complex name is required.')
        self.complexes_page.cancel_button_click()
        self.test_failed = False

    def test_07_edit_complex_cancel(self):

        """Test canceling edit complex"""

        # Check that edit button click is clickable
        self.assertTrue(self.complexes_page.is_edit_button_present())
        # Click last complex edit button
        self.complexes_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit complex
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        # Check that save / cancel button present
        self.assertTrue(self.complexes_page.is_save_button_present())
        self.assertTrue(self.complexes_page.is_cancel_button_present())
        # self.complexes_page.cancel_button_click()
        # self.assertFalse(self.complexes_page.is_edit_modal_displayed())
        self.test_failed = False

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

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
        cls.complexes_page.truncate_complex_table()
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

    # def test_complexes_page_is_loaded_correctly(self):
    #     self.assertTrue(self.multi_assertion())
    #
    # TC[001]
    def test_add_new_complex_correctly(self):

        self.complexes_page.add_button_click()
        # TODO Zmienic tytul modala -  Add complex / Add new complex
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        self.assertTrue(self.complexes_page.is_save_button_present())
        self.assertTrue(self.complexes_page.is_cancel_button_present())
        self.complexes_page.enter_complex_name()
        # TODO sprawdzic ilosc wpisow przed dodaniem
        # self.complexes_page.get_complexes_count()
        self.complexes_page.save_add_new_complex()
        # TODO sprawdzenie ilosci wpisow po dodaniu
        # self.complexes_page.get_complexes_count()
        # TODO sprawdzenie czy toast sie wyswietlil
        # Check that toast is displayed
        self.assertTrue(self.complexes_page.is_new_complex_toast_present())
        # Check that new complex is displayed
        self.assertTrue(self.complexes_page.is_new_complex_present())
        # Check that toast disappeared
        self.assertTrue(self.complexes_page.is_complex_toast_disappear())
        # Check that new complex has been saved in db
        self.assertEqual(self.complexes_page.if_complex_saved_in_db(), 'TestComplex')

    # TC[002]
    def test_add_new_complex_negative_empty_input(self):
        # 1.Check adding with empty input
        self.complexes_page.add_button_click()
        self.complexes_page.save_add_new_complex()
        self.assertEqual(self.complexes_page.error_message_complex_name(), 'Complex name is required.')
        self.complexes_page.cancel_add_new_complex()

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
        # Click last complex remove button
        self.complexes_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.complexes_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.complexes_page.is_yes_button_present())
        self.assertTrue(self.complexes_page.is_no_button_present())
        # TODO sprawdzenie ilosci wpisow przed dodaniem
        # self.complexes_page.get_complexes_count()
        # Click yes - confirm remove complex
        self.complexes_page.click_yes_button()
        # self.complexes_page.save_add_new_complex()
        # TODO sprawdzenie ilosci wgit pisow po usunieciu
        # self.complexes_page.get_complexes_count()
        # Check that toast is displayed
        self.assertTrue(self.complexes_page.is_remove_complex_toast_present())
        # Check that new complex is disappeared
        # self.assertTrue(self.complexes_page.is_removed_complex_disappeared())
        # TODO sprawdzenie czy wpis w bazie danych został usunięty ()
        # Check that new complex has been saved in db -> now last complex name is Test Industry
        self.assertEqual(self.complexes_page.if_complex_saved_in_db(), 'Test Industry')

    # TC[006]
    def test_delete_complex_cancel(self):
        # Click last complex remove button
        self.complexes_page.remove_button_click()
        # Check that the confirm window present
        self.assertTrue(self.complexes_page.is_confirm_remove_window_present())
        # Check that yes / no button present
        self.assertTrue(self.complexes_page.is_yes_button_present())
        self.assertTrue(self.complexes_page.is_no_button_present())
        self.complexes_page.click_no_button()
        self.assertFalse(self.complexes_page.is_confirm_remove_window_displayed())
        # Check that the confirm remove modal disappeared


    # TC[007]
    # TODO Jesli uzytkownik kliknie poza modal, okno sie zamyka
    def _test_delete_complex_click_outside_modal(self):
        print('TEST - DELETE - Resignation - outside modal click')

    # TC[008]
    def test_edit_complex_correctly(self):
        self.complexes_page.edit_button_click()
        # TODO Zmienic tytul modala -  Edit complex
        # self.assertTrue(self.complexes_page.check_add_modal_title())
        self.assertTrue(self.complexes_page.is_save_button_present())
        self.assertTrue(self.complexes_page.is_cancel_button_present())
        # TODO Check that the chosen element contains the same name
        self.complexes_page.enter_edit_complex_name()
        # Save click
        self.complexes_page.save_edit_complex_click()
        # Check that toast is displayed
        self.assertTrue(self.complexes_page.is_edit_complex_toast_present())
        # Check that new complex is displayed
        self.assertTrue(self.complexes_page.is_edited_complex_present())
        # Check that new complex has been saved in db
        self.assertEqual(self.complexes_page.if_complex_saved_in_db(), 'TestEditComplex')

    # TC[009] TODO dokonczyc test
    def test_edit_complex_correctly_negative_empty_input(self):
        self.complexes_page.edit_button_click()
        self.complexes_page.clear_edit_input()
        self.complexes_page.save_edit_complex_click()
        self.assertEqual(self.complexes_page.error_message_complex_name(), 'Complex name is required.')
        # self.complexes_page.cancel_add_new_complex()

    # TC[010]
    def _test_edit_complex_correctly_negative_empty_input(self):
        print('TEST - Edit complex - negative - empty input')

    # TC[011]
    def _test_edit_complex_correctly_negative_illegal_characters(self):
        print('TEST - Edit complex - negative - illegal characters')

    # TC[012]
    # TODO do zrobienia walidacja na limit znakow
    # def test_edit_complex_with_negative_minmax_charaters(self):

    # TC[013]
    def _test_edit_complex_cancel(self):
        print('TEST - EDIT - Cancel removing complex')

    # TC[014]
    def _test_edit_complex_click_outside_modal(self):
        print('TEST - EDIT - Resignation - outside modal click')

    # TC[015]
    def _test_redirect_complex_to_buildings_page(self):
        print('TEST - REDIRECTING')

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from pages.base_page import BasePage
from locators.locators import BaseLocators
from config import Config

class ConstructionPage(BasePage):

    def __init__(self, driver, module):
        self.driver = driver
        self.base_locators = BaseLocators(module)

    def if_saved_in_db(self):
        return self.if_exist_in_db(self.base_locators.select_construction)

    def create_construction_db_env(self):
        return self.create_db_env(self.base_locators.xml_filename)

    def is_dropdown_button_present(self):
        return True if self.is_element_present(self.base_locators.dropdown_button) else False

    def is_add_button_present(self):
        return True if self.is_element_present(self.base_locators.add_button_construction) else False

    def check_construction_column_title(self):
        return self.check_title_is_correct(self.base_locators.constructions_table_header, *self.base_locators.table_construction_name)

    def check_construction_column_title_after_redirect(self):
        return self.check_title_is_correct(self.base_locators.floors_table_header, *self.base_locators.table_construction_name_redirected)

    def check_if_there_is_any_row(self):
        count = self.count_of_inner_elements(*self.base_locators.table_rows)
        if count == 0:
          try:
            self.identify_element(*self.base_locators.empty_table).text == 'No records founds'
          except NoSuchElementException:
            return False
          return True
        else:
           return True

    def is_redirect_button_present(self):
        return True if self.is_element_present(self.base_locators.redirect_last_btn) else False

    def redirect_button_click(self):
        return self.click_button(*self.base_locators.redirect_last_btn)

    # Add construction
    def add_button_click(self):
        return self.click_button(*self.base_locators.add_button_construction)

    def check_add_modal_title(self):
        string = 'Add new construction'
        return self.check_title_is_correct(string, *self.base_locators.modal_window)

    def is_save_button_present(self):
        return self.is_element_present(self.base_locators.save_button)

    def is_cancel_button_present(self):
        return self.is_element_present(self.base_locators.cancel_button)

    def enter_construction_name(self):
        return self.clear_and_fill_input(self.base_locators.new_construction_name, *self.base_locators.input)

    def enter_illegal_chars(self):
        return self.clear_and_fill_input(self.base_locators.illegal_name, *self.base_locators.input)

    def save_add_new_construction(self):
        return self.click_button(*self.base_locators.save_button)

    def cancel_add_new_construction(self):
        return self.click_button(*self.base_locators.cancel_button)

    def error_message_name(self):
        return self.wait_for_element(self.base_locators.name_warning).text

    def is_warning_error_present(self):
        return self.is_element_present(self.base_locators.name_warning)

    def is_error_message_displayed(self):
        return self.is_element_displayed(*self.base_locators.name_warning)

    def is_new_construction_toast_present(self):
        return True if self.is_element_present(self.base_locators.added_toast) else False

    def is_construction_toast_disappear(self):
        return True if self.is_element_disappear(self.base_locators.added_toast) else False

    def is_new_construction_present(self):
        return True if self.is_element_present(self.base_locators.created_construction_row) else False

    # Remove last construction
    def remove_button_click(self):
        return self.click_button(*self.base_locators.remove_last_construction_btn)

    def wait_for_remove_modal(self):
        return self.wait_for_element(self.base_locators.remove_modal_window)

    def is_confirm_remove_window_present(self):
        return self.is_element_present(self.base_locators.remove_ask)

    def is_confirm_remove_window_displayed(self):
        return self.is_element_displayed(*self.base_locators.remove_ask)

    def is_yes_button_present(self):
        return self.is_element_present(self.base_locators.yes_button)

    def is_no_button_present(self):
        return self.is_element_present(self.base_locators.no_button)

    def click_yes_button(self):
        return self.click_button(*self.base_locators.yes_button)

    def click_no_button(self):
        return self.click_button(*self.base_locators.no_button)

    def is_remove_construction_toast_present(self):
        return True if self.is_element_present(self.base_locators.removed_toast) else False

    def is_removed_construction_disappeared(self):
        return True if self.is_element_disappear(self.base_locators.remove_last_construction_btn) else False

    # Edit last construction
    def edit_button_click(self):
        return self.click_button(*self.base_locators.edit_last_construction_btn)

    def cancel_button_click(self):
        return self.click_button(*self.base_locators.cancel_button)

    def enter_edit_construction_name(self):
        return self.clear_and_fill_input(self.base_locators.edit_construction_name, *self.base_locators.input)

    def is_edit_construction_toast_present(self):
        return True if self.is_element_present(self.base_locators.edited_toast) else False

    def is_edited_construction_present(self):
        return True if self.is_element_present(self.base_locators.edited_construction_row) else False

    def clear_edit_input(self):
        return self.clear_text_input(*self.base_locators.input)

    def save_edit_click(self):
        return self.click_button(*self.base_locators.save_button)

    def is_edit_modal_displayed(self):
        return self.is_element_displayed(*self.base_locators.modal_window)

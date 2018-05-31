from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from pages.base_page import BasePage
from locators.construction_base_locators import ConstructionBaseLocators


class ConstructionPage(BasePage):

    def __init__(self, driver, module_query):
        self.__driver = driver
        self.module_query = module_query
        self.module = self.module_query.title()
        BasePage.__init__(self, self.__driver)
        ConstructionBaseLocators.__init__(self, module_query)

    def if_saved_in_db(self):
        return self.if_exist_in_db(self.select_construction)

    def create_construction_db_env(self):
        return self.create_db_env(self.xml_filename)

    def is_dropdown_button_present(self):
        return True if self.is_element_present(self.dropdown_button) else False

    def is_add_button_present(self):
        return True if self.is_element_present(self.add_button_construction) else False

    def check_construction_column_title(self):
        return self.check_title_is_correct(self.module + ' name', *self.table_construction_name)

    def check_construction_column_title_after_redirect(self):
        return self.check_title_is_correct(self.floors_table_header, *self.table_construction_name_redirected)

    def check_if_there_is_any_row(self):
        table_content = self.wait_for_element(self.table_content)
        count_rows = self.count_of_inner_elements(*self.table_rows)
        if count_rows == 0:
          try:
            self.identify_element(*self.empty_table).text == 'No records founds'
          except NoSuchElementException:
            return False
          return True
        else:
          return True

    def is_redirect_button_clickable(self):
        return True if self.wait_for_element_clickable(self.redirect_last_btn) else False

    def redirect_button_click(self):
        return self.click_button(*self.redirect_last_btn)

    # Add construction
    def is_add_button_clickable(self):
        return True if self.wait_for_element_clickable(self.add_button_construction) else False

    def add_button_click(self):
        return self.click_button(*self.add_button_construction)

    def check_add_modal_title(self):
        string = 'Add new construction'
        return self.check_title_is_correct(string, *self.modal_window)

    def is_save_button_present(self):
        return self.wait_for_element_clickable(self.save_button)

    def is_cancel_button_present(self):
        return self.wait_for_element_clickable(self.cancel_button)

    def enter_construction_name(self):
        return self.clear_and_fill_input(self.new_construction_name, self.input)

    def enter_illegal_chars(self):
        return self.clear_and_fill_input(self.illegal_name, self.input)

    def save_add_new_construction(self):
        return self.click_button(*self.save_button)

    def cancel_add_new_construction(self):
        return self.click_button(*self.cancel_button)

    def error_message_name(self):
        return self.wait_for_element(self.name_warning).text

    def is_warning_error_present(self):
        return self.is_element_present(self.name_warning)

    def is_error_message_displayed(self):
        return self.is_element_displayed(*self.name_warning)

    def is_new_construction_toast_present(self):
        return True if self.is_element_present(self.added_toast) else False

    def is_construction_toast_disappear(self):
        return True if self.is_element_disappear(self.added_toast) else False

    def is_new_construction_present(self):
        return True if self.is_element_present(self.created_construction_row) else False

    # Remove last construction

    def is_remove_button_clickable(self):
        return True if self.wait_for_element_clickable(self.remove_last_construction_btn) else False

    def remove_button_click(self):
        return self.click_button(*self.remove_last_construction_btn)

    def wait_for_remove_modal(self):
        return self.wait_for_element(self.remove_modal_window)

    def is_confirm_remove_window_present(self):
        return self.is_element_present(self.remove_ask)

    def is_confirm_remove_window_disappear(self):
        return self.is_element_disappear(self.remove_ask)

    def is_yes_button_present(self):
        return self.is_element_present(self.yes_button)

    def is_no_button_present(self):
        return self.is_element_present(self.no_button)

    def click_yes_button(self):
        return self.click_button(*self.yes_button)

    def click_no_button(self):
        return self.click_button(*self.no_button)

    def is_remove_construction_toast_present(self):
        return True if self.is_element_present(self.removed_toast) else False

    def is_remove_construction_toast_disappear(self):
        return True if self.is_element_disappear(self.removed_toast) else False

    def is_removed_construction_disappeared(self):
        return True if self.is_element_disappear(self.remove_last_construction_btn) else False

    # Edit last construction

    def is_edit_button_present(self):
        return self.wait_for_element_clickable(self.edit_last_construction_btn)

    def edit_button_click(self):
        return self.click_button(*self.edit_last_construction_btn)

    def cancel_button_click(self):
        return self.click_button(*self.cancel_button)

    def enter_edit_construction_name(self):
        return self.clear_and_fill_input(self.edit_construction_name, self.input)

    def is_edit_construction_toast_present(self):
        return True if self.is_element_present(self.edited_toast) else False

    def is_edit_construction_toast_disappear(self):
        return True if self.is_element_disappear(self.edited_toast) else False

    def is_edited_construction_present(self):
        return True if self.is_element_present(self.edited_construction_row) else False

    def clear_edit_input(self):
        return self.clear_text_input(self.input)

    def save_edit_click(self):
        return self.click_button(*self.save_button)

    def is_edit_modal_displayed(self):
        return self.is_element_displayed(*self.modal_window)

    def multi_assertion(self):
        # create list for all returned True or False

        asserts = []
        dropdown_present = self.is_dropdown_button_present()
        constr_counter = self.check_if_there_is_any_row()

        asserts.append(dropdown_present)
        asserts.append(constr_counter)
        # Check if there is any False in array
        return False if False in asserts else True

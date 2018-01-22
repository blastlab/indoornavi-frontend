from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from selenium.common.exceptions import NoSuchElementException
from config import Config

class ComplexesPage(BasePage):

    login_url = Config.front_hostname+'complexes/'
    complex_table_header = 'Complex name'
    buildings_table_header = 'Building name'
    complex_modal_title = 'Add new complex'
    new_complex_name = 'TestComplex'
    edit_complex_name = 'TestEditComplex'
    illegal_complex_name = '!@#^&$*()*&^@'
    xml_filename = 'src/test-complexes.xml'

    ### LOCATORS
    # Complexes page locators
    complexes_title = (By.CSS_SELECTOR, 'span.ui-menuitem-text')
    # Complexes-list locators
    table_construction_name = (By.XPATH, '//table/thead/tr/th[1]/span')
    complexes_list = (By.CSS_SELECTOR, 'div.ui-datatable')
    table_rows = (By.XPATH, '//p-datatable/div/div[1]/table/tbody/tr')
    empty_table = (By.CSS_SELECTOR, 'td.ui-datatable-emptymessage')
    # Add complex - locators
    modal_window = (By.CLASS_NAME, 'ui-dialog-title')
    table_row = (By.CLASS_NAME, 'ui-datatable-even')
    table_class = (By.CLASS_NAME, 'ui-datatable-data')
    created_complex_row = (By.XPATH, "//span[contains(text(),'TestComplex')]")
    # Remove complex - locators
    close_button = (By.CSS_SELECTOR, 'span.fa-close')
    remove_ask = (By.XPATH, "//span[contains(text(),'Are you sure you want to perform this action?')]")
    yes_button = (By.XPATH, '//button[@ng-reflect-label="Yes"]')
    no_button = (By.XPATH, '//button[@ng-reflect-label="No"]')
    # Edit complex - locators
    edit_last_complex_btn = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:nth-last-child(2)')
    edit_complex_input = (By.CSS_SELECTOR, 'form div div input#name')
    edited_complex_row = (By.XPATH, "//span[contains(text(),'TestEditComplex')]")
    # Redirect complex to buildings page -locator
    redirect_last_complex_btn = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:first-of-type')
    last_complex_row = (By.CSS_SELECTOR, 'tr:last-child > td:nth-child(1) > span')
    # Buttons
    dropdown_button = (By.CSS_SELECTOR, 'button#menu')
    add_button_complex = (By.CSS_SELECTOR, 'button#add-complex')
    save_button = (By.XPATH, '//button[@ng-reflect-label="Save"]')
    cancel_button = (By.XPATH, '//button[@ng-reflect-label="Cancel"]')
    remove_last_complex_btn = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:last-child')
    # Input
    complex_input = (By.CSS_SELECTOR, 'form div div input#name')
    # Warning & Toasts
    complex_removed_toast = (By.XPATH, "//p[contains(text(),'Complex has been removed.')]")
    complex_added_toast = (By.XPATH, "//p[contains(text(),'Complex has been created.')]")
    complex_edited_toast = (By.XPATH, "//p[contains(text(),'Complex has been saved.')]")
    complex_name_warning = (By.CSS_SELECTOR, 'div.ui-messages-error')
    remove_modal_window = (By.CLASS_NAME, 'ui - dialog')
    # Db queries
    # truncate_complex_table = ("TRUNCATE complex")
    select_complexes = ("SELECT name FROM complex ORDER BY id DESC LIMIT 1")

    # Database
    def if_complex_saved_in_db(self):
        return self.if_exist_in_db(self.select_complexes)

    def truncate_complex_table(self):
        return self.truncate_db()

    # Prepare environment
    def create_complex_db_env(self):
        return self.create_db_env(self.xml_filename)

    # Site launch
    def get_add_button_text(self):
        add_button = self.identify_element(*self.add_button_text_locator).text
        return add_button

    def check_page_loaded_correctly(self):
        return self.wait_for_element(self.complexes_title).text

    def is_dropdown_button_present(self):
        return True if self.is_element_present(self.dropdown_button) else False

    def is_add_button_present(self):
        return True if self.is_element_present(self.add_button_complex) else False

    def check_construction_column_title(self, construction_table_header):
        return self.check_title_is_correct(construction_table_header, *self.table_construction_name)

    def check_if_there_is_any_row(self):
        count = self.count_of_inner_elements(*self.table_rows)
        if count == 0:
          try:
            self.identify_element(*self.empty_table).text == 'No records founds'
          except NoSuchElementException:
            return False
          return True
        else:
           return True

    # Add complex
    def add_button_click(self):
        return self.click_button(*self.add_button_complex)

    def check_add_modal_title(self):
        string = 'Add new complex'
        return self.check_title_is_correct(string, *self.modal_window)

    def is_save_button_present(self):
        return self.is_element_present(self.save_button)

    def is_cancel_button_present(self):
        return self.is_element_present(self.cancel_button)

    def enter_complex_name(self):
        return self.clear_and_fill_input(self.new_complex_name, *self.complex_input)

    def enter_illegal_chars(self):
        return self.clear_and_fill_input(self.illegal_complex_name, *self.complex_input)

    def save_add_new_complex(self):
        return self.click_button(*self.save_button)

    def cancel_add_new_complex(self):
        return self.click_button(*self.cancel_button)

    def error_message_complex_name(self):
        return self.wait_for_element(self.complex_name_warning).text

    def is_warning_error_present(self):
        return self.is_element_present(self.complex_name_warning)

    def is_error_message_displayed(self):
        return self.is_element_displayed(*self.complex_name_warning)

    def is_new_complex_toast_present(self):
        return True if self.is_element_present(self.complex_added_toast) else False

    def is_complex_toast_disappear(self):
        return True if self.is_element_disappear(self.complex_added_toast) else False

    def is_new_complex_present(self):
        return True if self.is_element_present(self.created_complex_row) else False

    # Remove last complex
    def remove_button_click(self):
        return self.click_button(*self.remove_last_complex_btn)

    def wait_for_remove_modal(self):
        return self.wait_for_element(self.remove_modal_window)

    def is_confirm_remove_window_present(self):
        return self.is_element_present(self.remove_ask)

    def is_confirm_remove_window_displayed(self):
        return self.is_element_displayed(*self.remove_ask)

    def is_yes_button_present(self):
        return self.is_element_present(self.yes_button)

    def is_no_button_present(self):
        return self.is_element_present(self.no_button)

    def click_yes_button(self):
        return self.click_button(*self.yes_button)

    def click_no_button(self):
        return self.click_button(*self.no_button)

    def is_remove_complex_toast_present(self):
        return True if self.is_element_present(self.complex_removed_toast) else False

    def is_removed_complex_disappeared(self):
        return True if self.is_element_disappear(self.remove_last_complex_btn) else False

    # Edit last complex
    def edit_button_click(self):
        return self.click_button(*self.edit_last_complex_btn)

    def cancel_button_click(self):
        return self.click_button(*self.cancel_button)

    def enter_edit_complex_name(self):
        return self.clear_and_fill_input(self.edit_complex_name, *self.complex_input)

    def is_edit_complex_toast_present(self):
        return True if self.is_element_present(self.complex_edited_toast) else False

    def is_edited_complex_present(self):
        return True if self.is_element_present(self.edited_complex_row) else False

    def clear_edit_input(self):
        return self.clear_text_input(*self.complex_input)

    def save_edit_complex_click(self):
        return self.click_button(*self.save_button)

    def is_edit_modal_displayed(self):
        return self.is_element_displayed(*self.modal_window)

    # Redirect to buildings page
    def redirect_button_click(self):
        return self.click_button(*self.redirect_last_complex_btn)





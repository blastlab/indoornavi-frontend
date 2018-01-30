from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from pages.base_page import BasePage
from locators.devices_base_locators import DevicesBaseLocators
from config import Config

class DevicesPage(BasePage):

    def __init__(self, driver, module_query):
        self.driver = driver
        self.module_query = module_query
        self.module = self.module_query.title()
        self.base_locators = DevicesBaseLocators(module_query)

    # Database preparing methods
    def create_devices_db_env(self):
        return self.create_db_env(self.base_locators.xml_filename)

    # Devices - Preparing methods
    def dropdown_menu_click(self):
        return self.click_button(*self.base_locators.dropdown_button)

    def dropdown_menu_device_click(self):
        return self.click_button(*self.base_locators.dropdown_menu_device_button)

    def is_dropdown_menu_device_visible(self):
        return self.wait_for_element_visibility(self.base_locators.dropdown_menu_device_button)

    def is_dropdown_button_present(self):
        return True if self.is_element_present(self.base_locators.dropdown_button) else False

    def is_add_button_present(self):
        return True if self.is_element_present(self.base_locators.add_button_device) else False

    def check_device_page_title(self):
        return True if self.is_element_present(self.base_locators.page_device_title) else False

    def is_devices_table_displayed(self):
        return True if self.is_element_displayed(*self.base_locators.devices_table) else False

    # Devices - Adding methods
    def add_button_click(self):
        return self.click_button(*self.base_locators.add_button_device)

    def is_save_button_present(self):
        return self.is_element_present(self.base_locators.save_button)

    def is_cancel_button_present(self):
        return self.is_element_present(self.base_locators.cancel_button)

    def enter_new_device_name(self):
        return self.clear_and_fill_input(self.base_locators.new_device_name, *self.base_locators.input)

    def enter_new_correct_short_id(self):
        return self.clear_and_fill_input(self.base_locators.new_device_short_id, *self.base_locators.short_id_input)

    def enter_new_correct_long_id(self):
        return self.clear_and_fill_input(self.base_locators.new_device_long_id, *self.base_locators.long_id_input)

    def save_add_new_device_click(self):
        return self.click_button(*self.base_locators.save_button)

    def if_new_device_is_displayed(self):
        # Expected properties
        expect_short_id = 'Short Id: ' + self.base_locators.new_device_short_id
        expect_long_id = 'Long Id: ' + self.base_locators.new_device_long_id
        expect_device_name = 'Device Name: ' + self.base_locators.new_device_name
        # Result properties
        result_short_id = self.get_text(self.base_locators.last_row_short_id)
        result_long_id = self.get_text(self.base_locators.last_row_long_id)
        result_device_name = self.get_text(self.base_locators.last_row_device_name)
        # Comparison
        return True if(expect_short_id == result_short_id) and (expect_long_id == result_long_id) and (expect_device_name == result_device_name) else False

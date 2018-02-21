from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
import re
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
from pages.base_page import BasePage
from locators.devices_base_locators import DevicesBaseLocators
from config import Config

class DevicesPage(BasePage):

    def __init__(self, driver, module_query):
        self.driver = driver
        self.module_query = module_query
        self.module = self.module_query.title()
        self.base_locators = DevicesBaseLocators(module_query)

    # Database preparing methods & queries
    def create_devices_db_env(self):
        return self.create_db_env(self.base_locators.xml_filename)

    def if_saved_in_db(self):
        return self.if_exist_in_db(self.base_locators.select_device)

    # Devices - Preparing methods
    def dropdown_menu_click(self):
        return self.click_button(*self.base_locators.dropdown_button)

    def dropdown_menu_device_click(self):
        return self.click_button(*self.base_locators.dropdown_menu_device_button)

    # Clickable elements
    def is_add_device_button_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.add_button_device)

    def is_dropdown_menu_device_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.dropdown_menu_device_button)

    def is_delete_device_button_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.delete_button_device)

    def is_yes_delete_button_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.yes_delete_button_device)

    def is_no_delete_button_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.no_delete_button_device)

    def is_search_not_verified_input_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.search_not_verified_input)

    def is_search_verified_input_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.search_verified_input)

    # Visible & Present Elements
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

    # Warning & Toasts
    def error_message_name(self):
        return self.wait_for_element(self.base_locators.name_warning).text

    def is_toast_present(self, toast):
        return True if self.is_element_present(toast) else False

    def is_toast_disappear(self, toast):
        return True if self.is_element_disappear(toast) else False

    # Devices Adding - Test methods
    def add_button_click(self):
        return self.click_button(*self.base_locators.add_button_device)

    def is_save_button_present(self):
        return self.wait_for_element_clickable(self.base_locators.save_button)

    def is_cancel_button_present(self):
        return self.wait_for_element_clickable(self.base_locators.cancel_button)

    def enter_name(self, name):
        input_element = self.identify_element(*self.base_locators.input)
        input_element.send_keys(name)

    def is_input_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.input)

    def enter_device_name(self, name):
        return self.clear_and_fill_input(name, *self.base_locators.input)

    def clear_short_id_input(self):
        return self.clear_text_input(*self.base_locators.short_id_input)

    def clear_long_id_input(self):
        return self.clear_text_input(*self.base_locators.long_id_input)

    def clear_device_name_input(self):
        return self.clear_text_input(*self.base_locators.input)

    def enter_short_id(self, short_id):
        return self.clear_and_fill_input(short_id, *self.base_locators.short_id_input)

    def enter_long_id(self, long_id):
        return self.clear_and_fill_input(long_id, *self.base_locators.long_id_input)

    def save_add_device_click(self):
        return self.click_button(*self.base_locators.save_button)

    def cancel_add_new_device_click(self):
        return self.click_button(*self.base_locators.cancel_button)

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

    def if_edited_device_is_displayed(self):
        expect_device_name = 'Device Name: ' + self.base_locators.edit_device_name
        result_device_name = self.get_text(self.base_locators.last_row_device_name)
        return True if (expect_device_name == result_device_name) else False

    # Devices Editing - Test methods
    def is_edit_device_button_clickable(self):
        return self.wait_for_element_clickable(self.base_locators.edit_button_device)

    def edit_button_click(self):
        return self.click_button(*self.base_locators.edit_button_device)

    # Devices Deleting - Test methods
    def delete_button_click(self):
        return self.click_button(*self.base_locators.delete_button_device)

    def click_yes_button(self):
        return self.click_button(*self.base_locators.yes_delete_button_device)

    def click_no_button(self):
        return self.click_button(*self.base_locators.no_delete_button_device)

    def is_confirm_remove_window_present(self):
        return True if self.is_element_present(self.base_locators.remove_ask) else False

    def is_confirm_remove_window_disappeared(self):
        return True if self.is_element_disappear(self.base_locators.remove_ask) else False

    def is_remove_device_toast_present(self):
        return True if self.is_element_present(self.base_locators.removed_toast) else False

    def is_remove_device_toast_disappeared(self):
        return True if self.is_element_disappear(self.base_locators.removed_toast) else False

    # Devices Searching -  Test methods
    # 1. for each row find short id
    # 2. In the same loop with founded short id send keys to input &
    #    check is there only this row &
    #    second one should be invisible
    #find elements
    #write text into input
    #

    def find_not_verified_devices(self):
        """
        :return:
          array of visible web elements
        """
        visible_devices_array = []
        table = self.identify_element(*self.base_locators.picklist_wrapper_not_verified)
        tablet = self.identify_element(*self.base_locators.picklist_wrapper_verified)
        rows = table.find_elements(*self.base_locators.not_verified_device_table_item)

        print(table)
        print(tablet)

        for row in rows:
            row_short_id = row.find_element(*self.base_locators.not_verified_device_table_item_text)
            visible_devices_array.append(row_short_id)

        return visible_devices_array

    def search_element_by_short_id(self, elements_array):
        """
        For each web element (device row) get & return short_id
        :param
          element_array - array of visible web elements
        :return:
          element_short_ids  - array of passed params
        """
        element_short_ids = []
        for element in elements_array:
            element_short_id_text = element.text
            element_short_ids.append(element_short_id_text)
        return element_short_ids

    def insert_into_search_device_input(self, short_id):
        """
        Passed param insert into search device input
        :param
          short_id - string which will be inserted to input
        :return:
          function which insert passed argument to search input
        """
        filtered_num = re.findall('\d+', short_id)[0]
        self.clear_and_fill_input(filtered_num, *self.base_locators.search_not_verified_input)

    def is_there_only_founded_device_row(self):
        return self.count_of_visible_elements(*self.base_locators.not_verified_device_table_item)
    # Change Verify - Test methods

    def is_element_displayed_on_verified_list(self):
        self.wait_for_element_clickable(self.base_locators.move_all_to_verify_button)
        self.click_button(*self.base_locators.move_all_to_verify_button)
        print('is_element_displayed_on_verified_list')

    def is_element_displayed_on_not_verified_list(self):
        print('is_element_displayed_on_not_verified_list')

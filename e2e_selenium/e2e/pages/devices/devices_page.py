from pages.base_page import BasePage
from locators.devices_base_locators import DevicesBaseLocators


class DevicesPage(BasePage, DevicesBaseLocators):

    def __init__(self, driver, module_query):
        self.__driver = driver
        self.module_query = module_query
        self.module = self.module_query.title()
        BasePage.__init__(self, self.__driver)
        DevicesBaseLocators.__init__(self, module_query)

    # Database preparing methods & queries
    def create_devices_db_env(self):
        return self.create_db_env(self.xml_filename)

    def if_saved_in_db(self):
        return self.if_exist_in_db(self.select_device)

    # Devices - Preparing methods
    def dropdown_menu_click(self):
        return self.click_button(*self.dropdown_button)

    def dropdown_menu_device_click(self):
        return self.click_button(*self.dropdown_menu_device_button)

    # Clickable elements
    def is_add_device_button_clickable(self):
        return self.wait_for_element_clickable(self.add_button_device)

    def is_dropdown_menu_device_clickable(self):
        return self.wait_for_element_clickable(self.dropdown_menu_device_button)

    def is_delete_device_button_clickable(self):
        return self.wait_for_element_clickable(self.delete_button_device)

    def is_yes_delete_button_clickable(self):
        return self.wait_for_element_clickable(self.yes_delete_button_device)

    def is_no_delete_button_clickable(self):
        return self.wait_for_element_clickable(self.no_delete_button_device)

    def is_search_not_verified_input_clickable(self):
        return self.wait_for_element_clickable(self.search_not_verified_input)

    def is_search_verified_input_clickable(self):
        return self.wait_for_element_clickable(self.search_verified_input)

    def is_move_button_clickable(self, locator):

        choices = {
          'all_verified': self.move_all_to_verify_button,
          'all_not_verified': self.move_all_to_not_verify_button,
          'single_verified': self.move_to_verify_button,
          'single_not_verified': self.move_to_not_verify_button
        }
        return self.wait_for_element_clickable(choices.get(locator, 'all_verified'))

    # Visible & Present Elements
    def is_dropdown_menu_device_visible(self):
        return self.wait_for_element_visibility(self.dropdown_menu_device_button)

    def is_dropdown_button_present(self):
        return True if self.is_element_present(self.dropdown_button) else False

    def is_add_button_present(self):
        return True if self.is_element_present(self.add_button_device) else False

    def check_device_page_title(self):
        return True if self.is_element_present(self.page_device_title) else False

    def is_devices_table_displayed(self):
        return True if self.is_element_displayed(*self.devices_table) else False

    # Warning & Toasts
    def error_message_name(self):
        return self.wait_for_element(self.name_warning).text

    def is_toast_present(self, toast):
        return True if self.is_element_present(toast) else False

    def is_toast_disappear(self, toast):
        return True if self.is_element_disappear(toast) else False

    # Devices Adding - Test methods
    def add_button_click(self):
        return self.click_button(*self.add_button_device)

    def is_save_button_present(self):
        return self.wait_for_element_clickable(self.save_button)

    def is_cancel_button_present(self):
        return self.wait_for_element_clickable(self.cancel_button)

    def enter_name(self, name):
        input_element = self.identify_element(*self.input)
        input_element.send_keys(name)

    def is_input_clickable(self):
        return self.wait_for_element_clickable(self.input)

    def enter_device_name(self, name):
        return self.clear_and_fill_input(name, self.input)

    def clear_short_id_input(self):
        return self.clear_text_input(self.short_id_input)

    def clear_long_id_input(self):
        return self.clear_text_input(self.long_id_input)

    def clear_device_name_input(self):
        return self.clear_text_input(self.input)

    def enter_short_id(self, short_id):
        return self.clear_and_fill_input(short_id, self.short_id_input)

    def enter_long_id(self, long_id):
        return self.clear_and_fill_input(long_id, self.long_id_input)

    def save_add_device_click(self):
        return self.click_button(*self.save_button)

    def cancel_add_new_device_click(self):
        return self.click_button(*self.cancel_button)

    def if_new_device_is_displayed(self):
        # Expected properties
        expect_short_id = 'Short Id: ' + self.new_device_short_id
        expect_long_id = 'Long Id: ' + self.new_device_long_id
        expect_device_name = 'Device Name: ' + self.new_device_name
        # Result properties
        result_short_id = self.get_text(self.last_row_short_id)
        result_long_id = self.get_text(self.last_row_long_id)
        result_device_name = self.get_text(self.last_row_device_name)
        # Comparison
        return True if(expect_short_id == result_short_id) and (expect_long_id == result_long_id) and (expect_device_name == result_device_name) else False

    def if_edited_device_is_displayed(self):
        expect_device_name = 'Device Name: ' + self.edit_device_name
        result_device_name = self.get_text(self.last_row_device_name)
        return True if (expect_device_name == result_device_name) else False

    # Devices Editing - Test methods
    def is_edit_device_button_clickable(self):
        return self.wait_for_element_clickable(self.edit_button_device)

    def edit_button_click(self):
        return self.click_button(*self.edit_button_device)

    # Devices Deleting - Test methods
    def delete_button_click(self):
        return self.click_button(*self.delete_button_device)

    def click_yes_button(self):
        return self.click_button(*self.yes_delete_button_device)

    def click_no_button(self):
        return self.click_button(*self.no_delete_button_device)

    def is_confirm_remove_window_present(self):
        return True if self.is_element_present(self.remove_ask) else False

    def is_confirm_remove_window_disappeared(self):
        return True if self.is_element_disappear(self.remove_ask) else False

    def is_remove_device_toast_present(self):
        return True if self.is_element_present(self.removed_toast) else False

    def is_remove_device_toast_disappeared(self):
        return True if self.is_element_disappear(self.removed_toast) else False

    # Devices Searching -  Test methods

    def find_devices(self, side):
        """
        :return:
          array of visible web elements
        """
        visible_devices_array = []
        picklist = self.identify_element(*self.devices_table)
        picklist_wrappers = picklist.find_elements(*self.picklist_wrapper)

        not_verified = picklist_wrappers[0]
        verified = picklist_wrappers[1]
        # Choose
        if side == 'not_verified':
            choosen_side = not_verified
        else:
            choosen_side = verified

        devices = choosen_side.find_elements(*self.devices_table_item)

        for device in devices:
            device_short_id = device.find_element(*self.devices_table_item_text)
            visible_devices_array.append(device_short_id)

        return visible_devices_array

    def search_element_by_short_id(self, elements_array):
        """
        For each web element (device row) get & add to array short_id
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

    def insert_into_search_device_input(self, short_id, side):
        """
        Insert passed param into search device input
        :param
          short_id - string which will be inserted to input
          side - string - {'not_verified', 'verified'} to choosing left || right side
          filtered_num - get only digitals from string
        :return:
          function which insert passed argument to search input
        """

        if side == 'not_verified':
            search_input = self.search_not_verified_input
        else:
            search_input = self.search_verified_input

        filtered_num = self.get_numbers_from_string(short_id)[0]
        self.clear_and_fill_input(filtered_num, search_input)

    def is_there_only_founded_device_row(self):
        return self.count_of_visible_elements(*self.devices_table_item)

    # Change Verify - Test methods

    def action_sink_button(self, method, locator):

        locators = {
          'all_verified': self.move_all_to_verify_button,
          'all_not_verified': self.move_all_to_not_verify_button,
          'single_verified': self.move_to_verify_button,
          'single_not_verified': self.move_to_not_verify_button
        }

        if method == 'click':
            return self.click_button(*locators.get(locator))
        else:
            return self.wait_for_element_clickable(locators.get(locator))

    def get_first_sink_row(self, side):

        picklist = self.identify_element(*self.devices_table)
        choise_list = picklist.find_elements(*self.picklist_wrapper)

        not_verified = choise_list[0]
        verified = choise_list[1]
        # Choose
        if side == 'not_verified':
            choosen_side = not_verified
        else:
            choosen_side = verified
        # Get all verified sinks
        devices = choosen_side.find_elements(*self.devices_table_item)
        verified_sink_to_move = devices[0]
        # Get first sink
        return verified_sink_to_move

    # def click_sink_table_item(self, side):
    #     if side == 'not_verified':
    #         return self.click_button(*self.move_all_to_verify_button)
    #     else:
    #         return self.click_button(*self.move_all_to_not_verify_button)

    def simulate_drag_and_drop_jquery(self, source, target):
        driver = self.__driver
        # init jQuery url variable;
        jquery_url = "http://code.jquery.com/jquery-1.11.2.min.js"

        # load jQuery helper
        with open("src/jquery_load_helper.js") as f:
            load_jquery_js = f.read()

        # load drag and drop helper
        with open("src/drag_and_drop_helper.js") as f:
            drag_and_drop_js = f.read()

        # load jQuery
        driver.execute_async_script(load_jquery_js, jquery_url)

        # perform drag&drop
        driver.execute_script(drag_and_drop_js + """var source = arguments[0];
                                                    var target = arguments[1]
                                                    $(source).first().simulateDragDrop({ dropTarget: target});""", source, target)

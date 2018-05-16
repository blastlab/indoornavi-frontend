import unittest, sys
import time
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.devices.test_base import TestBase
from pages.devices.devices_page import DevicesPage
from pages.base_page import BasePage
from pages.login_page import LoginPage
import inspect

class TestDevicesPage(object):

    def method_test_setUp(self, test_method, name, shortId, longId):

        """ Setup method before test adding / editing sink"""

        click_button = self.devices_page.add_button_click
        btn_clickable = self.devices_page.is_add_device_button_clickable

        # Check which method will be tested
        if test_method != 'add':
            btn_clickable = self.devices_page.is_edit_device_button_clickable
            click_button = self.devices_page.edit_button_click

        self.assertTrue(btn_clickable())
        click_button()
        self.assertTrue(self.devices_page.is_save_button_present())
        self.assertTrue(self.devices_page.is_cancel_button_present())
        # Inserting data
        self.assertTrue(self.devices_page.is_input_clickable())

        if name == '':
            self.devices_page.clear_device_name_input()
        else:
            self.devices_page.enter_device_name(name)

        if shortId == '':
            self.devices_page.clear_short_id_input()
        else:
            self.devices_page.enter_short_id(shortId)

        if longId == '':
            self.devices_page.clear_long_id_input()
        else:
            self.devices_page.enter_long_id(longId)

        self.devices_page.save_add_device_click()

    def method_test_move_all_setUp(self, source):

        move_all_target_btn = 'all_verified' if source == 'not_verified' else 'all_not_verified'
        founded_source_devices = 'not_verified' if source == 'not_verified' else 'verified'
        founded_target_devices = 'verified' if source == 'not_verified' else 'not_verified'

        # Check that the move all button is clickable
        self.assertTrue(self.devices_page.action_sink_button('wait_for_clickable', move_all_target_btn))

        # Find all devices from source list & append short_id text to array
        source_list = self.devices_page.find_devices(founded_source_devices)
        expected_array = [x.text for x in source_list]

        # Move all devices to target list & next find & append short_id text to array
        self.devices_page.action_sink_button('click', move_all_target_btn)
        target_list = self.devices_page.find_devices(founded_target_devices)
        result_array = [y.text for y in target_list]

        # Comparison of the table before and after the transfer
        self.assertTrue(expected_array == result_array)

        # Check the toasts are displayed & disappeared
        self.assertTrue(self.devices_page.is_toast_present(self.locator.edited_toast))
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.edited_toast))
        self.test_failed = False

    def method_test_move_single_setUp(self, side):

        move_single_target_btn = 'single_verified' if side == 'verified' else 'single_not_verified'
        founded_source_device = 'not_verified' if side == 'verified' else 'verified'
        founded_target_devices = 'verified' if side == 'verified' else 'not_verified'

        # Wait for clickable button
        self.assertTrue(self.devices_page.action_sink_button('wait_for_clickable', move_single_target_btn))

        first_sink = self.devices_page.get_first_sink_row(founded_source_device)
        expected_web_elements = self.devices_page.find_devices(founded_source_device)
        expected_short_ids = [element.text for element in expected_web_elements]

        # Click first sink row
        first_sink.click()

        # Get color of element
        rgba_color_substr = first_sink.value_of_css_property("background-color")

        # Get array of numbers rgb[]
        substr = self.base_page.get_numbers_from_string(rgba_color_substr)

        # Parse rgb to hex
        color_hex = "#{:02x}{:02x}{:02x}".format(int(substr[0]), int(substr[1]), int(substr[2]))

        # Check the sink is highlighted
        self.assertTrue(color_hex, "#eecc00")

        # Move single sink to unverified list
        self.devices_page.action_sink_button('click', move_single_target_btn)
        result_web_elements = self.devices_page.find_devices(founded_target_devices)
        result_short_ids = [element.text for element in result_web_elements if element.text in expected_short_ids]
        self.assertTrue(len(result_short_ids) == 1)
        self.test_failed = False

    def method_test_search_setUp(self, side):
        search_input = self.locator.search_not_verified_input if side == 'not_verified' else self.locator.search_verified_input
        # Check the search input is clickable
        self.assertTrue(self.devices_page.is_search_not_verified_input_clickable())

        # Check the search input is clickable
        web_elements = self.devices_page.find_devices(side)
        short_ids = self.devices_page.search_element_by_short_id(web_elements)
        # Check that if user search device by short_id there will be displayed one row
        for short_id in short_ids:
            self.devices_page.insert_into_search_device_input(short_id, side)
            self.assertTrue(self.devices_page.is_there_only_founded_device_row() == 1)

        self.devices_page.clear_text_input(search_input)
        self.test_failed = False

    def method_test_drag_and_drop(self, side):

        """Setup method before test drag&drop sinks"""

        # selectors
        ver_table = ".ui-picklist-target"
        ver_table_item = ".ui-picklist-target .ui-picklist-item"
        not_ver_table = ".ui-picklist-source"
        not_ver_table_item = ".ui-picklist-source .ui-picklist-item"

        # prepare variables
        founded_source_device = 'not_verified' if side == 'verified' else 'verified'
        founded_target_devices = 'verified' if side == 'verified' else 'not_verified'

        # choose string passing to the simulation
        source_string = not_ver_table_item if side == 'verified' else ver_table_item
        target_string = ver_table if side == 'verified' else not_ver_table

        first_sink = self.devices_page.get_first_sink_row(founded_source_device)
        expected_web_elements = self.devices_page.find_devices(founded_source_device)
        expected_short_ids = [element.text for element in expected_web_elements]

        # Simulate drag & drop
        self.devices_page.simulate_drag_and_drop_jquery(source_string, target_string)

        # Check the add toast is displayed
        self.assertTrue(self.devices_page.is_toast_present(self.locator.edited_toast))
        # Check the add toast is disappeared
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.edited_toast))

        result_web_elements = self.devices_page.find_devices(founded_target_devices)
        result_short_ids = [element.text for element in result_web_elements if element.text in expected_short_ids]

        self.assertTrue(len(result_short_ids) == 1)
        self.test_failed = False

    def test_01_devices_page_is_loaded_correctly(self):

        """Test that devices page has been correctly loaded"""

        # self.set_function_name(inspect.stack()[0][3]+'sinking')

        self.assertTrue(self.devices_page.is_add_device_button_clickable())
        self.devices_page.dropdown_menu_click()
        self.devices_page.is_dropdown_menu_device_clickable()
        self.devices_page.dropdown_menu_device_click()
        self.assertTrue(TestBase.is_page_loaded_correctly(self))
        self.test_failed = False

    def test_02_add_device_device_correctly(self):

        """Test that device will be added with correct data"""

        self.method_test_setUp('add',
                               'Test'+self.module,
                               self.locator.new_device_short_id,
                               self.locator.new_device_long_id)

        # Check the add toast is displayed
        self.assertTrue(self.devices_page.is_toast_present(self.locator.added_toast))
        # Check the add toast is disappeared
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.added_toast))
        # Check the new device is displayed
        self.assertTrue(self.devices_page.if_new_device_is_displayed())
        # Check the new device saved in db
        self.assertEqual(self.devices_page.if_saved_in_db(), self.locator.new_device_name)
        self.test_failed = False
    #
    def test_03_add_new_device_negative_existing_short_id(self):

        """Test that device will be added with existing Short Id"""

        self.method_test_setUp('add',
                               'Test' + self.module + 'AddNegativeExistingShortId',
                               self.locator.new_device_short_id,
                               '999')

        # Check the "Short Id must be unique"
        self.assertTrue(self.devices_page.is_toast_present(self.locator.unique_short_id_toast))
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.unique_short_id_toast))
        self.test_failed = False

    def test_04_add_new_device_negative_existing_long_id(self):

        """Test that device will be added with existing Long Id"""

        self.method_test_setUp('add',
                               'Test' + self.module + 'AddNegativeExistingLongId',
                               '999',
                               self.locator.new_device_long_id)

        # Check the "Long Id must be unique" warning
        self.assertTrue(self.devices_page.is_toast_present(self.locator.unique_long_id_toast))
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.unique_long_id_toast))
        self.test_failed = False

    def test_05_add_new_device_negative_empty_short_id(self):

        """Test that device will be added with empty Short Id"""

        self.method_test_setUp('add', 'Test' + self.module + 'AddNegativeEmptyShortId', '', '999')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Short Id is required.')
        # Cancel Action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_06_add_new_device_negative_empty_long_id(self):

        """Test that device will be added with empty Long Id"""

        self.method_test_setUp('add', 'Test' + self.module + 'AddNegativeEmptyLongId', '999', '')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Long Id is required.')
        # Cancel Action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False
    #
    #     # TODO - Test od czasu do czasu nie przechodzi, wpisujac nie pelnego stringa np. "TstSink"

    def _test_07_edit_last_device_correctly(self):

        """Test editing device correctly"""

        self.method_test_setUp('edit', 'TestEdit'+self.module, '1234', '12345')

        # Check the add toast is displayed
        self.assertTrue(self.devices_page.is_toast_present(self.locator.edited_toast))
        # Check the add toast is disappeared
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.edited_toast))
        # Check the new device is displayed
        self.assertTrue(self.devices_page.if_edited_device_is_displayed())
        # Check the new device saved in db
        self.assertEqual(self.devices_page.if_saved_in_db(), self.locator.edit_device_name)
        self.test_failed = False

    def test_08_edit_device_negative_empty_short_id(self):

        """Test editing device with empty short id input"""

        self.method_test_setUp('edit', 'TestEdit'+self.module, '', '12345')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Short Id is required.')
        # Cancel action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_09_edit_device_negative_empty_long_id(self):

        """Test editing device with empty long id input"""

        self.method_test_setUp('edit', 'TestEdit'+self.module, '1234', '')

        # Check the "Long Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Long Id is required.')
        # Cancel action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_10_delete_device_cancel(self):

        """Test cancel deleting device"""

        # Check the delete button is clickable
        self.assertTrue(self.devices_page.is_delete_device_button_clickable())
        # Click Delete device
        self.devices_page.delete_button_click()
        # Check is modal displayed
        self.assertTrue(self.devices_page.is_confirm_remove_window_present())
        # Check the yes/no button is clickable
        self.assertTrue(self.devices_page.is_yes_delete_button_clickable())
        self.assertTrue(self.devices_page.is_no_delete_button_clickable())
        # Click confirm deleting
        self.devices_page.click_no_button()
        self.assertTrue(self.devices_page.is_confirm_remove_window_disappeared())
        # Check that the confirm remove modal disappeared
        self.test_failed = False

    def test_11_delete_device_correctly(self):

        """Test deleting device correctly"""

        # Check the delete button is clickable
        self.assertTrue(self.devices_page.is_delete_device_button_clickable())
        # Click Delete device
        self.devices_page.delete_button_click()
        # Check is modal displayed
        self.assertTrue(self.devices_page.is_confirm_remove_window_present())
        # Check the yes/no button is clickable
        self.assertTrue(self.devices_page.is_yes_delete_button_clickable())
        self.assertTrue(self.devices_page.is_no_delete_button_clickable())
        # Click confirm deleting
        self.devices_page.click_yes_button()
        # Check toast & db
        self.assertTrue(self.devices_page.is_remove_device_toast_present())
        self.assertTrue(self.devices_page.is_remove_device_toast_disappeared())
        self.assertTrue(self.devices_page.is_confirm_remove_window_disappeared())
        self.assertEqual(self.devices_page.if_saved_in_db(), '')
        self.test_failed = False

    def test_12_search_devices_not_verified(self):

        """Test searching device by short id in unverified list"""

        # Add 2 additional devices
        self.method_test_setUp('add',
                               'Test'+self.module+'ToSearch 123321',
                               self.locator.new_device_short_id+'321',
                               self.locator.new_device_long_id+'321')

        self.method_test_setUp('add',
                               'Test'+self.module+'ToSearch 123999',
                               self.locator.new_device_short_id+'999',
                               self.locator.new_device_long_id+'999')

        self.method_test_search_setUp('not_verified')

    def test_13_move_all_to_verified_list(self):

        """Test moving all devices to verified list"""

        # pass variable from which list test starts
        self.method_test_move_all_setUp('not_verified')

    def test_14_search_devices_verified(self):

        """Test searching device by short id in verified list"""

        self.method_test_search_setUp('verified')

    def test_15_move_all_to_unverified_list(self):

        """Test moving all devices to unverified list"""

        # pass variable from which list test starts
        self.method_test_move_all_setUp('verified')

    def test_16_move_single_to_verified_list(self):

        """Test moving single device to verified list"""

        self.method_test_move_single_setUp('verified')

    def test_17_move_single_to_unverified_list(self):

        """Test moving single device to unverified list"""

        self.method_test_move_single_setUp('not_verified')

    def test_18_drag_and_drop_to_verified_list(self):

        """Test that moving devices to verified list by drag&drop """

        self.method_test_drag_and_drop('verified')

    def test_19_drag_and_drop_to_unverified_list(self):

        """Test that moving devices to unverified list by drag&drop """

        self.method_test_drag_and_drop('not_verified')



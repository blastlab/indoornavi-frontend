import unittest, sys
import time
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.devices.test_base import TestBase
from pages.devices.devices_page import DevicesPage
from pages.base_page import BasePage
from pages.login_page import LoginPage

class TestSinksPage(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.login_page_url = LoginPage.login_url
        cls.webdriver = webdriver
        TestDriver.setUp(cls, cls.login_page_url)
        cls.base_page = BasePage(cls.webdriver)
        cls.devices_page = DevicesPage(cls.webdriver, 'sink')
        cls.page = LoginPage(cls.webdriver)
        cls.option = 1
        # login before each test case
        cls.base_page.truncate_db()
        # cls.devices_page.create_devices_db_env()
        cls.page.login_process(cls.option)
        # locators
        cls.locator = cls.devices_page.base_locators

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

    def test_01_sinks_page_is_loaded_correctly(self):

        """Test that sinks page has been correctly loaded"""

        self.assertTrue(self.devices_page.is_add_device_button_clickable())
        self.devices_page.dropdown_menu_click()
        self.devices_page.is_dropdown_menu_device_clickable()
        self.devices_page.dropdown_menu_device_click()
        self.assertTrue(TestBase.is_page_loaded_correctly(self))
        self.test_failed = False

    def test_02_add_new_sink_correctly(self):

        """Test that sink will be added with correct data"""

        self.method_test_setUp('add',
                               'TestSink',
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

    def test_03_add_new_sink_negative_existing_short_id(self):

        """Test that sink will be added with existing Short Id"""
        self.method_test_setUp('add',
                               'TestSinkAddNegativeExistingShortId',
                               self.locator.new_device_short_id,
                               '999')

        # Check the "Short Id must be unique"
        self.assertTrue(self.devices_page.is_toast_present(self.locator.unique_short_id_toast))
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.unique_short_id_toast))
        self.test_failed = False

    def test_04_add_new_sink_negative_existing_long_id(self):

        """Test that sink will be added with existing Long Id"""

        self.method_test_setUp('add',
                               'TestSinkAddNegativeExistingLongId',
                               '999',
                               self.locator.new_device_long_id)

        # Check the "Long Id must be unique" warning
        self.assertTrue(self.devices_page.is_toast_present(self.locator.unique_long_id_toast))
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.unique_long_id_toast))
        self.test_failed = False

    def test_05_add_new_sink_negative_empty_short_id(self):

        """Test that sink will be added with empty Short Id"""

        self.method_test_setUp('add', 'TestSinkAddNegativeEmptyShortId', '', '999')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Short Id is required.')
        # Cancel Action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_06_add_new_sink_negative_empty_long_id(self):

        """Test that sink will be added with empty Long Id"""

        self.method_test_setUp('add', 'TestSinkAddNegativeEmptyLongId', '999', '')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Long Id is required.')
        # Cancel Action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_07_edit_last_sink_correctly(self):

        """Test editing sink correctly"""

        self.method_test_setUp('edit', 'TestEditSink', '1234', '12345')

        # Check the add toast is displayed
        self.assertTrue(self.devices_page.is_toast_present(self.locator.edited_toast))
        # Check the add toast is disappeared
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.edited_toast))
        # Check the new device is displayed
        self.assertTrue(self.devices_page.if_edited_device_is_displayed())
        # Check the new device saved in db
        self.assertEqual(self.devices_page.if_saved_in_db(), self.locator.edit_device_name)
        self.test_failed = False

    def test_08_edit_sink_negative_empty_short_id(self):

        """Test editing sink with empty short id input"""

        self.method_test_setUp('edit', 'TestEditSink', '', '12345')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Short Id is required.')
        # Cancel action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_09_edit_sink_negative_empty_long_id(self):

        """Test editing sink with empty long id input"""

        self.method_test_setUp('edit', 'TestEditSink', '1234', '')

        # Check the "Long Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Long Id is required.')
        # Cancel action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_10_delete_sink_cancel(self):

        """Test cancel deleting sink"""

        # Check the delete button is clickable
        self.assertTrue(self.devices_page.is_delete_device_button_clickable())
        # Click Delete sink
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

    def test_11_delete_sink_correctly(self):

        """Test deleting sink correctly"""

        # Check the delete button is clickable
        self.assertTrue(self.devices_page.is_delete_device_button_clickable())
        # Click Delete sink
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

    def test_12_search_by_short_id(self):
        self.assertTrue(self.devices_page.is_add_device_button_clickable())
        self.devices_page.dropdown_menu_click()
        self.devices_page.is_dropdown_menu_device_clickable()
        self.devices_page.dropdown_menu_device_click()
        self.assertTrue(TestBase.is_page_loaded_correctly(self))
        self.test_failed = False

        """Test searching sink by short id"""

        # Check the search input is clickable
        self.assertTrue(self.devices_page.is_search_not_verified_input_clickable())
        # Add 2 additional sinks
        self.method_test_setUp('add',
                               'TestSinkToSearch 123321',
                               self.locator.new_device_short_id+'321',
                               self.locator.new_device_long_id+'321')

        self.method_test_setUp('add',
                               'TestSinkToSearch 123999',
                               self.locator.new_device_short_id+'999',
                               self.locator.new_device_long_id+'999')

        # Check the search input is clickable
        self.assertTrue(self.devices_page.is_search_not_verified_input_clickable())
        web_elements = self.devices_page.find_not_verified_devices()
        short_ids = self.devices_page.search_element_by_short_id(web_elements)

        # Check that if user search device by short_id there will be displayed one row
        for short_id in short_ids:
            self.devices_page.insert_into_search_device_input(short_id)
            self.assertTrue(self.devices_page.is_there_only_founded_device_row() == 1)

    def test_13_move_to_verified_list(self):
        self.assertTrue(self.devices_page.is_add_device_button_clickable())
        self.devices_page.dropdown_menu_click()
        self.devices_page.is_dropdown_menu_device_clickable()
        self.devices_page.dropdown_menu_device_click()
        self.assertTrue(TestBase.is_page_loaded_correctly(self))
        self.test_failed = False

        # Add 2 additional sinks
        self.method_test_setUp('add',
                               'TestSinkToSearch 123321',
                               self.locator.new_device_short_id + '321',
                               self.locator.new_device_long_id + '321')

        self.method_test_setUp('add',
                               'TestSinkToSearch 123999',
                               self.locator.new_device_short_id + '999',
                               self.locator.new_device_long_id + '999')

        # TODO
        self.devices_page.is_element_displayed_on_verified_list()
        time.sleep(3)

    # TODO
    # TODO 1. Wyszukiwanie sinkow +
    # TODO 2. Drag & Drop
    # TODO 3. Przenoszenie pojedynczo
    # TODO 4. Przenoszenie zbiorowe

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

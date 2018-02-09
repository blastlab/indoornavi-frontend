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

    def adding_test_setUp(self, name, shortId, longId):

        """ Setup method before test adding sink"""

        self.assertTrue(self.devices_page.is_add_device_button_clickable())
        self.devices_page.add_button_click()
        self.assertTrue(self.devices_page.is_save_button_present())
        self.assertTrue(self.devices_page.is_cancel_button_present())
        # Inserting data
        self.devices_page.is_input_clickable()
        self.devices_page.enter_new_device_name(name)
        self.devices_page.enter_new_correct_short_id(shortId)
        self.devices_page.enter_new_correct_long_id(longId)
        self.devices_page.save_add_new_device_click()

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

        self.adding_test_setUp('TestSink',
                               self.locator.new_device_short_id,
                               self.locator.new_device_long_id)

        # Check the add toast is displayed
        self.assertTrue(self.devices_page.is_toast_present(self.locator.added_toast))
        # Check the add toast is disappeared
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.added_toast))
        # Check the new device is displayed
        self.assertTrue(self.devices_page.if_new_device_is_displayed())
        # Check the new device saved in db
        self.assertEqual(self.devices_page.if_saved_in_db(), 'TestSink')
        self.test_failed = False

    def test_03_add_new_sink_negative_existing_short_id(self):

        """Test that sink will be added with existing Short Id"""

        self.adding_test_setUp('TestSinkAddNegativeExistingShortId',
                               self.locator.new_device_short_id,
                               '999')

        # Check the "Short Id must be unique"
        self.assertTrue(self.devices_page.is_toast_present(self.locator.unique_short_id_toast))
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.unique_short_id_toast))
        self.test_failed = False

    def test_04_add_new_sink_negative_existing_long_id(self):
        """Test that sink will be added with existing Long Id"""

        self.adding_test_setUp('TestSinkAddNegativeExistingLongId',
                               '999',
                               self.locator.new_device_long_id)

        # Check the "Long Id must be unique" warning
        self.assertTrue(self.devices_page.is_toast_present(self.locator.unique_long_id_toast))
        self.assertTrue(self.devices_page.is_toast_disappear(self.locator.unique_long_id_toast))
        self.test_failed = False

    def test_05_add_new_sink_negative_empty_short_id(self):
        """Test that sink will be added with empty Short Id"""

        self.adding_test_setUp('TestSinkAddNegativeEmptyShortId', '', '999')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Short Id is required.')
        # Cancel Action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def test_06_add_new_sink_negative_empty_long_id(self):
        """Test that sink will be added with empty Long Id"""

        self.adding_test_setUp('TestSinkAddNegativeEmptyLongId', '999', '')

        # Check the "Short Id is required." warning
        self.assertEqual(self.devices_page.error_message_name(), 'Long Id is required.')
        # Cancel Action
        self.devices_page.cancel_add_new_device_click()
        self.test_failed = False

    def _test_07_edit_last_sink_correctly(self):
        """Test editing last sink correctly"""

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

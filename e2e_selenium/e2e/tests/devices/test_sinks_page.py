import unittest
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

    def test_01_sinks_page_is_loaded_correctly(self):
        """Test that sinks page has been correctly loaded"""
        self.devices_page.dropdown_menu_click()
        self.devices_page.is_dropdown_menu_device_visible()
        self.devices_page.dropdown_menu_device_click()
        self.assertTrue(TestBase.is_page_loaded_correctly(self))

    def test_02_add_new_sink_correctly(self):
        """Test that sink will be added with correct data"""
        self.devices_page.add_button_click()
        self.assertTrue(self.devices_page.is_save_button_present())
        self.assertTrue(self.devices_page.is_cancel_button_present())
        self.devices_page.enter_new_device_name()
        self.devices_page.enter_new_correct_short_id()
        self.devices_page.enter_new_correct_long_id()
        self.devices_page.save_add_new_device_click()
        # time.sleep(2)
        # Check that the last row contains correct data
        # expect = self.devices_page.expected_new_device()
        # print(self.devices_page.if_new_device_is_displayed())
        self.assertTrue(self.devices_page.if_new_device_is_displayed())

        # Check the new device saved in db
        self.assertTrue(self.devices_page.if_new_device_is_displayed())
        # print(expect == result)

        # print(self.devices_page.expected_new_device().long_id)
        # print(self.devices_page.expected_new_device().device_name)
        #
        # print(.short_id)
        # print(self.devices_page.is_new_device_added_to_row().long_id)
        # print(self.devices_page.is_new_device_added_to_row().device_name)
        # self.assertTrue(self.devices_page.expected_new_device() == self.devices_page.is_new_device_added_to_row())
        # print(self.devices_page.is_new_device_added_to_row())


    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

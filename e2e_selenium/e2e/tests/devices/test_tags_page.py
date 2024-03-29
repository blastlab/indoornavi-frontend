import unittest, sys
import time
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.devices.test_base import TestBase
from pages.devices.devices_page import DevicesPage
from pages.base_page import BasePage
from pages.login_page import LoginPage
from tests.devices.test_devices_page import TestDevicesPage


class TestTagsPage(unittest.TestCase, TestDevicesPage):

    @classmethod
    def setUpClass(cls):
        cls.module = 'tag'
        cls.test_failed = True
        cls.login_page_url = LoginPage.login_url
        cls.webdriver = webdriver
        TestDriver.setUp(cls, cls.login_page_url)
        cls.devices_page = DevicesPage(cls.webdriver, cls.module)
        cls.page = LoginPage(cls.webdriver)
        cls.option = 1
        # login before each test case
        cls.devices_page.truncate_db()
        # cls.devices_page.create_devices_db_env()
        cls.page.login_process(cls.option)

    def tearDown(self):
        TestDriver.tearDown(self)

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

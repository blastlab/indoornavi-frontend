from selenium import webdriver
from pages.devices.devices_page import DevicesPage

class TestBase:

    def is_page_loaded_correctly(self):
        # create list for all returned True or False
        asserts = []
        # Check Dropdown
        dropdown_present = self.devices_page.is_dropdown_button_present()
        # Check title
        # device_title = self.devices_page.check_device_page_title()
        # # Check Add Button
        add_device_button = self.devices_page.is_add_button_present()
        # # Check Table
        devices_table = self.devices_page.is_devices_table_displayed()

        asserts.append(dropdown_present)
        # asserts.append(device_title)
        asserts.append(add_device_button)
        asserts.append(devices_table)

        # Check if there is any False in array
        return False if False in asserts else True

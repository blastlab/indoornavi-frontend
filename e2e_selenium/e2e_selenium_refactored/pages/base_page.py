import os
import sys
import time
cwd = os.getcwd()
sys.path.append(cwd + '/../components/elements_locators/')
# from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException

class BasePage(object):

    def __init__(self, driver,  base_url='http://localhost:4200/'):
        self.base_url = base_url
        self.driver = driver

    def find_element(self, *locator):
        return self.driver.find_element(*locator)

    def is_element_present(self, *locator):
        try:
            self.driver.find_element(*locator)
        except NoSuchElementException:
            return False
        return True

    def wait_for_element(self, locator):
        element = ui.WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(locator))
        return element

    def open_page(self, page_url):
        return self.driver.get(page_url)

    def clear_and_fill_input(self, text, *input_locator):
        input_element = self.find_element(*input_locator)
        input_element.clear()
        input_element.send_keys(text)

    def click_button(self, *locator):
        button = self.driver.find_element(*locator)
        button.click()

    def test_cases(self, test_cases, number):
        return test_cases[number]





import os
import sys
cwd = os.getcwd()
sys.path.append(cwd + '/../components/elements_locators/')
# from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class BasePage(object):

    def __init__(self, driver,  base_url='http://localhost:4200/'):
        self.base_url = base_url
        self.driver = driver

    def find_element(self, *locator):
        print('find_element')
        return self.driver.find_element(*locator)

    def wait_for_element(self, *locator):
        print('wait dor element')
        return WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(*locator))

    def open_page(self, page_url):
        return self.driver.get(page_url)

    def clear_and_fill_input(self, input_locator, value):
        input_element = self.find_element(*input_locator)
        input_element.clear()
        input_element.sendKeys(value)

    def click_button(self, locator):
        element = self.driver.find_element(*locator)
        element.click()

    def test_cases(self, test_cases, number):
        return test_cases[number]





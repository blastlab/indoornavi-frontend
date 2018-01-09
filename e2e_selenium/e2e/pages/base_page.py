from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
import csv
import mysql.connector
from pyquibase.pyquibase import Pyquibase
from config import Config

class BasePage(object):

    def __init__(self, driver,  base_url=Config.front_hostname):
        self.base_url = base_url
        self.driver = driver

    # Connections
    # Prepare environment
    def create_db_env(self, file_path):

        pyquibase = Pyquibase.mysql(
          host=Config.db_hostname,
          port=3306,
          db_name='Navi',
          username='root',
          password='',
          change_log_file=file_path
        )
        pyquibase.update()

    # Front
    def identify_element(self, *locator):
        return self.driver.find_element(*locator)

    def is_element_present(self, locator):
        try:
          element = self.wait_for_element(locator)
        except NoSuchElementException:
            return False
        return True

    def wait_for_element(self, locator):
        element = ui.WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(locator))
        return element

    def open_page(self, page_url):
        return self.driver.get(page_url)

    def clear_and_fill_input(self, text, *input_locator):
        input_element = self.identify_element(*input_locator)
        input_element.clear()
        input_element.send_keys(text)

    def click_button(self, *locator):
        button = self.driver.find_element(*locator)
        button.click()

    def get_text(self, *locator):
        item_text = self.identify_element(*locator).text
        return item_text

    def check_title_is_correct(self, title, *locator):
        element_text = self.identify_element(*locator).text
        return True if element_text == title else False

    # Methods recommended for : "Constructions"

    def count_of_inner_elements(self, *locator):
        count = self.driver.find_elements(*locator)
        return len(count)

    def if_row_appear_on_list(self, *locator):

        elements = self.driver.find_elements(*locator);
        print(elements)
        element = elements.get(list.size() - 1);
        print(element)



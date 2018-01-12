from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
import csv
import mysql.connector
from pyquibase.pyquibase import Pyquibase

class BasePage(object):

    def __init__(self, driver,  base_url='http://localhost:4200/'):
        self.base_url = base_url
        self.driver = driver

    # Select from db
    def if_exist_in_db(self, query):

        db = mysql.connector.connect(user='root', password='', host='127.0.0.1', database='Navi')
        cursor = db.cursor()
        cursor.execute(query)
        last_complex_name = '';
        for (name) in cursor:
            last_complex_name = name[0]
        print(last_complex_name)
        cursor.close()
        db.close()
        return last_complex_name

    # Truncate db

    def truncate_db(self):

        db = mysql.connector.connect(user='root', password='', host='127.0.0.1', database='Navi')
        cursor = db.cursor()
        cursor.execute('SET FOREIGN_KEY_CHECKS=0;')
        cursor.execute('TRUNCATE complex')
        cursor.execute('SET FOREIGN_KEY_CHECKS=1;')
        cursor.close()
        db.close()

    # Prepare environment
    def create_db_env(self, file_path):

        pyquibase = Pyquibase.mysql(
          host='localhost',
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

    def is_element_displayed(self, *locator):
        element = self.identify_element(*locator)
        displayed = element.is_displayed()
        return displayed

    def is_element_present(self, locator):
        try:
          element = self.wait_for_element(locator)
        except NoSuchElementException:
            return False
        return True

    def is_element_disappear(self, locator):
        try:
          element = self.wait_for_element_disappear(locator)
        except NoSuchElementException:
            return False
        return True

    def wait_for_element(self, locator):
        element = ui.WebDriverWait(self.driver, 10).until(EC.presence_of_element_located(locator))
        return element

    def wait_for_element_disappear(self, locator):
        element = ui.WebDriverWait(self.driver, 10).until_not(EC.presence_of_element_located(locator))
        return element

    def open_page(self, page_url):
        return self.driver.get(page_url)

    def clear_input(self, *input_locator):
        input_element = self.identify_element(*input_locator)
        input_element.clear()

    def clear_text_input(self, *input_locator):
        input_element = self.identify_element(*input_locator)
        length = len(input_element.get_attribute('value'))
        input_element.send_keys(length * Keys.BACKSPACE)

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

    def count_of_elements(self, *locator):
        return len(self.driver.find_elements(*locator))

    def if_row_appear_on_list(self):
        table = self.identify_element(*self.table_class)
        rows = table.find_elements(*self.table_row)
        for row in rows:
            row_text = row.text
            print(row_text)
        last_element = rows[0]
        return last_element

    def sleep_app(self, integer):
        return time.sleep(integer)



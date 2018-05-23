from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
import re
import csv
import mysql.connector
from pyquibase.pyquibase import Pyquibase
from selenium.webdriver import ActionChains


class BasePage(object):

    base_url = 'http://localhost:4200/'
    db_hostname = 'localhost'

    def __init__(self, driver):
        self.driver = driver
        self.actions = ActionChains(driver)

    # Select from db
    def if_exist_in_db(self, query):

        db = mysql.connector.connect(user='root', password='', host=self.db_hostname, database='Navi')
        cursor = db.cursor()
        cursor.execute(query)
        last_construction_name = '';
        for (name) in cursor:
            last_construction_name = name[0]
        cursor.close()
        db.close()
        return last_construction_name

    # Truncate db
    def truncate_db(self):

        db = mysql.connector.connect(user='root', password='', host=self.db_hostname, database='Navi')
        cursor = db.cursor()
        cursor.execute('SET FOREIGN_KEY_CHECKS=0;')
        cursor.execute("TRUNCATE TABLE complex")
        cursor.execute("TRUNCATE TABLE building")
        cursor.execute("TRUNCATE TABLE floor")
        cursor.execute("TRUNCATE TABLE sink")
        cursor.execute("TRUNCATE TABLE anchor")
        cursor.execute("TRUNCATE TABLE tag")
        cursor.execute("TRUNCATE TABLE device")
        cursor.execute('SET FOREIGN_KEY_CHECKS=1;')
        cursor.close()
        db.close()

    def truncate_db_permissions(self):

        db = mysql.connector.connect(user='root', password='', host=self.db_hostname, database='Navi')
        cursor = db.cursor()
        cursor.execute('SET FOREIGN_KEY_CHECKS=0;')
        cursor.execute("TRUNCATE TABLE complex")
        cursor.execute("TRUNCATE TABLE building")
        cursor.execute("TRUNCATE TABLE floor")
        cursor.execute("TRUNCATE TABLE sink")
        cursor.execute("TRUNCATE TABLE anchor")
        cursor.execute("TRUNCATE TABLE tag")
        cursor.execute("TRUNCATE TABLE device")
        cursor.execute("TRUNCATE TABLE permission")
        cursor.execute("TRUNCATE TABLE permissiongroup")
        cursor.execute("TRUNCATE TABLE permissiongroup_permission")
        cursor.execute('SET FOREIGN_KEY_CHECKS=1;')
        cursor.close()
        db.close()

    # Prepare environment
    def create_db_env(self, file_path):
        print('create_db_env')
        db = mysql.connector.connect(user='root', password='', host=self.db_hostname, database='Navi')
        cursor = db.cursor()
        cursor.execute('SET FOREIGN_KEY_CHECKS=0;')
        pyquibase = Pyquibase.mysql(
          host=self.db_hostname,
          port=3306,
          db_name='Navi',
          username='root',
          password='',
          change_log_file=file_path
        )
        pyquibase.update()
        cursor.execute('SET FOREIGN_KEY_CHECKS=1;')
        cursor.close()
        db.close()
        
    def refresh_page(self):
        return self.driver.refresh()

    # Front
    def identify_element(self, *locator):
        return self.driver.find_element(*locator)

    def is_element_displayed(self, *locator):
        element = self.identify_element(*locator)
        displayed = element.is_displayed()
        return displayed

    def is_element_present(self, locator):
        try:
          element = self.wait_for_element_visibility(locator)
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
        element = ui.WebDriverWait(self.driver, 100).until(EC.presence_of_element_located(locator),
                                                           'Element has not presented yet.')
        return element

    def wait_for_element_clickable(self, locator):
        element = ui.WebDriverWait(self.driver, 100).until(EC.element_to_be_clickable(locator),
                                                           'Element has not been ready to be clicked.')
        return element

    def wait_for_element_visibility(self, locator):
        element = ui.WebDriverWait(self.driver, 100).until(EC.visibility_of_element_located(locator),
                                                           'Element has not been visible yet.')
        return element

    def wait_for_element_disappear(self, locator):
        element = ui.WebDriverWait(self.driver, 100).until_not(EC.visibility_of_element_located(locator),
                                                               'Element has not disappeared yet.')
        return element

    def open_page(self, page_url):
        return self.driver.get(page_url)

    def clear_input(self, input_locator):
        input_element = self.wait_for_element_clickable(input_locator)
        input_element.clear()

    def clear_text_input(self, input_locator):
        input_element = self.wait_for_element_clickable(input_locator)
        length = len(input_element.get_attribute('value'))
        input_element.send_keys(length * Keys.BACKSPACE)

    def clear_and_fill_input(self, text, input_locator):
        input_element = self.wait_for_element_clickable(input_locator)
        input_element.clear()
        for i in text:
            input_element.send_keys(i)

    def click_element(self, locator):
        element = self.wait_for_element_clickable(locator)
        return self.driver.execute_script("arguments[0].click();", element)

    def click_button(self, *locator):
        button = self.driver.find_element(*locator)
        button.click()

    def get_text(self, locator):
        item_text = self.wait_for_element_visibility(locator).text
        return item_text

    def get_all_elements_text(self, *locator):
        """
        All elements text are merged to one string
        :param locator - single selector to element where text is stored i.e <span>, <a>
        :return: string
        """
        all_texts = []
        elements = self.driver.find_elements(*locator)
        for element in elements:
            element_text = element.text
            all_texts.append(element_text)
        return " ".join(all_texts).strip("[]")

    def check_title_is_correct(self, title, *locator):
        element_text = self.identify_element(*locator).text
        return True if element_text == title else False

    # Methods recommended for : "Constructions"

    def count_of_inner_elements(self, *locator):
        count = self.driver.find_elements(*locator)
        return len(count)

    def count_of_elements(self, *locator):
        return len(self.driver.find_elements(*locator))

    def count_of_visible_elements(self, *locator):
        counter = 0
        elements = self.driver.find_elements(*locator)
        for element in elements:
            if element.is_displayed():
                counter += 1
        return counter

    def if_row_appear_on_list(self):
        table = self.identify_element(*self.table_class)
        rows = table.find_elements(*self.table_row)
        for row in rows:
            row_text = row.text
            print(row_text)
        last_element = rows[0]
        return last_element

    # Additional methods

    def get_numbers_from_string(self, str):
        get_array = re.findall('\d+', str)[0:3]
        return get_array

    def drag_and_drop(self, source_element, dest_element):
        return self.actions.click_and_hold(source_element).move_by_offset(1000, 0).release(dest_element).perform()

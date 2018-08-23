from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from selenium.webdriver.common.keys import Keys
import re
from selenium.webdriver import ActionChains
from services.service_db import ServiceDb
from services.service_upload import ServiceUpload
from services.service_http import ServiceHttp


class BasePage(object):

    base_url = 'http://localhost:4200/'
    login_http_url = 'http://localhost:90/rest/v1/auth'
    login_payload = "{\"username\": \"admin\", \"plainPassword\": \"admin\"}"
    db_hostname = 'localhost'

    def __init__(self, driver):
        self.__driver = driver
        self.service_db = ServiceDb
        self.service_upload = ServiceUpload
        self.service_http = ServiceHttp

    def if_exist_in_db(self, query):
        return self.service_db().if_exist_in_db(query)

    # Truncate db
    def truncate_db(self):
        return self.service_db().truncate_db()

    def truncate_db_permissions(self):
        return self.service_db().truncate_db_permissions()

    # Prepare environment
    def create_db_env(self, file_path):
        return self.service_db().create_db_env(file_path)

    def insert_to_db(self, table, columns, values):
        return self.service_db().insert_to_db(table, columns, values)

    def refresh_page(self):
        return self.__driver.refresh()

    def login_request(self):
        return self.service_http().http_login(self.login_http_url, self.login_payload)

    # Front
    def identify_element(self, *locator):
        return self.__driver.find_element(*locator)

    def is_element_displayed(self, *locator):
        element = self.identify_element(*locator)
        displayed = element.is_displayed()
        return displayed

    def is_element_appeared(self, locator, **kwargs):
        try:
            __msg = [msg for key, msg in kwargs.items()]
            self.wait_for_element(locator, __msg) if __msg else self.wait_for_element(locator)
        except NoSuchElementException:
            return False
        return True

    def is_element_present(self, locator, **kwargs):
        try:
            __msg = [msg for key, msg in kwargs.items()]
            self.wait_for_element_visibility(locator, __msg) if __msg else self.wait_for_element_visibility(locator)
        except NoSuchElementException:
            return False
        return True

    def is_element_disappear(self, locator, **kwargs):
        try:
            __msg = [msg for key, msg in kwargs.items()]
            self.wait_for_element_disappear(locator, __msg) if __msg else self.wait_for_element_disappear(locator)
        except NoSuchElementException:
            return False
        return True

    def wait_for_element(self, locator, msg='Element has not presented yet.'):
        element = ui.WebDriverWait(self.__driver, 10).until(EC.presence_of_element_located(locator),msg)
        return element

    def wait_for_element_clickable(self, locator, msg='Element has not been ready to be clicked.'):
        element = ui.WebDriverWait(self.__driver, 10).until(EC.element_to_be_clickable(locator), msg)
        return element

    def wait_for_element_visibility(self, locator, msg='Element has not been visible yet.'):
        element = ui.WebDriverWait(self.__driver, 10).until(EC.visibility_of_element_located(locator), msg)
        return element

    def wait_for_element_disappear(self, locator, msg='Element has not disappeared yet.'):
        element = ui.WebDriverWait(self.__driver, 10).until_not(EC.visibility_of_element_located(locator), msg)
        return element

    def open_page(self, page_url):
        return self.__driver.get(page_url)

    def is_input_empty(self, locator):
        input = self.wait_for_element_clickable(locator)
        length = len(input.get_attribute('value'))
        return True if length==0 else False

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
        return self.__driver.execute_script("arguments[0].click();", element)

    def click_button(self, *locator):
        button = self.__driver.find_element(*locator)
        button.click()

    def get_text(self, locator):
        item_text = self.wait_for_element_visibility(locator).text
        return item_text

    def get_value(self, locator):
        value = self.wait_for_element_visibility(locator).get_attribute('value')
        return value

    def get_all_elements_text(self, *locator):
        """
        All elements text are merged to one string
        :param locator - single selector to element where text is stored i.e <span>, <a>
        :return: string
        """
        all_texts = []
        elements = self.__driver.find_elements(*locator)
        for element in elements:
            element_text = element.text
            all_texts.append(element_text)
        return " ".join(all_texts).strip("[]")

    def check_title_is_correct(self, title, *locator):
        element_text = self.identify_element(*locator).text
        return True if element_text == title else False

    # Methods recommended for : "Constructions"

    def count_of_inner_elements(self, *locator):
        count = self.__driver.find_elements(*locator)
        return len(count)

    def count_of_elements(self, *locator):
        return len(self.__driver.find_elements(*locator))

    def count_of_visible_elements(self, *locator):
        counter = 0
        elements = self.__driver.find_elements(*locator)
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

    # Additional methods - services

    def get_numbers_from_string(self, str):
        get_array = re.findall('\d+', str)[0:3]
        return get_array

    def drag_and_drop(self, source_element):
        return self.actions.drag_and_drop_by_offset(source_element, 100, 0).move_by_offset(100, 0).release().perform()

    def choose_file(self, choose_file_btn, file_path):
        service_db = ServiceUpload(file_path)
        abs_path = service_db.get_abs_path()
        choose_btn = self.wait_for_element(choose_file_btn)
        return choose_btn.send_keys(abs_path)

    def get_browser_console_log(self):

        """Get the browser console log"""
        try:
            log = self.__driver.get_log('browser')
            print('log')
            return log
        except Exception as e:
            print("Exception when reading Browser Console log")
            print(str(e))

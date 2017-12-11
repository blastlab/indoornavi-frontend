from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
import csv
import mysql.connector

class BasePage(object):

    def __init__(self, driver,  base_url='http://localhost:4200/'):
        self.base_url = base_url
        self.driver = driver

    # Connections
    # Prepare environment
    def create_db_env(self, filename):
        # db connection
        db = mysql.connector.connect(user='root', password='', host='127.0.0.1', database='Navi')
        cursor = db.cursor()
        # let to cascade deleting
        cursor.execute('SET FOREIGN_KEY_CHECKS=0;')
        # clear data table
        cursor.execute('TRUNCATE TABLE complex')
        # return default settings
        cursor.execute('SET FOREIGN_KEY_CHECKS=1;')
        db.commit()
        # variables
        query_array = []
        sql_statement = "INSERT INTO complex (id, name) VALUES (%s, %s)"
        # read from csv file
        with open(filename, 'r') as theFile:
            reader = csv.DictReader(theFile)
            for line in reader:
                query_array.append((line['id'], line['name']))

        # begin transaction
        try:
            cursor.executemany(sql_statement, query_array)
            db.commit()

        except:
            db.rollback()

        cursor.close()

    def if_exist_in_db(self, record):
        # connect to db
        db = mysql.connector.connect(user='root', password='', host='127.0.0.1', database='Navi')
        cursor = db.cursor()
        cursor.execute('SELECT name FROM TABLE complex')
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



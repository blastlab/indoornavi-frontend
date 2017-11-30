import os
import sys
from selenium.webdriver.common.by import By
cwd = os.getcwd()
sys.path.append(cwd + '../pages/')
from base_page import BasePage
from selenium.common.exceptions import NoSuchElementException

class ComplexesPage(BasePage):

    login_url = 'http://localhost:4200/complexes'
    complex_table_header = 'Complex name'
    # Complexes page locators
    complexes_title = (By.CSS_SELECTOR, 'span.ui-menuitem-text')

    # add button
    # complex-list
    table_construction_name = (By.XPATH, '//table/thead/tr/th[1]/span')
    complexes_list = (By.CSS_SELECTOR, 'div.ui-datatable')
    table_rows = (By.XPATH, '//p-datatable/div/div[1]/table/tbody/tr')
    empty_table = (By.CSS_SELECTOR, 'td.ui-datatable-emptymessage')
    # Buttons
    dropdown_button = (By.CSS_SELECTOR, 'button#menu')
    add_button_complex = (By.CSS_SELECTOR, 'button#add-complex')


    def get_add_button_text(self):
        add_button = self.identify_element(*self.add_button_text_locator).text
        return add_button

    def check_page_loaded_correctly(self):
        return self.wait_for_element(self.complexes_title).text

    def is_dropdown_button_present(self):
        return True if self.is_element_present(self.dropdown_button) else False

    def is_add_button_present(self):
        return True if self.is_element_present(self.add_button_complex) else False

    def get_construction_column_title(self):
        construction_column_name = self.identify_element(*self.table_construction_name).text
        return True if construction_column_name == self.complex_table_header else False

    def check_if_there_is_any_row(self):
        count = self.count_of_inner_elements(*self.table_rows)
        if count == 0:
          try:
            self.identify_element(*self.empty_table).text == 'No records founds'
          except NoSuchElementException:
            return False
          return True
        else:
           return True









from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class FloorsPage(BasePage):

    add_button_floor = (By.CSS_SELECTOR, 'button#add-floor')
    input_level_floor = (By.CSS_SELECTOR, 'input#level')
    existing_level = '1'
    unique_level_warning = (By.XPATH, "//p[contains(text(),'Floor level must be unique in the building')]")
    table_floor_name = (By.XPATH, '//table/thead/tr/th[2]/span')

    def is_add_button_present(self):
        return True if self.is_element_present(self.add_button_floor) else False

    def is_floor_table_header_present(self):
        return self.check_title_is_correct('Floor name', *self.table_floor_name)

    def is_warning_toast_present(self):
        return True if self.is_element_present(self.unique_level_warning) else False

    def enter_existing_level(self):
        return self.clear_and_fill_input(self.existing_level, *self.input_level_floor)

    def add_button_click(self):
        return self.click_button(*self.add_button_floor)

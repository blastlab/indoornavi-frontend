from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class ComplexesPage(BasePage):

    add_button_complex = (By.CSS_SELECTOR, 'button#add-complex')

    def add_button_click(self):
        return self.click_button(*self.add_button_complex)

    def is_add_button_present(self):
        return True if self.is_element_present(self.add_button_complex) else False

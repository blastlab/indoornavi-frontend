from selenium.webdriver.common.by import By
# from pages.base_page import BasePage
from pages.constructions.construction_page import ConstructionPage


class ComplexesPage(ConstructionPage):

    def __init__(self, driver, module_query):
        self.__driver = driver
        self.__module = module_query
        ConstructionPage.__init__(self, self.__driver, self.__module)

    add_button_complex = (By.CSS_SELECTOR, 'button#add-complex')

    def add_button_click(self):
        return self.click_button(*self.add_button_complex)

    def is_add_button_present(self):
        return True if self.wait_for_element_clickable(self.add_button_complex) else False

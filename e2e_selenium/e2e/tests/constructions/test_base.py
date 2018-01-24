from selenium import webdriver
from pages.constructions.construction_page import ConstructionPage

class TestBase:

    def multi_assertion(self):
        # create list for all returned True or False

        asserts = []
        dropdown_present = self.construction_page.is_dropdown_button_present()
        constr_counter = self.construction_page.check_if_there_is_any_row()

        asserts.append(dropdown_present)
        asserts.append(constr_counter)
        # Check if there is any False in array
        return False if False in asserts else True

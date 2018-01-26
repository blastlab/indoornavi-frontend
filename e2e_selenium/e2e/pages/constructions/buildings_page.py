from pages.base_page import BasePage
from locators.construction_base_locators import ConstructionBaseLocators

class BuildingsPage(BasePage):

    # Module variable
    base_locators = ConstructionBaseLocators('building')


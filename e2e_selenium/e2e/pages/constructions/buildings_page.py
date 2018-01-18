from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from locators.locators import BaseLocators
from selenium.common.exceptions import NoSuchElementException

class BuildingsPage(BasePage):

    # Module variable
    base_locators = BaseLocators('building')


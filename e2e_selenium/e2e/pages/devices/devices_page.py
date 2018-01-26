from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from pages.base_page import BasePage
from locators.devices_base_locators import DevicesBaseLocators
from config import Config

class DevicesPage(BasePage):

    def __init__(self, driver, module_query):
        self.driver = driver
        self.module_query = module_query

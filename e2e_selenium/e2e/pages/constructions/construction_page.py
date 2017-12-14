from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from pages.base_page import BasePage

class ConstructionPage(object):

    def __init__(self, driver,  base_url='http://frontend:4200/'):
        self.base_url = base_url
        self.driver = driver

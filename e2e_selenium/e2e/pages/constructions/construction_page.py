from selenium.webdriver.support import expected_conditions as EC
import selenium.webdriver.support.ui as ui
from selenium.common.exceptions import NoSuchElementException
from base_page import BasePage

class ConstructionPage(object):

    def __init__(self, driver,  base_url='http://localhost:4200/'):
        self.base_url = base_url
        self.driver = driver






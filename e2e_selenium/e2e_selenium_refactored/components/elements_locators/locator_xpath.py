from selenium.webdriver.common.by import By
# import sys
# print(sys.path)
# sys.path.insert(0,'components/elements_locators/Xpath.py')

class Xpath:

    def __init__(self, value):
        self._value = value

    def __repr__(self):
        return self._value

    @property
    def importing(self):
        return 1

    def locator(self):
        return By.XPATH, self._value

    def find_me(self, webdriver_instance):
        return webdriver_instance.find_element_by_xpath(str(self))


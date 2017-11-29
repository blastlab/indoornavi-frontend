from selenium.webdriver.common.by import By


class Class(object):

    def __init__(self, value):
        self._value = value

    def __repr__(self):
        return self._value

    @property
    def locator(self):
        return By.CLASS_NAME, self._value

    def find_me(self, webdriver_instance):
        return webdriver_instance.find_element_by_class_name(str(self))


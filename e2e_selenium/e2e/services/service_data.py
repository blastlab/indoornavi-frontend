import json
from selenium.webdriver.common.by import By


def get_test_translator_data():
    with open('src/test_conf/test_translator.json') as translator_data:
        print(type(translator_data))
        data = json.load(translator_data)
        return data


def get_toast_selector(key):
    selector = (By.XPATH, '//p[contains(text(),"{0}")]'.format(get_test_translator_data()[key]))
    return selector

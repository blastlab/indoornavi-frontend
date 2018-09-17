import json
import csv
from selenium.webdriver.common.by import By


def get_data_json_from_file(path):
    with open(path) as data_json:
        return json.load(data_json)


def get_test_translator_data():
        return get_data_json_from_file('src/test_conf/test_translator.json')


def parse_json_to_string(path):
    with open(path) as translator_data:
        return str(json.load(translator_data)).replace("'", '"').replace("None", "null").replace("True", "true")


def get_csv_data(filepath):
    '''
    This function read csv, append each row of file to array and return it.

    :param filepath: path to .csv file
    :return: data_array
    '''
    data_array = []
    with open(filepath) as csvfile:
          data_reader = csv.reader(csvfile)
          next(data_reader)
          for row in data_reader:
              data_array.append(row)

    return data_array


def get_multiselect_selector(params):
    return By.CLASS_NAME, "test-multiselect-item-{0}-{1}".format(params[0], params[1])


def get_toast_selector(key):
    return By.XPATH, '//p[contains(text(),"{0}")]'.format(get_test_translator_data()[key])

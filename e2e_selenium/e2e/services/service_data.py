import json
import csv
from selenium.webdriver.common.by import By


def get_data_json_from_file(path):
    with open(path) as data_json:
        data = json.load(data_json)
        return data


def get_test_translator_data():
        path = 'src/test_conf/test_translator.json'
        return get_data_json_from_file(path)


def parse_json_to_string(path):
    with open(path) as translator_data:
        data = str(json.load(translator_data)).replace("'", '"')\
                                              .replace("None", "null")\
                                              .replace("True", "true")
        return data


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
    selector = (By.CLASS_NAME, "test-multiselect-item-{0}-{1}".format(params[0], params[1]))
    return selector


def get_toast_selector(key):
    selector = (By.XPATH, '//p[contains(text(),"{0}")]'.format(get_test_translator_data()[key]))
    return selector

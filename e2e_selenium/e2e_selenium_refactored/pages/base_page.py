import os
import sys
import unittest
cwd = os.getcwd()
sys.path.append(cwd + '/../components/elements_locators/')
from selenium import webdriver
from selenium.webdriver.common.by import By
from locator_xpath import Xpath
from locator_class import Class
from locator_id import Id

class BasePage(object):

    def __init__(self):
        self.driver = webdriver


    def setUp(self, page_uri=''):
        localUrl = 'http://localhost:4200/'
        wb = webdriver.Chrome()
        wb.get(localUrl+page_uri)

    def clear_and_fill_input(self, input_locator, value):
        print()

    def test_if_page_is_loaded_correctly(self):

        print('test_if_page_is_loaded_correctly')

    def test_if_page_is_loaded_correctly2(self):

        print('test_if_page_is_loaded_correctly2')

    


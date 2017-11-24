import unittest
# import TestDriver
from test_driver import TestDriver

class TestLoginPage(unittest.TestCase):


    def setUp(self):
        self.uri = ''
        TestDriver.setUp(self, self.uri)

    def test_load_page(self):
        #go to Url

        print('[test] TestLoginPage - function: test_load_page()')

    def tearDown(self):
         print('[test] TestLoginPage - function: tearDown()')

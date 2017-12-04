import unittest
import HtmlTestRunner
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd + '/tests/')
sys.path.append(cwd + '/tests/constructions')
from test_login_page import TestLoginPage
from test_complexes_page import TestComplexesPage

if __name__ == '__main__':

    unittest.main()

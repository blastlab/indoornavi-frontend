import unittest
import HtmlTestRunner
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd)
from tests.test_login_page import TestLoginPage
from tests.constructions.test_complexes_page import TestComplexesPage

if __name__ == '__main__':

    runner = HtmlTestRunner.HTMLTestRunner(output='')
    unittest.main(testRunner=runner)

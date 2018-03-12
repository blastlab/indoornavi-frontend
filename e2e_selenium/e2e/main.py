import unittest
import xmlrunner
import HtmlTestRunner
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd)
from tests.test_login_page import TestLoginPage
from tests.constructions.test_complexes_page import TestComplexesPage

if __name__ == '__main__':

    # runner = HtmlTestRunner.HTMLTestRunner(output='')
    # unittest.main(testRunner=runner)
    unittest.main(
      testRunner=xmlrunner.XMLTestRunner(output='test-reports'),
      # these make sure that some options that are not applicable
      # remain hidden from the help menu.
      failfast=False, buffer=False, catchbreak=False)

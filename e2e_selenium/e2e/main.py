import unittest
import xmlrunner
import HtmlTestRunner
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd)
from tests.test_login_page import TestLoginPage
from tests.constructions.test_complexes_page import TestComplexesPage
from tests.constructions.test_buildings_page import TestBuildingsPage
if __name__ == '__main__':

    unittest.main()

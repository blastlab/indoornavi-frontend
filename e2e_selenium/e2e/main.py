import unittest
import HtmlTestRunner
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd + '/tests/')
sys.path.append(cwd + '/tests/constructions')
sys.path.append('/home/motlowski/Desktop/Indoornavi/frontend/e2e_selenium/e2e/libraries/liquipy/')
from test_login_page import TestLoginPage
from test_complexes_page import TestComplexesPage
import liquipy

if __name__ == '__main__':
    # unittest.main(testRunner=HtmlTestRunner.HTMLTestRunner(output=''))
    db = liquipy.Database(
      host="localhost",
      port="3306",
      database="Navi",
      username="root",
      password="",
      tempDir=".")

    db.initialize('changeloger.yml')

    db.update()

    unittest.main()

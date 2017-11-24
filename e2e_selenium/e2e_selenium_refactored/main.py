import unittest
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd + '/tests/')
from test_login_page import TestLoginPage

if __name__ == '__main__':
    unittest.main()

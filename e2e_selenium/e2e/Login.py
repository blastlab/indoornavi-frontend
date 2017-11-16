from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from termcolor import colored

class Login():
	__test_name='LOGIN TEST'
	__username = 'admin'
	__password = 'admin'

	def __init__(self, wb):
		self.__wb = wb

	def test(self):
		self.__should_log_in()

	def __should_log_in(self):
		print(colored('\nSTART '+self.__test_name, 'yellow'))

		# Wait for login form
		login_form = WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.ID, 'login-button')))
		login_button = login_form.find_element_by_xpath('//span[contains(text(), "Login")]')

		# Assertion 1 : There should appear button with text "Login"
		assert login_button.text == "Login", "[FAILURE] Element with text [Login] not found"

		# Fill the form
		username_input = self.__wb.find_element_by_id('user-name-input')
		username_input.clear()
		username_input.send_keys(self.__username)
		password_input = self.__wb.find_element_by_id('user-password-input')
		password_input.clear()
		password_input.send_keys(self.__password)
		# Click Login
		login_form.click()

		# Assertion 2 - There should be complexes' page loaded
		complexes_title = WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'h1'))).text
		assert complexes_title == "Your building complexes", "[FAILURE] Complexes page is not loaded correctly"

		print(colored('T1. [Complete] Login Functionality', 'green'))
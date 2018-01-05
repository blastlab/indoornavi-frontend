from pages.base_page import BasePage
from selenium.webdriver.common.by import By

class LoginPage(BasePage):

    login_url='http://localhost:4200/'
    redirect_url=login_url+'complexes'
    # Login page locators
    form_locator = (By.CSS_SELECTOR, 'form.ng-valid')
    button_locator = (By.ID, 'login-button')
    button_text_locator = (By.CSS_SELECTOR, 'span.ui-button-text')
    usr_input_locator = (By.ID, 'user-name-input')
    usr_password_locator = (By.ID, 'user-password-input')
    next_page_title_locator = (By.CSS_SELECTOR, 'span.ui-menuitem-text')
    login_warning = (By.CSS_SELECTOR, 'div.ui-messages-error')

    # input credentials
    valid_username = 'admin'
    valid_password = 'admin'
    invalid_username = 'admin1'
    invalid_password = 'admin1'

    # test cases collection

    def check_page_loaded_correctly(self):
        return True if self.wait_for_element(self.form_locator) else False

    def get_button_text(self):
        login_button_text = self.identify_element(*self.button_text_locator).text
        return login_button_text

    # There are 3 options :
    # 1. Login with valid credentials
    # 2. Login with invalid password
    # 3. Login with invalid username

    def login_process(self, option=1):

        if option == 1:
            username = self.valid_username
            password = self.valid_password

        elif option == 2:
            username = self.valid_username
            password = self.invalid_password

        elif option == 3:
            username = self.invalid_username
            password = self.valid_password

        # find element, clear & fill it
        self.clear_and_fill_input(username, *self.usr_input_locator)
        self.clear_and_fill_input(password, *self.usr_password_locator)
        # click Login
        self.click_button(*self.button_locator)

        # there should be complexes' page loaded & return complexes title
        if option == 1:
            return self.wait_for_element(self.next_page_title_locator).text

        elif option == 2:
            return self.is_element_present(self.login_warning)

        elif option == 3:
            return self.is_element_present(self.login_warning)

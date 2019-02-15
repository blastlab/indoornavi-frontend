from pages.base_page import BasePage
from selenium.webdriver.common.by import By


class LoginPage(BasePage):

    login_url = BasePage.base_url
    redirect_url = login_url+'complexes'
    # Login page locators
    form_locator = (By.CSS_SELECTOR, 'form.ng-valid')
    button_locator = (By.ID, 'login-button')
    button_text_locator = (By.CSS_SELECTOR, 'span.ui-button-text')
    usr_input_locator = (By.ID, 'user-name-input')
    usr_password_locator = (By.ID, 'user-password-input')
    next_page_title_locator = (By.CSS_SELECTOR, 'span.ui-menuitem-text')
    login_warning = (By.CSS_SELECTOR, 'div.ui-messages-error')
    dropdown_button = (By.CSS_SELECTOR, 'button#menu')
    logout_button = (By.CSS_SELECTOR, 'div#logout a')
    # input credentials
    valid_username = 'admin'
    valid_password = 'admin'
    invalid_username = 'admin1'
    invalid_password = 'admin1'

    # test cases collection
    def __init__(self, webdriver):
        BasePage.__init__(self, webdriver)

    def check_page_loaded_correctly(self):
        return True if self.wait_for_element(self.form_locator) else False

    def get_button_text(self):
        login_button_text = self.wait_for_element_clickable(self.button_text_locator).text
        return login_button_text

    def is_dropdown_button_clickable(self):
        return self.wait_for_element_clickable(self.dropdown_button)

    def click_dropdown_button(self):
        self.click_button(*self.dropdown_button)

    def is_logout_button_clickable(self):
        return self.wait_for_element_clickable(self.logout_button)

    def click_logout_button(self):
        self.click_element(self.logout_button)

    # There are 3 options :
    # 1. Login with valid credentials
    # 2. Login with invalid password
    # 3. Login with invalid username

    def login_process(self, option=1, additional=None):

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
        self.clear_and_fill_input(username, self.usr_input_locator)
        self.clear_and_fill_input(password, self.usr_password_locator)
        # click Login
        self.click_button(*self.button_locator)

        if option == 1:
            element = self.wait_for_element(self.next_page_title_locator).text
            return element

        elif option == 2:
            return self.is_element_present(self.login_warning)

        elif option == 3:
            return self.is_element_present(self.login_warning)

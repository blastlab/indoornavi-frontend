from base_page import BasePage
from selenium.webdriver.common.by import By

class LoginPage(BasePage):

    login_url='http://localhost:4200/'
    # Login page locators
    FORM_LOCATOR = (By.CSS_SELECTOR, 'div.ng-valid')
    button_locator = (By.CSS_SELECTOR, 'span.mat-button-wrapper')
    usr_input_locator = (By.ID, 'user-name-input')
    usr_password_locator = (By.ID, 'user-name-password')
    next_page_title_locator = (By.TAG_NAME, 'h1')

    # input credentials
    valid_username = 'admin'
    valid_password = 'admin'
    invalid_username = 'admin1'
    invalid_password = 'admin1'

    # test cases collection

    def check_page_loaded_correctly(self):
        print('check_page_loaded_correctly')
        # return 1
        # print('BasePage.wait_for_element(self.form_locator)')

        self.wait_for_element()

        # print(self.form_locator)
        # print(self.form_locator)
        # self.find_element(*self.__form_locator)
        # return True if BasePage.wait_for_element(self.form_locator) else False

    # def find_login_button(self):
    #     # BasePage.wait_for_element(self.usr_input_locator)
    #     # button_text = button.text
    #     # print('button_text')
    #     #
    #     # print('test print find_login_button')
    #     # print(button_text)
    #     # return BasePage.find_element(self.button_locator).text
    #
    # # def login_with_valid_data(self):
    # #
    # #     # find element, clear & fill it
    # #     BasePage.clear_and_fill_input(self.usr_input_locator, self.valid_username)
    # #     BasePage.clear_and_fill_input(self.usr_password_locator, self.valid_password)
    # #     BasePage.click_button(self.button_locator)
    # #     # there should be complexes' page loaded & return complexes title
    # #     return BasePage.wait_for_element(self.next_page_title_locator).text
    #

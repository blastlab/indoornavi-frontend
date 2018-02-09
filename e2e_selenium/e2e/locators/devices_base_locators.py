from selenium.webdriver.common.by import By

class DevicesBaseLocators(object):

    def __init__(self, module_query):
        self.module_query = module_query
        self.module = self.module_query.title()
        self.device_modal_title = 'Add new ' + self.module_query
        self.new_device_name = 'Test' + self.module
        self.new_device_short_id = '123'
        self.new_device_long_id = '1234'
        self.edit_device_name = 'TestEdit' + self.module
        self.illegal_name = '!@#^&$*()*&^@'
        self.xml_filename = 'src/test-devices.xml'

        ############################## LOCATORS ###############################

        # Page Title
        self.page_device_title = (By.XPATH, "//span.ui-menuitem-text[contains(text(),'" + self.module + "')]")
        self.dropdown_button = (By.CSS_SELECTOR, 'button#menu')
        self.add_button_device = (By.XPATH, '//button[@ng-reflect-label="Add"]')
        self.devices_table = (By.CSS_SELECTOR, 'div.ui-picklist')

        self.dropdown_menu_device_button = (By.XPATH, '//button[@ng-reflect-router-link="./'+self.module_query+'s"]')
        # Input
        self.input = (By.CSS_SELECTOR, 'form div div input#name')
        self.short_id_input = (By.CSS_SELECTOR, 'form div div input#shortId')
        self.long_id_input = (By.CSS_SELECTOR, 'form div div input#longId')
        # Adding method - Locators

        self.save_button = (By.XPATH, '//button[@ng-reflect-label="Save"]')
        self.cancel_button = (By.XPATH, '//button[@ng-reflect-label="Cancel"]')

        self.not_verifed_device_table = (By.XPATH, '//p-picklist[@ng-reflect-source-header="Not verified"] ')

        self.last_row_short_id = (By.CSS_SELECTOR, 'p-picklist[ng-reflect-source-header="Not verified"] li.ui-picklist-item *:last-child div.device-details *:nth-child(1)')
        self.last_row_long_id = (By.CSS_SELECTOR, 'p-picklist[ng-reflect-source-header="Not verified"] li.ui-picklist-item *:last-child div.device-details *:nth-child(2)')
        self.last_row_device_name = (By.CSS_SELECTOR, 'p-picklist[ng-reflect-source-header="Not verified"] li.ui-picklist-item *:last-child div.device-details *:nth-child(3)')
        # self.last_row_not_verifed = (By.CSS_SELECTOR, 'li.ui-picklist-item:last-of-type')

        self.select_device = ("SELECT name FROM device ORDER BY id DESC LIMIT 1")
        # Modals
        self.modal_window = (By.CLASS_NAME, 'ui-dialog-title')
        # Warnings
        self.removed_toast = (By.XPATH, "//p[contains(text(),'Device has been removed')]")
        self.added_toast = (By.XPATH, "//p[contains(text(),'Device has been created')]")
        self.edited_toast = (By.XPATH, "//p[contains(text(),'Device has been saved')]")
        self.name_warning = (By.CSS_SELECTOR, 'div.ui-messages-error')
        # Toasts
        self.unique_short_id_toast = (By.XPATH, "//p[contains(text(),'Short Id must be unique.')]")
        self.unique_long_id_toast = (By.XPATH, "//p[contains(text(),'Long Id must be unique.')]")

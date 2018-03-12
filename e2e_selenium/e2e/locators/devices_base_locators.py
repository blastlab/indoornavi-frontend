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
        # Temporary
        # picklist
        self.devices_table = (By.CSS_SELECTOR, 'div.ui-picklist')

        self.dropdown_menu_device_button = (By.XPATH, '//button[@ng-reflect-router-link="./'+self.module_query+'s"]')
        # Input
        self.input = (By.CSS_SELECTOR, 'form div div input#name')
        self.short_id_input = (By.CSS_SELECTOR, 'form div div input#shortId')
        self.long_id_input = (By.CSS_SELECTOR, 'form div div input#longId')
        # Adding method - Locators

        self.save_button = (By.XPATH, '//button[@ng-reflect-label="Save"]')
        self.cancel_button = (By.XPATH, '//button[@ng-reflect-label="Cancel"]')

        # self.devices_table = (By.XPATH, '//p-picklist')

        self.picklist_wrapper = (By.CSS_SELECTOR, 'div.ui-picklist-listwrapper')
        # self.picklist_wrapper_not_verified = (By.CSS_SELECTOR, 'div.ui-picklist-listwrapper:first-child')
        # self.picklist_wrapper_verified = (By.CSS_SELECTOR, '')

        self.devices_table_item = (By.CSS_SELECTOR, 'li.ui-picklist-item')
        self.devices_table_item_text = (By.CSS_SELECTOR, 'div.device-details *:nth-child(1)')

        self.not_verified_table = (By.CSS_SELECTOR, 'ul.ui-picklist-source')
        self.verified_table = (By.CSS_SELECTOR, 'ul.ui-picklist-target')

        self.last_row_short_id = (By.CSS_SELECTOR, 'p-picklist[ng-reflect-source-header="Not verified"] li.ui-picklist-item *:last-child div.device-details *:nth-child(1)')
        self.last_row_long_id = (By.CSS_SELECTOR, 'p-picklist[ng-reflect-source-header="Not verified"] li.ui-picklist-item *:last-child div.device-details *:nth-child(2)')
        self.last_row_device_name = (By.CSS_SELECTOR, 'p-picklist[ng-reflect-source-header="Not verified"] li.ui-picklist-item *:last-child div.device-details *:nth-child(3)')
        # self.last_row_not_verifed = (By.CSS_SELECTOR, 'li.ui-picklist-item:last-of-type')

        # Edit method - Locators
        self.edit_button_device = (By.XPATH, '//button[@ng-reflect-text="Edit"]')

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

        # Delete method - Locators
        self.remove_ask = (By.XPATH, "//span[contains(text(),'Are you sure you want to perform this action?')]")
        self.delete_button_device = (By.XPATH, '//button[@ng-reflect-text="Remove"]')
        self.yes_delete_button_device = (By.XPATH, '//button[@ng-reflect-label="Yes"]')
        self.no_delete_button_device = (By.XPATH, '//button[@ng-reflect-label="No"]')

        # Search method - Locators
        self.search_not_verified_input = (By.CSS_SELECTOR, 'p-picklist[ng-reflect-source-header="Not verified"] div.ui-picklist div.ui-picklist-listwrapper div.ui-picklist-filter-container input[placeholder="Search by short id"]')
        self.search_verified_input = (By.CSS_SELECTOR, 'div.ui-picklist-target-wrapper div.ui-picklist-filter-container input[placeholder="Search by short id"]')

        # Change Verify method - Locators
        self.move_to_verify_button = (By.CSS_SELECTOR, 'button[ng-reflect-icon="fa-angle-right"]')
        self.move_to_not_verify_button = (By.CSS_SELECTOR, 'button[ng-reflect-icon="fa-angle-left"]')
        self.move_all_to_verify_button = (By.CSS_SELECTOR, 'button[ng-reflect-icon="fa-angle-double-right"]')
        self.move_all_to_not_verify_button = (By.CSS_SELECTOR, 'button[ng-reflect-icon="fa-angle-double-left"]')

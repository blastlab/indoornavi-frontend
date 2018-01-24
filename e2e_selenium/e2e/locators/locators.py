from selenium.webdriver.common.by import By

class BaseLocators(object):

    def __init__(self, module_query):
        self.module_query = module_query
        self.module = self.module_query.title()
        self.building_modal_title = 'Add new ' + self.module_query
        self.new_construction_name = 'Test' + self.module
        self.edit_construction_name = 'TestEdit' + self.module
        self.illegal_name = '!@#^&$*()*&^@'
        self.xml_filename = 'src/test-complexes.xml'
        self.floors_table_header = 'Floor name'
        self.buildings_table_header = self.module + 'name'

        ############################## LOCATORS ###############################

        self.table_construction_name = (By.XPATH, '//table/thead/tr/th[1]/span')
        self.table_construction_name_redirected = (By.XPATH, '//table/thead/tr/th[2]/span')
        self.table_content = (By.XPATH, '//p-datatable/div/div[1]/table/tbody')
        self.table_rows = (By.XPATH, '//p-datatable/div/div[1]/table/tbody/tr')
        self.empty_table = (By.CSS_SELECTOR, 'td.ui-datatable-emptymessage')
        ###
        # Add construction - locators
        ###
        self.modal_window = (By.CLASS_NAME, 'ui-dialog-title')
        self.created_construction_row = (By.XPATH, "//span[contains(text(),'Test" + self.module + "')]")
        ###
        # Remove construction - locators
        ###
        self.remove_ask = (By.XPATH, "//span[contains(text(),'Are you sure you want to perform this action?')]")
        self.yes_button = (By.XPATH, '//button[@ng-reflect-label="Yes"]')
        self.no_button = (By.XPATH, '//button[@ng-reflect-label="No"]')
        ###
        # Edit construction - locators
        ###
        self.edit_last_construction_btn = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:nth-last-child(2)')
        self.edited_construction_row = (By.XPATH, "//span[contains(text(),'TestEdit" + self.module + "')]")
        ###
        # Redirect building to buildings page -locator
        ###
        self.redirect_last_btn = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:first-of-type')
        # last_building_row = (By.CSS_SELECTOR, 'tr:last-child > td:nth-child(1) > span')
        # Buttons
        self.dropdown_button = (By.CSS_SELECTOR, 'button#menu')
        self.add_button_construction = (By.CSS_SELECTOR, 'button#new-' + self.module_query + '-button')
        self.save_button = (By.XPATH, '//button[@ng-reflect-label="Save"]')
        self.cancel_button = (By.XPATH, '//button[@ng-reflect-label="Cancel"]')
        self.remove_last_construction_btn = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:last-child')
        # Input
        self.input = (By.CSS_SELECTOR, 'form div div input#name')
        # Warning & Toasts
        self.removed_toast = (By.XPATH, "//p[contains(text(),'" + self.module + " has been removed.')]")
        self.added_toast = (By.XPATH, "//p[contains(text(),'" + self.module + " has been created.')]")
        self.edited_toast = (By.XPATH, "//p[contains(text(),'" + self.module + " has been saved.')]")
        self.name_warning = (By.CSS_SELECTOR, 'div.ui-messages-error')
        self.remove_modal_window = (By.CLASS_NAME, 'ui - dialog')
        # Db queries
        # truncate_building_table = ("TRUNCATE building")
        self.select_construction = ("SELECT name FROM " + self.module_query + " ORDER BY id DESC LIMIT 1")

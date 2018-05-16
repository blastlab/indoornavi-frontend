from selenium.webdriver.common.by import By


class PermissionsBaseLocators(object):

    def __init__(self):

        # Test input data
        self.searching_data = 'ANCHOR_CREATE'
        self.searching_data_array = [True, self.searching_data]
        self.searching_data_02 = 'PER'
        self.searching_data_02_array = [True, 'PERMISSION_GROUP_CREATE', 'PERMISSION_GROUP_READ',
                                        'PERMISSION_GROUP_UPDATE', 'PERMISSION_GROUP_DELETE']

        self.searching_data_03 = 'UPDATE'
        self.searching_data_03_array = [True, 'ANCHOR_UPDATE', 'BUILDING_UPDATE', 'COMPLEX_UPDATE',
                                        'FLOOR_UPDATE', 'TAG_UPDATE', 'USER_UPDATE',
                                        'PERMISSION_GROUP_UPDATE', 'SINK_UPDATE', 'PUBLICATION_UPDATE']

        # Locators
        self.dropdown_button = (By.CSS_SELECTOR, 'button#menu')
        self.add_permission_button = (By.XPATH, '//button[@ng-reflect-label="Add"]')
        self.dropdown_permissions_button = (By.XPATH, '//button[@ng-reflect-router-link="./permissionGroups"]')
        self.dropdown_sinks_button = (By.XPATH, '//button[@ng-reflect-router-link="./sinks"]')

        self.permission_title = (By.CLASS_NAME, 'ui-menuitem-text')
        self.groups_list = (By.CLASS_NAME, 'ui-datatable-tablewrapper')
        self.modal_window = (By.CLASS_NAME, 'ui-dialog')
        self.modal_close_button = (By.CLASS_NAME, 'ui-dialog-titlebar-close')

        self.multiselect_label = (By.CLASS_NAME, 'ui-multiselect-label')
        self.multiselect_arrow = (By.CLASS_NAME, 'ui-multiselect-trigger')
        self.multiselect_dropdown = (By.CLASS_NAME, 'ui-multiselect-panel')
        self.multiselect_cancel_sharp = (By.CLASS_NAME, 'ui-multiselect-close')

        self.multiselect_rows = (By.CLASS_NAME, 'ui-multiselect-items')
        self.multiselect_row = (By.CLASS_NAME, 'ui-multiselect-item')
        self.multiselect_row_highlighted = (By.CLASS_NAME, 'ui-state-highlight')

        self.multiselect_checkbox_all = (By.CSS_SELECTOR, '.ui-widget-header .ui-chkbox .ui-chkbox-box')
        self.multiselect_checkbox_single = (By.CSS_SELECTOR, '.ui-multiselect-list .ui-multiselect-item .ui-chkbox .ui-chkbox-box')
        self.multiselect_row_label = (By.CSS_SELECTOR, '.ui-multiselect-item label')

        self.multiselect_label_container_title = (By.CLASS_NAME, 'ui-multiselect-label-container')

        self.searching_per_input = (By.CSS_SELECTOR, '.ui-multiselect-filter-container .ui-inputtext ')

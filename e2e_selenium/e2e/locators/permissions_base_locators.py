from selenium.webdriver.common.by import By


class PermissionsBaseLocators(object):

    def __init__(self):
        self.xml_filename = 'src/permissions.xml'
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

        self.all_permissions = 'ANCHOR_CREATE, ANCHOR_READ, ANCHOR_UPDATE, ANCHOR_DELETE, ' \
                               'BUILDING_CREATE, BUILDING_READ, BUILDING_UPDATE, BUILDING_DELETE, ' \
                               'COMPLEX_CREATE, COMPLEX_READ, COMPLEX_UPDATE, COMPLEX_DELETE, FLOOR_CREATE, ' \
                               'FLOOR_READ, FLOOR_UPDATE, FLOOR_DELETE, TAG_CREATE, TAG_READ, TAG_UPDATE, ' \
                               'TAG_DELETE, USER_CREATE, USER_READ, USER_UPDATE, USER_DELETE, PERMISSION_GROUP_CREATE, ' \
                               'PERMISSION_GROUP_READ, PERMISSION_GROUP_UPDATE, PERMISSION_GROUP_DELETE, SINK_CREATE, SINK_READ,' \
                               ' SINK_UPDATE, SINK_DELETE, PUBLICATION_CREATE, PUBLICATION_READ, PUBLICATION_UPDATE, PUBLICATION_DELETE'

        # DB
        self.select_permission_group = ("SELECT name FROM permissiongroup ORDER BY id DESC LIMIT 1")
        self.new_name = "TestPermissionGroup"
        self.edit_name = "TestEditPermissionGroup"
        self.created_permission_row = (By.XPATH, "//span[contains(text(),'" + self.new_name + "')]")
        self.edited_permission_row = (By.XPATH, "//span[contains(text(),'" + self.edit_name + "')]")
        # Locators
        self.dropdown_button = (By.CSS_SELECTOR, 'button#menu')
        self.add_permission_button = (By.XPATH, '//button[@ng-reflect-label="Add"]')
        self.edit_permission_button = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:nth-last-child(2)')
        self.delete_permission_button = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:nth-last-child(1)')
        self.dropdown_permissions_button = (By.XPATH, '//button[@ng-reflect-router-link="./permissionGroups"]')
        self.dropdown_sinks_button = (By.XPATH, '//button[@ng-reflect-router-link="./sinks"]')

        self.permission_title = (By.CLASS_NAME, 'ui-menuitem-text')
        self.groups_list = (By.CLASS_NAME, 'ui-datatable-tablewrapper')
        self.modal_window = (By.CLASS_NAME, 'ui-dialog')
        self.confirm_window = (By.CLASS_NAME, 'ui-confirmdialog')
        self.modal_close_button = (By.CLASS_NAME, 'ui-dialog-titlebar-close')
        self.close_button = (By.XPATH, '//p-confirmdialog/div/div[1]/a/span')
        self.save_button = (By.XPATH, '//button[@ng-reflect-label="Save"]')
        self.cancel_button = (By.XPATH, '//button[@ng-reflect-label="Cancel"]')
        self.yes_button = (By.XPATH, '//button[@ng-reflect-label="Yes"]')
        self.no_button = (By.XPATH, '//button[@ng-reflect-label="No"]')
        self.modal_new_name = (By.CSS_SELECTOR, 'input#name')

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

        self.single_row_permission_span_name = (By.XPATH, '//div/ng-component/p-datatable/div/div[1]/table/tbody/tr[3]/td[1]/span')
        self.single_row_permission_span_perm = (By.XPATH, '//div/ng-component/p-datatable/div/div[1]/table/tbody/tr[3]/td[2]/span/span')
        # Warnings
        self.removed_toast = (By.XPATH, "//p[contains(text(),'Permission group has been removed')]")
        self.added_toast = (By.XPATH, "//p[contains(text(),'Permission group has been created.')]")
        self.edited_toast = (By.XPATH, "//p[contains(text(),'Permission group has been saved')]")
        self.name_warning = (By.CSS_SELECTOR, 'div.ui-messages-error')

from pages.base_page import BasePage
from locators.permissions_base_locators import PermissionsBaseLocators
from random import randint
from random import sample


class PermissionsPage(BasePage, PermissionsBaseLocators):

    def __init__(self, driver):
        self.driver = driver
        PermissionsBaseLocators.__init__(self)

    #
    # IS ELEMENT DISPLAYED
    #

    def is_multiselect_dropdown_displayed(self):
        return True if self.is_element_displayed(*self.multiselect_dropdown) else False

    def is_groups_list_displayed(self):
        return True if self.is_element_displayed(*self.groups_list) else False

    def is_modal_window_displayed(self):
        return True if self.is_element_displayed(*self.modal_window) else False

    def is_permissions_title_correct(self):
        title = 'Permission groups'
        return self.check_title_is_correct(title, *self.permission_title)

    def is_all_permissions_highlighted(self):
        rows = self.count_of_visible_elements(*self.multiselect_row)
        rows_highlighted = self.count_of_visible_elements(*self.multiselect_row_highlighted)
        return True if rows == rows_highlighted else False

    #
    # ELEMENT CLICK
    #

    def dropdown_menu_click(self):
        return self.click_element(self.dropdown_button)

    def dropdown_sinks_button_click(self):
        return self.click_element(self.dropdown_sinks_button)

    def dropdown_permissions_button_click(self):
        return self.click_element(self.dropdown_permissions_button)

    def add_permission_button_click(self):
        return self.click_element(self.add_permission_button)

    def multi_select_label_click(self):
        return self.click_element(self.multiselect_label)

    def multi_select_arrow_click(self):
        return self.click_element(self.multiselect_arrow)

    def multi_select_cancel_sharp_click(self):
        return self.click_element(self.multiselect_cancel_sharp)

    def multi_select_click_all_chekboxes(self):
        return self.click_element(self.multiselect_checkbox_all)

    def get_multiselet_label_container_title(self):
        element = self.identify_element(*self.multiselect_label_container_title)
        element.get_attribute("title")
        return element.get_attribute("title")

    def checkboxes_simulator_click(self):

        """

        Additional method which support comparing content of multiselect labael container
        It depends if count of indexes is greater than 3 function returns string how many
        items is selected for example '5 items selected',
        otherwise function returns string containing mentioned names of permissions.

        :return: string depends how many items are selected

        """

        rows_checkboxes = self.driver.find_elements(*self.multiselect_checkbox_single)
        rows_labels = self.driver.find_elements(*self.multiselect_row_label)

        labels = []

        min_index = 0
        max_index = 35
        max_range = randint(1, 3)

        rand = sample(range(min_index, max_index), max_range)

        for i in rand:
            rows_checkboxes[i].click()
            label = rows_labels[i].text
            labels.append(label)

        if max_range > 3:
            return str(max_range) + ' items selected'
        elif max_range == 0:
            return 'Select permissions...'
        else:
            return ", ".join(labels).strip("[]")

    def single_checkbox_click(self, number):
        rows = self.driver.find_elements(*self.multiselect_checkbox_single)
        return rows[number].click()

    def close_modal_click(self):
        return self.click_element(self.modal_close_button)

    def single_permission_label(self, number):
        rows = self.driver.find_elements(*self.multiselect_row_label)
        row = rows[number].text
        return row

    def enter_search_permission(self, insert_data):
        return self.clear_and_fill_input(insert_data, self.searching_per_input)

    def clear_search_input(self):
        return self.clear_text_input(self.searching_per_input)

    def verify_elements_count_and_text_contain(self, count=1):
        result_array = []
        result_rows = self.count_of_visible_elements(*self.multiselect_row)
        result_array.append(True) if result_rows == count else result_array.append(False)
        row_elements = self.driver.find_elements(*self.multiselect_row)
        for row_element in row_elements:
            if row_element.is_displayed():
                result_array.append(row_element.text)
        return result_array

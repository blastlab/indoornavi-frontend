from pages.base_page import BasePage
from pages.maps.maps_page__utils import MapsPageUtils
from selenium.webdriver import ActionChains
import json


class MapsPagePath(BasePage, MapsPageUtils):

    def __draw_sections_helper(self, steps_num):
        """
        Function which simulate drawing path by sections.
        :param steps_num: the number of sections the line consists of
        If the 6th function is given, it draws a line that creates an intersection.
        :return:
        """
        element_image = self.wait_for_element_clickable(self.MAP_IMAGE)
        action_session = ActionChains(self.__driver)
        action_session.click(element_image)
        sections_from_file = self.get_test_paths_coordinates()

        for x in range(0, steps_num):
            x_offset = sections_from_file[str(x)][0]
            y_offset = sections_from_file[str(x)][1]
            action_session.move_by_offset(x_offset, y_offset)
            action_session.click()

        action_session.click()
        action_session.perform()

    @staticmethod
    def lines_comparison(expected_json, result_json):
        """
        Compares two lines, checks if location coordinates agree.
        The x-coordinate of first package must equal +-2px x coordinate from second package.
        :param expected_json: json which represents location of line_a
        :param result_json: json which represents location of line_b
        """
        expected_data = json.loads(expected_json)
        result_data = json.loads(result_json)

        for key_a, value_a in expected_data.items():
            for key_b, value_b in result_data.items():
                if key_a == key_b:
                    value_a_x, value_a_y = value_a[0], value_a[1]
                    value_b_x, value_b_y = value_b[0], value_b[1]

                    assert value_a_x - 2 <= value_b_x <= value_a_x + 2 and value_a_y - 2 <= value_b_y <= value_a_y + 2

    def __init__(self, driver):
        self.__driver = driver
        self.__actions = ActionChains
        super(MapsPagePath, self).__init__(self.__driver)

    def check_double_click_on_start_will_display_path(self):
        element_image = self.wait_for_element_clickable(self.MAP_IMAGE)
        action_session = ActionChains(self.__driver)
        action_session.click(element_image)
        action_session.double_click()
        action_session.perform()
        return self.is_path_disappeared()

    def click_outside_map(self):
        print(self.__driver.get_window_size())
        element_image = self.wait_for_element_clickable(self.MAP_IMAGE)
        action_session = ActionChains(self.__driver)
        action_session.click(element_image)
        action_session.move_by_offset(0, -300)
        action_session.move_by_offset(0, -150)
        action_session.click()
        action_session.perform()
        for x in range(0, 10):
            action_session.move_by_offset(10, 0)
            action_session.click()
        action_session.perform()

    def remove_all_lines(self):
        element_image = self.wait_for_element_clickable(self.MAP_IMAGE)
        action_session = ActionChains(self.__driver)
        action_session.click(element_image)
        action_session.context_click()
        action_session.perform()

        return self.click_element(self.REMOVE_ALL_LINES_BTN)

    def is_save_draft_btn_clickable(self):
        return self.wait_for_element_not_clickable(self.SAVE_DRAFT_BTN)

    def is_save_draft_label_disappeared(self):
        return self.is_element_disappear(self.SAVE_DRAFT_LABEL)

    def is_path_disappeared(self):
        return self.is_element_disappear(self.PATH_LINE), self.is_element_disappear(self.PATH_CIRCLE)

    def is_dashed_line_visible(self):
        return self.wait_for_element(self.DASHED_PATH_LINDE)

    def get_count_of_lines(self):
        return self.count_of_elements(*self.PATH_LINE)

    def prepare_devices_in_db(self):
        self.insert_sinks_to_db_from_csv()
        self.insert_anchors_to_db_from_csv()
        self.insert_devices_to_db_from_csv()

    def get_path_lines_positions(self):
        """Check for line web_element and get location"""
        lines = self.wait_for_elements(self.PATH_LINE)

        lines_json = {}
        iterator = 0

        for line in lines:
            iterator += 1
            line_attributes = []
            location_x = line.location["x"]
            location_y = line.location["y"]
            line_attributes += location_x, location_y

            lines_json["line-{0}".format(iterator)] = line_attributes

        return json.dumps(lines_json)

    def draw_path(self, sections):
        return self.__draw_sections_helper(sections)

    def is_path_displayed(self):
        return self.wait_for_element_visibility(self.PATH_LINE)

    def click_path_button(self):
        return self.click_element(self.PATHS_BTN)


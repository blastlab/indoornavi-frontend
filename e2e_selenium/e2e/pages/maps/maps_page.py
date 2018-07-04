from pages.base_page import BasePage
from locators.maps_base_locators import MapsBaseLocators
from selenium.webdriver import ActionChains
from selenium.webdriver.common.keys import Keys
import json
import time


class MapsPage(BasePage, MapsBaseLocators):

    def __init__(self, driver):
        self.__driver = driver
        self.__actions = ActionChains
        BasePage.__init__(self, self.__driver)
        MapsBaseLocators.__init__(self)

    def create_maps_db_env(self):
        return self.create_db_env(self.db_maps_env_xml)

    def floor_update_button_click(self):
        return self.click_element(self.floor_update_button)

    def upload_button_click(self):
        return self.click_element(self.upload_image_btn)

    def warning_cancel_click(self):
        return self.click_element(self.warning_close_btn)

    def is_choose_image_title_displayed(self):
        element_text = self.get_text(self.choose_image_title)
        return True if element_text == self.choose_image_string else False

    def is_choose_image_button_displayed(self):
        return self.is_element_appeared(self.choose_image_btn)

    def is_upload_area_displayed(self):
        return True if self.is_element_present(self.upload_area) else False

    def choose_image(self, path, extension='.png'):
        __btn = self.choose_image_btn
        __path = path+extension
        return self.choose_file(__btn, __path)

    def is_invalid_size_warning_present(self):
        return True if self.is_element_present(self.warning_invalid_size) else False

    def is_invalid_size_warning_disappear(self):
        return True if self.is_element_disappear(self.warning_invalid_size) else False

    def is_invalid_format_warning_present(self, extension):
        __exception_msg = 'Warning that "File with extension: '+extension+' is incorrect" has not been appeared.'
        return True if self.is_element_present(self.warning_invalid_format, msg=__exception_msg) else False

    def is_image_preview_displayed(self):

        __path = self.correct_map_path
        __service = self.service_upload(__path)
        __filename = __service.get_filename()
        __filesize = __service.get_file_size()

        self.check_title_is_correct(__filename, *self.preview_thumb)
        self.is_element_present(self.preview_close_btn)
        self.is_element_present(self.preview_thumb)
        self.check_title_is_correct(str(__filesize), *self.preview_filesize)

    def is_image_uploaded(self):
        self.is_element_present(self.uploaded_image)
        self.is_element_present(self.hint_bar)
        # self.is_element_present(self.hint_bar_scale)

    # SCALE
    def is_scale_button_displayed(self):
        return True if self.is_element_present(self.scale_button) else False

    def scale_button_click(self):
        return self.click_element(self.scale_button)

    def is_hint_bar_prompt_displayed(self):
        return True if self.is_element_present(self.hint_bar_scale_prompt) else False

    def draw_scale_line(self, x_offset, y_offset):
        """

        :param x_offset: the number of pixels needed to move the mouse cursor on the x axis
        :param y_offset: the number of pixels needed to move the mouse cursor on the y axis
        :return: action which provide to draw scale line based on params

        """
        __x_offset = x_offset
        __y_offset = y_offset
        __element_image = self.wait_for_element_clickable(self.map_image)
        __actions = ActionChains(self.__driver)

        return __actions.click(__element_image).move_by_offset(__x_offset, __y_offset).click().perform()

    def edit_scale_line(self, x_offset, y_offset, element):
        """

        :param x_offset: the number of pixels needed to drag point_b of scale on the x axis
        :param y_offset: the number of pixels needed to drag point_b of scale on the y axis
        :return: action which provide to draw scale line with changed coordinates {params}

        """
        __x_offset = x_offset
        __y_offset = y_offset
        __scale_line = self.wait_for_element_clickable(element)

        return self.__actions(self.__driver).drag_and_drop_by_offset(__scale_line, __x_offset, __y_offset).release().perform()

    def undo_scale_line_drawing(self, x_offset, y_offset, element):
        """

        :param x_offset: the number of pixels needed to drag point_b of scale on the x axis
        :param y_offset: the number of pixels needed to drag point_b of scale on the y axis
        :return: array of dictionaries with actual scale line's point_b location - [dict_a, dict_b, dict_c]

        """
        __x_offset = x_offset
        __y_offset = y_offset
        __scale_line = self.wait_for_element_clickable(element)
        start_location = self.get_location(__scale_line)

        self.__actions(self.__driver).click_and_hold(__scale_line).move_by_offset(__x_offset, __y_offset).perform()
        action_location = self.get_location(__scale_line)

        self.__actions(self.__driver).send_keys(Keys.ESCAPE).perform()
        end_scale_line = self.wait_for_element_clickable(element)
        end_location = self.get_location(end_scale_line)

        locations = [start_location, action_location, end_location]

        return locations

    @staticmethod
    def __get_coordinates(DOM_element, **kwargs):
        __coordinates = {}
        for key, param in kwargs.items():
            __coordinates[param] = DOM_element.get_attribute(param)
        return __coordinates

    @staticmethod
    def __abs_value(a, b):
        return abs(float(b)-float(a))

    def get_scale_line_parameters(self):
        """

        :return: json -{} Dictionary information of scale line drawn on the map

        """

        # SCALE LINE PARTS
        scale_line_dict = {}

        point_a = self.wait_for_element(self.scale_line_point_a)
        point_b = self.wait_for_element(self.scale_line_point_b)
        scale_line = self.wait_for_element(self.scale_line)

        point_a_params = self.__get_coordinates(point_a, x="cx", y="cy")
        point_b_params = self.__get_coordinates(point_b, x="cx", y="cy")
        scale_line_params = self.__get_coordinates(scale_line, x1="x1", x2="x2", y1="y1", y2="y2")

        scale_line_dict["scale_line"] = scale_line_params
        scale_line_dict["point_a"] = point_a_params
        scale_line_dict["point_b"] = point_b_params
        # print(scale_line_dict)
        return scale_line_dict

    def is_scale_line_drawn_correctly(self, x_offset, y_offset):

        scale_line_params = self.get_scale_line_parameters()
        expect_x = x_offset
        expect_y = y_offset

        # assert scale_line_params["point_a"][]
        point_a_cx = scale_line_params["point_a"]['cx']
        point_a_cy = scale_line_params["point_a"]['cy']
        point_b_cx = scale_line_params["point_b"]['cx']
        point_b_cy = scale_line_params["point_b"]['cy']
        line_x1 = scale_line_params["scale_line"]['x1']
        line_x2 = scale_line_params["scale_line"]['x2']
        line_y1 = scale_line_params["scale_line"]['y1']
        line_y2 = scale_line_params["scale_line"]['y2']
        # offset x - difference
        result_x = self.__abs_value(point_a_cx, point_b_cx)
        result_y = self.__abs_value(point_a_cy, point_b_cy)
        result_line_x = self.__abs_value(line_x1, line_x2)
        result_line_y = self.__abs_value(line_y1, line_y2)

        assert expect_x == result_x and expect_x == result_line_x, str(expect_x)+' is not equal '+str(result_x) + ' or '+ str(result_line_x)
        assert expect_y == result_y and expect_y == result_line_y, str(expect_y)+' is not equal '+str(result_y) + ' or '+ str(result_line_y)
        return True

    def is_scale_line_displayed(self):
        element = self.is_element_appeared(self.scale_line)
        return True if element else False

    def is_scale_line_disappear(self):
        return True if self.is_element_disappear(self.scale_line) else False

    def is_scale_modal_window_displayed(self):
        element = self.is_element_appeared(self.scale_modal_window)
        return True if element else False

    def is_scale_modal_window_disappear(self):
        return True if self.is_element_disappear(self.scale_modal_window) else False

    def enter_scale_distance(self, value):
        return self.clear_and_fill_input(value, self.scale_distance_input)

    def set_scale_measurement(self, option):

        self.click_element(self.scale_measurement)
        set_measurement = {
            'centimeters': self.scale_measurement_cent,
            'meters': self.scale_measurement_meters
        }
        return self.click_element(set_measurement[option])

    def scale_ok_button_click(self):
        ok_buttons = self.__driver.find_elements(*self.scale_ok_button)
        return ok_buttons[1].click()

    def scale_cancel_button_click(self):
        cancel_buttons = self.__driver.find_elements(*self.scale_cancel_button)
        return cancel_buttons[1].click()

    def is_scale_set_toast_present(self):
        return True if self.is_element_present(self.scale_set_toast) else False

    def is_scale_set_toast_disappear(self):
        return True if self.is_element_disappear(self.scale_set_toast) else False

    def is_draft_saved_toast_present(self):
        return True if self.is_element_present(self.draft_saved) else False

    def is_draft_saved_toast_disappear(self):
        return True if self.is_element_disappear(self.draft_saved) else False

    def is_set_measurement_toast_present(self):
        return True if self.is_element_present(self.set_measurement_toast) else False

    def is_set_measurement_toast_disappear(self):
        return True if self.is_element_disappear(self.set_measurement_toast) else False

    def is_must_be_integer_toast_present(self):
        return True if self.is_element_present(self.must_be_integer_toast) else False

    def is_must_be_integer_toast_disappear(self):
        return True if self.is_element_disappear(self.must_be_integer_toast) else False

    def get_location(self, element):
        __element_location = element.location
        return __element_location

    def log_cursor_coordinates(self):
        return self.__driver.execute_script('''
        function findScreenCoords(mouseEvent)
          {
            var xpos;
            var ypos;
            if (mouseEvent)
            {
              //FireFo
              xpos = mouseEvent.screenX;
              ypos = mouseEvent.screenY;
            }
            else
            {
              //IE
              xpos = window.event.screenX;
              ypos = window.event.screenY;
            }
            console.log("LOG COORDINATES: "+ xpos + ", " + ypos);
          }
        document.getElementById("map").onmousemove = findScreenCoords;
        ''')

    # EDIT SCALE


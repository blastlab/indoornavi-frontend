from pages.base_page import BasePage
from pages.maps.maps_page__utils import MapsPageUtils
from selenium.webdriver import ActionChains
from selenium.common.exceptions import NoSuchElementException


class MapsPageArea(BasePage, MapsPageUtils):

    def __init__(self, driver):
        self.__driver = driver
        self.__actions = ActionChains
        super(MapsPageArea, self).__init__(self.__driver)

    # CLICK TRIGGERS
    def floor_update_button_click(self):
        return self.click_element(self.floor_update_button)

    def area_button_click(self):
        return self.click_element(self.AREA_BUTTON)

    def area_confirm_click(self):
        return self.click_element(self.AREA_ADD_CONFIRM)

    def area_reject_click(self):
        return self.click_element(self.AREA_ADD_REJECT)

    def on_enter_multiselect_device_click(self):
        return self.click_element(self.AREA_ADD_ENTER_MULTISELECT)

    def on_enter_multiselect_device_close_click(self):
        return self.click_element(self.AREA_ADD_ENTER_MULTISELECT_CLOSE)

    def multiselect_item_click(self, option):
        selectors = {"ON_ENTER_123": self.AREA_ADD_ENTER_MULTISELECT_ITEM_123,
                     "ON_ENTER_456": self.AREA_ADD_ENTER_MULTISELECT_ITEM_456,
                     "ON_LEAVE_123": self.AREA_ADD_LEAVE_MULTISELECT_ITEM_123,
                     "ON_LEAVE_456": self.AREA_ADD_LEAVE_MULTISELECT_ITEM_456}
        return self.click_element(selectors[option])

    def on_leave_multiselect_device_click(self):
        return self.click_element(self.AREA_ADD_LEAVE_MULTISELECT)

    def on_leave_multiselect_device_close_click(self):
        return self.click_element(self.AREA_ADD_LEAVE_MULTISELECT_CLOSE)

    def __right_click_on_area(self):
        area = self.wait_for_element_clickable(self.AREA_ZERO_OBJECT)
        return ActionChains(self.__driver).move_to_element(area).context_click(area).perform()

    def edit_area_click(self):
        self.__right_click_on_area()
        self.click_element(self.AREA_CONTEXT_MENU_EDIT)

    def remove_area_click(self):
        self.__right_click_on_area()
        self.click_element(self.AREA_CONTEXT_MENU_REMOVE)

    # def save_draft_click(self):
    #     return self.click_element(self.SAVE_DRAFT_BTN)

    def clear_area_name_input(self):
        return self.clear_text_input(self.AREA_ADD_NAME)

    # ELEMENTS APPEARANCE

    def is_area_button_displayed(self):
        return True if self.is_element_present(self.AREA_BUTTON) else False

    def is_area_dialog_displayed(self):
        return True if self.is_element_present(self.AREA_DIALOG) else False

    def is_area_dialog_disappeared(self):
        return self.is_element_disappear(self.AREA_DIALOG)

    def is_draft_saved_toast_displayed(self):
        return True if self.is_element_appeared(self.DRAFT_SAVED_TOAST) else False

    def is_area_displayed(self):
        for x in range(0, 4):
            locator = self.__set_polygon_option(str(x))
            try:
                self.is_element_displayed(*locator)
            except NoSuchElementException:
                return False
            return True

    def is_specific_area_displayed(self, option):
        locator = self.__set_polygon_option(str(option))
        try:
          self.is_element_displayed(*locator)
        except NoSuchElementException:
          return False
        return True

    def is_area_disappeared(self):
        return self.is_element_displayed(*self.AREA_ZERO_OBJECT)

    # ENTER DATA INTO INPUT
    def enter_area_name(self):
        return self.clear_and_fill_input(self.TEST_ADD_AREA_NAME, self.AREA_ADD_NAME)

    def enter_height(self, extreme='min'):
        if extreme == 'max':
            return self.clear_and_fill_input('100', self.AREA_ADD_HEIGHT_MAX)
        else:
            return self.clear_and_fill_input('0', self.AREA_ADD_HEIGHT_MIN)

    def enter_on_enter_offset(self):
        return self.clear_and_fill_input(self.TEST_ADD_AREA_ENTER_OFFSET, self.AREA_ADD_ENTER_OFF)

    def enter_on_leave_offset(self):
        return self.clear_and_fill_input(self.TEST_ADD_AREA_LEAVE_OFFSET, self.AREA_ADD_LEAVE_OFF)

    # EDIT AREA PROPERTIES
    def edit_area_name(self):
        return self.clear_and_fill_input(self.TEST_EDIT_AREA_NAME, self.AREA_ADD_NAME)

    def edit_on_enter_offset(self):
        return self.clear_and_fill_input(self.TEST_EDIT_AREA_ENTER_OFFSET, self.AREA_ADD_ENTER_OFF)

    def edit_on_leave_offset(self):
        return self.clear_and_fill_input(self.TEST_EDIT_AREA_LEAVE_OFFSET, self.AREA_ADD_LEAVE_OFF)

    # LOGIC
    def draw_triangle(self):

        element_image = self.wait_for_element_clickable(self.MAP_IMAGE)
        action_session = ActionChains(self.__driver)
        action_session.click(element_image)
        self.draw_line(action_session, 100, 0)
        self.draw_line(action_session, -50, 100)
        self.draw_line(action_session, -50, -100)
        action_session.perform()

    def draw_square(self):

        element_image = self.wait_for_element_clickable(self.MAP_IMAGE)
        action_session = ActionChains(self.__driver)
        action_session.click(element_image)
        self.draw_line(action_session, 100, 0)
        self.draw_line(action_session, 0, -100)
        self.draw_line(action_session, -100, 0)
        self.draw_line(action_session, 0, 100)
        action_session.perform()

    def get_polygon_points(self, choose):

        polygon = self.wait_for_element(self.__set_polygon_option(choose))
        polygon_points = polygon.get_attribute("points")
        return polygon_points

    def move_polygon(self, x_offset, y_offset, choose):

        source_element = self.wait_for_element_clickable(self.__set_polygon_option(choose))
        action_session = ActionChains(self.__driver)
        action_session.drag_and_drop_by_offset(source_element, x_offset, y_offset).perform()

    def get_polygon_location(self, choose):
        polygon_location = self.wait_for_element(self.__set_polygon_option(choose)).location
        return polygon_location

    def get_area_attribute(self, attr, choose):
        area_attr = self.wait_for_element(self.__set_polygon_option(choose))
        return area_attr.get_attribute(attr)

    def __get_area_property(self, selector, attr):
        selector_property = self.wait_for_element(selector).get_attribute(attr)
        return selector_property

    def get_area_properties(self):
        area_properties = {}
        area_properties['name']          = self.__get_area_property(self.AREA_ADD_NAME, 'value')
        area_properties['enter_offset']  = self.__get_area_property(self.AREA_ADD_ENTER_OFF, 'value')
        area_properties['leave_offset']  = self.__get_area_property(self.AREA_ADD_LEAVE_OFF, 'value')
        area_properties['height_min']    = self.__get_area_property(self.AREA_ADD_HEIGHT_MIN, 'value')
        area_properties['height_max']    = self.__get_area_property(self.AREA_ADD_HEIGHT_MAX, 'value')
        area_properties['on_enter_tags'] = self.get_text(self.AREA_ADD_ENTER_MULTISELECT)
        area_properties['on_leave_tags'] = self.get_text(self.AREA_ADD_LEAVE_MULTISELECT)
        # area_properties['points'] = self.get_polygon_points('0')
        return area_properties

    def __set_polygon_option(self, choose):
        set_option = {
            '3': self.AREA_NEW_OBJECT,
            '2': self.AREA_NEW_POLYGON,
            '1': self.AREA_ONE_POLYGON,
            '0': self.AREA_ZERO_POLYGON
        }
        return set_option[choose]

    @staticmethod
    def draw_line(action_session, x_offset, y_offset):
        return action_session.move_by_offset(x_offset, y_offset).click()

    def edit_polygon_point(self, x_offset, y_offset, element):
        """

        :param x_offset: the number of pixels needed to drag point_b of scale on the x axis
        :param y_offset: the number of pixels needed to drag point_b of scale on the y axis
        :return: action which provide to draw scale line with changed coordinates {params}

        """
        scale_line = self.wait_for_element_clickable(element)

        return self.__actions(self.__driver).drag_and_drop_by_offset(scale_line, x_offset, y_offset).release().perform()

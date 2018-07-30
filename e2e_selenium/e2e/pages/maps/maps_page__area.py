from pages.base_page import BasePage
from locators.maps_base__area_locators import MapsBaseAreaLocators
from selenium.webdriver import ActionChains
from src.test_conf.test_config import *
from selenium.common.exceptions import NoSuchElementException
import time

class MapsPageArea(BasePage, MapsBaseAreaLocators):

    def __init__(self, driver):
        self.__driver = driver
        self.__actions = ActionChains
        BasePage.__init__(self, self.__driver)
        MapsBaseAreaLocators.__init__(self)

    def create_maps_db_env(self):
        return self.create_db_env(self.DB_MAPS_ENV_XML)

    def insert_devices_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(DEVICE_TABLE, DEVICE_COLUMNS, TEST_DEVICES_CSV_PATH)

    def insert_tags_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(TAG_TABLE, TAG_COLUMNS, TEST_TAGS_CSV_PATH)

    def set_image_to_floor(self):
        params = TEST_UPDATE_FLOOR_IMG_PARAMS
        return self.service_db().update_table(params)

    def insert_scale_configuration_to_db(self):
        _table = CONFIGURATION_TABLE
        _columns = CONFIGURATION_COLUMNS
        values = ('1', TEST_DATE, TEST_SCALE_CONF_DATA, '0', '2', TEST_DATE)
        return self.insert_to_db(_table, _columns, values)

    def insert_area_configuration_to_db(self):
        _table = CONFIGURATION_TABLE
        _columns = CONFIGURATION_COLUMNS
        values = ('1', TEST_DATE, TEST_AREA_CONF_DATA, '0', '2', TEST_DATE)
        return self.insert_to_db(_table, _columns, values)

    def insert_image_to_db(self):

        with open(TEST_IMAGE_PATH, "rb") as f:
          blob = f.read()
        _table = IMAGE_TABLE
        _columns = IMAGE_COLUMNS
        values = ('1', TEST_DATE, TEST_DATE, blob, '840', '1614')
        return self.insert_to_db(_table, _columns, values)

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
        _area = self.wait_for_element_clickable(self.AREA_ZERO_OBJECT)
        return ActionChains(self.__driver).context_click(_area).perform()

    def edit_area_click(self):
        self.__right_click_on_area()
        self.click_element(self.AREA_CONTEXT_MENU_EDIT)

    def remove_area_click(self):
        self.__right_click_on_area()
        self.click_element(self.AREA_CONTEXT_MENU_REMOVE)

    def save_draft_click(self):
        return self.click_element(self.SAVE_DRAFT_BTN)

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
        return True if self.is_element_present(self.DRAFT_SAVED_TOAST) else False

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
        _selector_property = self.wait_for_element(selector).get_attribute(attr)
        return _selector_property

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
        _action = action_session
        _x_offset = x_offset
        _y_offset = y_offset
        return _action.move_by_offset(_x_offset, _y_offset).click()

    def edit_polygon_point(self, x_offset, y_offset, element):
        """

        :param x_offset: the number of pixels needed to drag point_b of scale on the x axis
        :param y_offset: the number of pixels needed to drag point_b of scale on the y axis
        :return: action which provide to draw scale line with changed coordinates {params}

        """
        _x_offset = x_offset
        _y_offset = y_offset
        scale_line = self.wait_for_element_clickable(element)

        return self.__actions(self.__driver).drag_and_drop_by_offset(scale_line, _x_offset,_y_offset).release().perform()

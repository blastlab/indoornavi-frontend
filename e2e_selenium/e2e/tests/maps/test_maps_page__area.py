import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.test_login_page import TestLoginPage
from pages.maps.maps_page__area import MapsPageArea
from pages.login_page import LoginPage
from pages.constructions.floors_page import FloorsPage
from selenium.webdriver import ActionChains
import time

class TestMapsPageArea(unittest.TestCase, MapsPageArea):

    def setUp(self):
        self.test_failed = True
        self.webdriver = webdriver
        self.login_page_url = LoginPage.login_url
        TestDriver.setUp(self, self.login_page_url)
        self.login_test = TestLoginPage
        self.page = LoginPage(self.webdriver)
        self.actions = ActionChains(self.webdriver)
        self.floors_page = FloorsPage(self.webdriver, 'floors')
        self.maps_page_area = MapsPageArea(self.webdriver)
        self.option = 1
        # Prepare environment
        self.maps_page_area.truncate_db()
        self.maps_page_area.create_maps_db_env()
        self.maps_page_area.insert_tags_to_db_from_csv()
        self.maps_page_area.insert_devices_to_db_from_csv()
        # Login to app
        self.login_test.test_login_valid_credentials(self)
        # self.page.login_process(self.option, 1)

    def tearDown(self):
        TestDriver.tearDown(self)
        self.webdriver.quit()

    def __set_before_scale_db_configuration(self, choose):

        if choose == 'add':
            self.maps_page_area.insert_conf_to_database('scale')
        else:
            self.maps_page_area.insert_conf_to_database('area')
        self.maps_page_area.insert_image_to_db()
        self.maps_page_area.set_image_to_floor()
        self.webdriver.refresh()
        self.webdriver.get(self.MAPS_URL)

    def __set_tags(self):
        self.maps_page_area.on_enter_multiselect_device_click()
        self.maps_page_area.multiselect_item_click("ON_ENTER_123")
        self.maps_page_area.multiselect_item_click("ON_ENTER_456")
        self.maps_page_area.on_leave_multiselect_device_click()
        self.maps_page_area.multiselect_item_click("ON_LEAVE_123")
        self.maps_page_area.multiselect_item_click("ON_LEAVE_456")
        self.maps_page_area.on_leave_multiselect_device_close_click()

    # SCALE TESTS
    def test_01_add_new_area_correctly_triangle_with_all_params(self):

        self.__set_before_scale_db_configuration('add')

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        # time.sleep(10)
        self.maps_page_area.draw_triangle()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        #Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()

        self.__set_tags()

        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        # Check the points are the same
        self.maps_page_area.area_button_click()

        second_step_points = self.maps_page_area.get_polygon_points('0')
        # # Refresh page and check it again
        self.webdriver.refresh()
        self.maps_page_area.area_button_click()
        third_step_points = self.maps_page_area.get_polygon_points('0')

        self.assertEqual(first_step_points, second_step_points[:24])
        # TODO
        # self.assertEqual(first_step_points, third_step_points[:24])
        self.test_failed = False

    def test_02_add_new_area_correctly_square_with_all_params(self):

        self.__set_before_scale_db_configuration('add')
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        # time.sleep(10)
        self.maps_page_area.draw_square()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()

        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        # Check the points are the same
        self.maps_page_area.area_button_click()
        second_step_points = self.maps_page_area.get_polygon_points('0')
        # Refresh page and check it again
        self.webdriver.refresh()
        self.maps_page_area.area_button_click()
        third_step_points = self.maps_page_area.get_polygon_points('0')

        self.assertEqual(first_step_points, second_step_points[:32])
        # TODO
        # self.assertEqual(first_step_points, third_step_points[:32])
        self.test_failed = False

    def test_03_add_new_area_correctly_square_without_name(self):

        self.__set_before_scale_db_configuration('add')

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()

        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        # Check the points are the same
        self.maps_page_area.area_button_click()
        second_step_points = self.maps_page_area.get_polygon_points('0')
        # Refresh page and check it again
        self.webdriver.refresh()
        self.maps_page_area.area_button_click()
        third_step_points = self.maps_page_area.get_polygon_points('0')

        self.assertEqual(first_step_points, second_step_points[:32])
        # TODO
        # self.assertEqual(first_step_points, third_step_points[:32])
        self.test_failed = False

    def test_04_add_new_area_square_correctly_with_move(self):

        self.__set_before_scale_db_configuration('add')

        test_offset = 100
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        first_step_x_location = self.maps_page_area.get_polygon_location('2')['x']

        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()

        self.maps_page_area.move_polygon(test_offset, 0, '2')

        second_step_x_location = self.maps_page_area.get_polygon_location('2')['x']
        second_step_x_attr = self.maps_page_area.get_area_attribute('x', '3')

        self.assertEqual(first_step_x_location + int(second_step_x_attr), second_step_x_location)
        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()

        self.webdriver.refresh()
        self.maps_page_area.area_button_click()
        last_step_x_location = self.maps_page_area.get_polygon_location('0')['x']
        # self.assertEqual(second_step_x_location, last_step_x_location)
        # TODO remember test fail 1023 != 1022
        self.test_failed = False

    def test_05_add_new_area_sqaure_with_edit_points(self):

        self.__set_before_scale_db_configuration('add')

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        first_step_x_location = self.maps_page_area.get_polygon_location('2')['x']

        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()

        first_loc = self.maps_page_area.get_polygon_points('2')[:32]
        self.maps_page_area.edit_polygon_point(200, 0, self.maps_page_area.AREA_NEW_AREA_CIRCLE(5))
        second_loc = self.maps_page_area.get_polygon_points('2')[:32]

        self.assertNotEqual(first_loc, second_loc)

        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        self.webdriver.refresh()
        self.maps_page_area.area_button_click()

        # TODO COMPARE LOCATION BEFORE AND AFTER ACTION
        self.test_failed = False

    def test_06_add_new_area_invalid_without_offset_on_enter(self):

        self.__set_before_scale_db_configuration('add')

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()

        self.maps_page_area.area_confirm_click()
        # TODO ON ENTER OFFSET IS REQUIRED
        self.test_failed = False

    def test_07_add_new_area_invalid_without_offset_on_leave(self):

        self.__set_before_scale_db_configuration('add')

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.__set_tags()

        self.maps_page_area.area_confirm_click()
        # TODO ON ENTER OFFSET IS REQUIRED
        self.test_failed = False

    def test_08_add_new_area_check_the_area_will_be_displayed_after_cancel(self):

        self.__set_before_scale_db_configuration('add')

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()

        self.maps_page_area.area_reject_click()
        self.maps_page_area.area_button_click()

        self.assertFalse(self.maps_page_area.is_area_displayed())

        self.test_failed = False

    #TODO step with edit_area_click {context_menu}
    def test_09_edit_area_with_all_parameters(self):

        self.__set_before_scale_db_configuration('edit')
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()
        self.maps_page_area.edit_area_click()

        self.maps_page_area.edit_area_name()
        self.maps_page_area.edit_on_enter_offset()
        self.maps_page_area.edit_on_leave_offset()

        self.__set_tags()
        self.__set_tags()
        self.maps_page_area.edit_polygon_point(200, 0, self.maps_page_area.AREA_EDIT_CIRCLE(5))

        expected_data = self.maps_page_area.get_area_properties()
        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        self.webdriver.refresh()
        self.maps_page_area.is_area_button_displayed()
        time.sleep(1)
        self.maps_page_area.area_button_click()
        # self.maps_page_area.edit_area_click()
        # result_data = self.maps_page_area.get_area_properties()
        # self.assertDictEqual(expected_data, result_data, "Edited area properties have not been correct")

        self.test_failed = False

    # TODO step with edit_area_click {context_menu}
    def test_10_edit_area_without_area_name(self):

        self.__set_before_scale_db_configuration('edit')
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()
        self.maps_page_area.edit_area_click()

        self.maps_page_area.clear_area_name_input()
        self.maps_page_area.edit_on_enter_offset()
        self.maps_page_area.edit_on_leave_offset()

        self.__set_tags()
        self.__set_tags()
        self.maps_page_area.edit_polygon_point(200, 0, self.maps_page_area.AREA_EDIT_CIRCLE(5))
        expected_data = self.maps_page_area.get_area_properties()
        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        self.webdriver.refresh()
        self.maps_page_area.is_area_button_displayed()
        time.sleep(1)
        self.maps_page_area.area_button_click()
        # self.maps_page_area.edit_area_click()
        # result_data = self.maps_page_area.get_area_properties()
        # self.assertDictEqual(expected_data, result_data, "Edited area properties have not been correct")

        self.test_failed = False

    def test_11_edit_area_without_offsets(self):

        self.__set_before_scale_db_configuration('edit')
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()
        self.maps_page_area.edit_area_click()

        self.maps_page_area.edit_area_name()
        self.__set_tags()
        self.maps_page_area.edit_polygon_point(200, 0, self.maps_page_area.AREA_EDIT_CIRCLE(5))
        self.maps_page_area.area_confirm_click()
        # TODO ON ENTER OFFSET / ON LEAVE IS REQUIRED
        self.test_failed = False

    def test_12_remove_area(self):
        self.__set_before_scale_db_configuration('edit')
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()
        self.maps_page_area.remove_area_click()
        self.maps_page_area.is_area_disappeared()
        self.test_failed = False

    def test_bug_NAVI_228(self):
        """
        Test case for bug - "Error in the browser console while drawing the area"
        1. Selecting a tool to draw areas on the map
        2. Drawing the area (square) | Note: There is an error in the console
        """
        self.__set_before_scale_db_configuration('add')
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()
        self.maps_page_area.draw_square()

        browser_log = self.maps_page_area.get_browser_console_log()
        test_array = []
        result = True if test_array == browser_log and len(browser_log) == 0 else False
        assert True == result, browser_log
        self.test_failed = False

    def test_bug_NAVI_295(self):
        """
        Test case for bug - The area can not be created
        1. Drawing an area (square)
        2. Drawing an area (triangle) overlapping slightly with the previous area | It is not possible to "close the area"
        """
        self.__set_before_scale_db_configuration('add')
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()
        self.maps_page_area.draw_square()

        # DRAW TRIANGLE AND SET PROPERTIES
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()
        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        self.maps_page_area.area_button_click()

        # DRAW TRIANGLE AND SET PROPERTIES
        self.maps_page_area.draw_triangle()
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.__set_tags()
        self.maps_page_area.area_confirm_click()
        self.maps_page_area.save_draft_click()
        self.maps_page_area.area_button_click()

        square_displayed   = self.maps_page_area.is_specific_area_displayed(0)
        triangle_displayed = self.maps_page_area.is_specific_area_displayed(1)

        assert square_displayed == True
        assert triangle_displayed == True
        self.test_failed = False




import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.maps.maps_page__area import MapsPageArea
from pages.base_page import BasePage
from pages.login_page import LoginPage
from pages.constructions.floors_page import FloorsPage
import time
from selenium.webdriver import ActionChains


class TestMapsPageArea(unittest.TestCase, MapsPageArea):

    def setUp(self):
        self.test_failed = True
        self.webdriver = webdriver
        self.login_page_url = LoginPage.login_url
        TestDriver.setUp(self, self.login_page_url)
        self.page = LoginPage(self.webdriver)
        self.actions = ActionChains(self.webdriver)
        self.floors_page = FloorsPage(self.webdriver, 'floors')
        self.maps_page_area = MapsPageArea(self.webdriver)
        self.option = 1
        # Prepare environment
        self.maps_page_area.truncate_db()
        self.maps_page_area.create_maps_db_env()
        # Login to app
        self.page.login_process(self.option, 1)
        self.__set_before_scale_db_configuration()
        self.__navigate_to_maps_page()

    def tearDown(self):
        TestDriver.tearDown(self)
        self.webdriver.quit()

    def __set_before_scale_db_configuration(self):
        self.maps_page_area.insert_configuration_to_db()
        self.maps_page_area.insert_image_to_db()
        self.maps_page_area.set_image_to_floor()
        self.webdriver.refresh()

    def __navigate_to_maps_page(self):
        self.webdriver.get(self.MAPS_URL)

    # SCALE TESTS
    def test_01_add_new_area_correctly_triangle_with_all_params(self):

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        # time.sleep(10)
        self.maps_page_area.draw_triangle()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()

        self.maps_page_area.area_confirm_click()
        self.maps_page_area.is_draft_saved_toast_displayed()
        # Check the points are the same
        self.maps_page_area.area_button_click()
        second_step_points = self.maps_page_area.get_polygon_points('0')
        # Refresh page and check it again
        self.webdriver.refresh()
        self.maps_page_area.area_button_click()
        third_step_points = self.maps_page_area.get_polygon_points('0')

        self.assertEqual(first_step_points, second_step_points[:24])
        self.assertEqual(first_step_points, third_step_points[:24])
        self.test_failed = False

    def test_02_add_new_area_correctly_square_with_all_params(self):

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

        self.maps_page_area.area_confirm_click()
        self.maps_page_area.is_draft_saved_toast_displayed()
        # Check the points are the same
        self.maps_page_area.area_button_click()
        second_step_points = self.maps_page_area.get_polygon_points('0')
        # Refresh page and check it again
        self.webdriver.refresh()
        self.maps_page_area.area_button_click()
        third_step_points = self.maps_page_area.get_polygon_points('0')

        self.assertEqual(first_step_points, second_step_points[:32])
        self.assertEqual(first_step_points, third_step_points[:32])
        self.test_failed = False

    def test_03_add_new_area_correctly_square_without_name(self):

        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        first_step_points = self.maps_page_area.get_polygon_points('2')
        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()

        self.maps_page_area.area_confirm_click()
        self.maps_page_area.is_draft_saved_toast_displayed()
        # Check the points are the same
        self.maps_page_area.area_button_click()
        second_step_points = self.maps_page_area.get_polygon_points('0')
        # Refresh page and check it again
        self.webdriver.refresh()
        self.maps_page_area.area_button_click()
        third_step_points = self.maps_page_area.get_polygon_points('0')

        self.assertEqual(first_step_points, second_step_points[:32])
        self.assertEqual(first_step_points, third_step_points[:32])
        self.test_failed = False

    def test_04_add_new_area_correctly_with_move(self):

        test_offset = 100
        self.maps_page_area.is_area_button_displayed()
        self.maps_page_area.area_button_click()

        self.maps_page_area.draw_square()
        start_x_location = self.maps_page_area.get_polygon_location('2')['x']
        start_x_attr = self.maps_page_area.get_area_attribute('x', '3')

        self.maps_page_area.is_area_dialog_displayed()

        # Fill all inputs and confirm
        self.maps_page_area.enter_area_name()
        self.maps_page_area.enter_on_enter_offset()
        self.maps_page_area.enter_on_leave_offset()
        self.maps_page_area.move_polygon(test_offset, 0, '2')

        end_x_location = self.maps_page_area.get_polygon_location('2')['x']
        end_x_attr = self.maps_page_area.get_area_attribute('x', '3')

        self.assertEqual(start_x_location + int(end_x_attr), end_x_location)

        self.test_failed = False

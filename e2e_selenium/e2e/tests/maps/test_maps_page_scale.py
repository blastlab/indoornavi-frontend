import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.maps.maps_page import MapsPage
from pages.base_page import BasePage
from pages.login_page import LoginPage
from pages.constructions.floors_page import FloorsPage
import time
from selenium.webdriver import ActionChains


class TestMapsPageScale(unittest.TestCase, MapsPage):

    def setUp(self):
        self.test_failed = True
        self.webdriver = webdriver
        self.login_page_url = LoginPage.login_url
        TestDriver.setUp(self, self.login_page_url)
        self.page = LoginPage(self.webdriver)
        self.actions = ActionChains(self.webdriver)
        self.floors_page = FloorsPage(self.webdriver, 'floors')
        self.maps_page = MapsPage(self.webdriver)
        self.option = 1
        # Prepare environment
        self.maps_page.truncate_db()
        self.maps_page.create_maps_db_env()
        # Login to app
        self.page.login_process(self.option, 1)
        self.__get_maps_page()

    def tearDown(self):
        TestDriver.tearDown(self)
        print('\nTEST STATUS: ' + str(self.test_failed))
        self.webdriver.quit()

    def __set_before_scale_db_configuration(self):
        self.maps_page.insert_configuration_to_db()
        self.maps_page.insert_image_to_db()
        self.maps_page.set_image_to_floor()
        self.webdriver.refresh()
        time.sleep(3)
        self.maps_page.scale_button_click()
        self.assertTrue(self.maps_page.is_scale_line_displayed())

    def __add_scale_process_correctly(self, x, y, measurement, distance):

        self.maps_page.choose_image(self.maps_page.correct_map_path)
        # Check thumb, filesize, filename, close btn appeared - preview
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()
        self.maps_page.scale_button_click()
        # Logic
        self.maps_page.draw_scale_line(x, y)
        self.assertTrue(self.maps_page.is_scale_line_drawn_correctly(x, y))
        self.assertTrue(self.maps_page.is_scale_modal_window_displayed())

        self.maps_page.enter_scale_distance(distance)
        self.maps_page.set_scale_measurement(measurement)
        self.assertTrue(self.maps_page.is_scale_line_drawn_correctly(x, y))
        self.maps_page.scale_ok_button_click()

        # Check components are displayed
        self.assertTrue(self.maps_page.is_scale_set_toast_present())
        # self.assertTrue(self.maps_page.is_saving_draft_info_present())
        self.assertTrue(self.maps_page.is_scale_set_toast_disappear())
        # self.assertTrue(self.maps_page.is_saving_draft_info_disappear())
        time.sleep(5)
        self.webdriver.refresh()
        # self.assertTrue(self.maps_page.is_scale_button_displayed())
        self.maps_page.scale_button_click()
        self.assertTrue(self.maps_page.is_scale_line_displayed())
        self.test_failed = False

    def __add_scale_process_invalid(self, **kwargs):

        self.maps_page.choose_image(self.maps_page.correct_map_path)
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()
        self.maps_page.scale_button_click()
        self.maps_page.draw_scale_line(333, 222)
        self.assertTrue(self.maps_page.is_scale_line_drawn_correctly(333, 222))
        self.assertTrue(self.maps_page.is_scale_modal_window_displayed())

        if kwargs.get('distance') is not None:

            if kwargs['distance'].isdigit():
                self.maps_page.enter_scale_distance(kwargs['distance'])
                self.maps_page.scale_ok_button_click()
                self.assertTrue(self.maps_page.is_set_measurement_toast_present())
                self.assertTrue(self.maps_page.is_set_measurement_toast_disappear())
            else:
                self.maps_page.enter_scale_distance(kwargs['distance'])
                self.maps_page.set_scale_measurement(kwargs['measurement'])
                self.maps_page.scale_ok_button_click()
                self.assertTrue(self.maps_page.is_must_be_integer_toast_present())
                self.assertTrue(self.maps_page.is_must_be_integer_toast_disappear())

        else:
            self.maps_page.set_scale_measurement(kwargs['measurement'])
            self.maps_page.scale_ok_button_click()
            self.assertTrue(self.maps_page.is_must_be_integer_toast_present())
            self.assertTrue(self.maps_page.is_must_be_integer_toast_disappear())

        self.test_failed = False

    def __edit_scale_process_helper(self):
        self.maps_page.scale_ok_button_click()
        self.assertTrue(self.maps_page.is_scale_set_toast_present())
        # self.assertTrue(self.maps_page.is_saving_draft_info_present())
        self.assertTrue(self.maps_page.is_scale_set_toast_disappear())
        time.sleep(5)
        # self.assertTrue(self.maps_page.is_saving_draft_info_disappear())
        self.webdriver.refresh()
        # self.assertTrue(self.maps_page.is_scale_button_displayed())
        self.maps_page.scale_button_click()

    def __get_maps_page(self):

        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()

        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()

        assert self.floors_page.multi_assertion()
        self.maps_page.floor_update_button_click()

    # SCALE TESTS
    def test_01_add_scale_straight_line(self):

        self.__add_scale_process_correctly(400, 0, 'centimeters', '725')

    def test_02_add_scale_diagonal_line(self):

        self.__add_scale_process_correctly(200, 100, 'centimeters', '425')

    def test_03_add_scale_with_meters(self):

        self.__add_scale_process_correctly(400, 0, 'meters', '995')

    def test_04_add_scale_process_invalid_without_units(self):
        self.__add_scale_process_invalid(distance='777', measurement=None)

    def test_05_add_scale_process_invalid_without_distance(self):
        self.__add_scale_process_invalid(distance=None, measurement='meters')

    def test_06_add_scale_process_invalid_letters_into_input(self):
        self.__add_scale_process_invalid(distance='+++++', measurement='meters')

    def test_07_cancel_add_scale_process(self):

        self.maps_page.choose_image(self.maps_page.correct_map_path)
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()
        self.maps_page.scale_button_click()
        self.maps_page.draw_scale_line(333, 222)
        self.assertTrue(self.maps_page.is_scale_line_drawn_correctly(333, 222))
        self.assertTrue(self.maps_page.is_scale_modal_window_displayed())
        self.maps_page.enter_scale_distance('*test*()!#+_+')
        self.maps_page.set_scale_measurement('centimeters')
        self.maps_page.scale_cancel_button_click()
        self.assertTrue(self.maps_page.is_scale_line_disappear())
        self.assertTrue(self.maps_page.is_scale_modal_window_disappear())
        self.test_failed = False

    def test_08_edit_scale_correctly_change_distance(self):
        self.maps_page.insert_configuration_to_db()
        self.maps_page.insert_image_to_db()
        self.maps_page.set_image_to_floor()
        self.webdriver.refresh()
        time.sleep(3)

        self.maps_page.scale_button_click()
        self.assertTrue(self.maps_page.is_scale_line_displayed())
        expected_distance = self.maps_page.edit_scale_distance
        self.maps_page.enter_scale_distance(expected_distance)
        self.__edit_scale_process_helper()

        # MAIN ASSERTS
        result_distance = self.maps_page.get_value(self.maps_page.scale_distance_input)
        self.assertEqual(result_distance, expected_distance)
        self.test_failed = False

    def test_09_edit_scale_correctly_change_units(self):

        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()

        # # MAIN ASSERTS
        result_measurement = self.maps_page.get_text(self.maps_page.scale_measurement)
        self.assertEqual(result_measurement, 'METERS')
        self.test_failed = False

    def test_10_edit_scale_correctly_units_and_distance(self):
        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        expected_distance = self.maps_page.edit_scale_distance
        self.maps_page.enter_scale_distance(expected_distance)
        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()

        # MAIN ASSERTS
        result_measurement = self.maps_page.get_text(self.maps_page.scale_measurement)
        result_distance = self.maps_page.get_value(self.maps_page.scale_distance_input)
        self.assertEqual(result_measurement, 'METERS')
        self.assertEqual(result_distance, expected_distance)
        self.test_failed = False

    def test_11_edit_scale_change_line_length(self):
        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()
        self.maps_page.edit_scale_line(100, 0, self.maps_page.scale_line_point_b)
        time.sleep(3)
        # MAIN ASSERTS
        self.__edit_scale_process_helper()
        result_measurement = self.maps_page.get_text(self.maps_page.scale_measurement)
        self.assertEqual(result_measurement, 'METERS')
        self.test_failed = False

    def test_12_edit_scale_change_params(self):
        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        expected_distance = self.maps_page.edit_scale_distance
        self.maps_page.enter_scale_distance(expected_distance)
        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()
        self.maps_page.edit_scale_line(200, 100, self.maps_page.scale_line_point_b)
        time.sleep(3)
        # MAIN ASSERTS
        self.__edit_scale_process_helper()
        result_measurement = self.maps_page.get_text(self.maps_page.scale_measurement)
        result_distance = self.maps_page.get_value(self.maps_page.scale_distance_input)
        self.assertEqual(result_measurement, 'METERS')
        self.assertEqual(result_distance, expected_distance)
        self.test_failed = False

    def test_13_case_new_feature_undo_click_in_edit_scale(self):
        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()
        result = self.maps_page.undo_scale_line_drawing(200, 100, self.maps_page.scale_line_point_b)

        assert result[0] != result[1]

        self.assertDictEqual(result[0], result[2])

    def test_14_case_bug_undo_scale_line_disappeared(self):

        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()
        result = self.maps_page.undo_scale_line_drawing(200, 100, self.maps_page.scale_line_point_b)

        # check the console log is empty
        self.assertFalse(self.maps_page.get_browser_console_log())
        # check the line is presented
        self.assertTrue(self.maps_page.is_scale_line_displayed())

        assert result[0] != result[1]

        self.assertDictEqual(result[0], result[2])

    def test_15_case_bug_undo_scale_line_cannot_repeat_drawing(self):

        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()
        result = self.maps_page.undo_scale_line_drawing(200, 100, self.maps_page.scale_line_point_b)

        assert result[0] != result[1]

        self.assertDictEqual(result[0], result[2])

        self.assertTrue(self.maps_page.is_scale_line_displayed())
        self.maps_page.scale_cancel_button_click()
        self.maps_page.is_scale_modal_window_disappear()
        self.maps_page.scale_button_click()
        self.assertTrue(self.maps_page.is_scale_line_displayed())

        element = self.maps_page.identify_element(*self.maps_page.scale_line_point_b)
        location = self.maps_page.get_location(element)

        self.assertDictEqual(result[0], location)


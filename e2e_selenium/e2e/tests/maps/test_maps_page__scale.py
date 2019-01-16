import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.test_login_page import TestLoginPage
from pages.maps.maps_page__scale import MapsPageScale
from pages.login_page import LoginPage
from pages.constructions.floors_page import FloorsPage
import time
import logging
from selenium.webdriver import ActionChains


class TestMapsPageScale(unittest.TestCase, MapsPageScale):

    def setUp(self):
        self.test_failed = True
        self.webdriver = webdriver
        self.login_page_url = LoginPage.login_url
        TestDriver.setUp(self, self.login_page_url)
        self.login_test = TestLoginPage
        self.page = LoginPage(self.webdriver)
        self.actions = ActionChains(self.webdriver)
        self.floors_page = FloorsPage(self.webdriver, 'floors')
        self.maps_page = MapsPageScale(self.webdriver)
        self.option = 1
        # Prepare environment
        log_setup = logging.getLogger(' SETUP ')

        log_setup.info('Step 1 : Truncate db')
        self.maps_page.truncate_db()

        log_setup.info('Step 2 : Create maps db env')
        self.maps_page.create_maps_db_env()
        # Login to app
        # self.page.login_process(self.option, 1)
        log_setup.info('Step 3 : Login to app with valid credentials')
        self.login_test.test_login_valid_credentials(self)
        log_setup.info('Step 4 - HELPER: Go to maps page')
        self.__get_maps_page()

    def tearDown(self):
        TestDriver.tearDown(self)
        self.webdriver.quit()

    def __set_before_scale_db_configuration(self):
        set_before = logging.getLogger(' SETUP ')

        set_before.info('Step 1: Insert scale configuration to database')
        self.maps_page.insert_conf_to_database('scale')

        set_before.info('Step 2: Insert image to database')
        self.maps_page.insert_image_to_db()

        set_before.info('Step 3: Set image to floor')
        self.maps_page.set_image_to_floor()

        set_before.info('Step 4: Refresh page')
        self.webdriver.refresh()

        set_before.info('Step 4: Check scale button is displayed')
        self.assertTrue(self.maps_page.is_scale_button_displayed())

        set_before.info('Step 5 : Scale Button click')
        self.maps_page.scale_button_click()

        set_before.info('Step 6 : Scale Modal window ' + self.__class__.__name__)
        self.assertTrue(self.maps_page.is_scale_modal_window_displayed())

        set_before.info('Step 7 : Scale Line is displayed' + self.__class__.__name__)
        self.assertTrue(self.maps_page.is_scale_line_displayed())

    def __add_scale_process_correctly(self, x, y, measurement, distance):
        scale_logger = logging.getLogger(' -- SCALE PROCCESS -- ')

        scale_logger.info('Step 1: Insert image to database')
        self.maps_page.insert_image_to_db()

        scale_logger.info('Step 2: Set image to floor')
        self.maps_page.set_image_to_floor()

        scale_logger.info('Step 3: Refresh Page')
        self.webdriver.refresh()

        scale_logger.info('Step 4: Check scale button is displayed')
        self.assertTrue(self.maps_page.is_scale_button_displayed())

        scale_logger.info('Step 5: Scale button click')
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
        # self.assertTrue(self.maps_page.is_scale_set_toast_present())
        # self.assertTrue(self.maps_page.is_saving_draft_info_present())
        # self.assertTrue(self.maps_page.is_scale_set_toast_disappear())
        # self.assertTrue(self.maps_page.is_saving_draft_info_disappear())
        time.sleep(5)
        self.webdriver.refresh()
        time.sleep(1)
        # self.assertTrue(self.maps_page.is_scale_button_displayed())
        self.maps_page.scale_button_click()
        self.assertTrue(self.maps_page.is_scale_line_displayed())
        self.test_failed = False

    def __add_scale_process_invalid(self, **kwargs):

        self.maps_page.insert_image_to_db()
        self.maps_page.set_image_to_floor()
        self.webdriver.refresh()
        self.assertTrue(self.maps_page.is_scale_button_displayed())

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

        logger = logging.getLogger(' -- GET MAPS PAGE -- ')

        logger.info('Step 1: Go to complexes page')
        self.webdriver.get(self.base_url+"/complexes")

        logger.info('Step 2: Check redirect button is clickable - click redirect button')
        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()

        logger.info('Step 3: Check redirect button is clickable - click redirect button')
        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()

        logger.info('Step 4: Check multi assertion and floor update click ')
        assert self.floors_page.multi_assertion()
        self.maps_page.floor_update_button_click()

    # SCALE TESTS
    def test_01_add_scale_straight_line(self):

        self.__add_scale_process_correctly(400, 0, 'centimeters', '725')

    def test_02_add_scale_diagonal_line(self):

        self.__add_scale_process_correctly(200, 100, 'centimeters', '425')

    def test_03_add_scale_with_meters(self):

        self.__add_scale_process_correctly(400, 0, 'meters', '995')

    # DEPRACATED
    # def test_04_add_scale_process_invalid_without_units(self):
    #     self.__add_scale_process_invalid(distance='777', measurement=None)

    def test_05_add_scale_process_invalid_without_distance(self):
        self.__add_scale_process_invalid(distance=None, measurement='meters')

    def test_06_add_scale_process_invalid_letters_into_input(self):
        self.__add_scale_process_invalid(distance='+++++', measurement='meters')

    def test_07_cancel_add_scale_process(self):

        self.maps_page.insert_image_to_db()
        self.maps_page.set_image_to_floor()
        self.webdriver.refresh()
        self.assertTrue(self.maps_page.is_scale_button_displayed())

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

    def _test_08_edit_scale_correctly_change_distance(self):

        self.__set_before_scale_db_configuration()

        expected_distance = self.maps_page.edit_scale_distance
        self.maps_page.enter_scale_distance(expected_distance)
        self.__edit_scale_process_helper()

        # MAIN ASSERTS
        result_distance = self.maps_page.get_value(self.maps_page.scale_distance_input)
        self.assertEqual(result_distance, expected_distance)
        self.test_failed = False

    def _test_09_edit_scale_correctly_change_units(self):

        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()

        # MAIN ASSERTS
        result_measurement = self.maps_page.get_text(self.maps_page.scale_measurement)
        self.assertEqual(result_measurement, 'METERS')
        self.test_failed = False

    def _test_10_edit_scale_correctly_units_and_distance(self):
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

    def _test_11_edit_scale_change_line_length(self):
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

    def _test_12_edit_scale_change_params(self):
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

    def _test_13_case_new_feature_undo_click_in_edit_scale(self):
        # SET CONFIGURATION
        self.__set_before_scale_db_configuration()

        self.maps_page.set_scale_measurement('meters')
        self.__edit_scale_process_helper()
        result = self.maps_page.undo_scale_line_drawing(200, 100, self.maps_page.scale_line_point_b)

        assert result[0] != result[1]

        self.assertDictEqual(result[0], result[2])

    def _test_14_case_bug_undo_scale_line_disappeared(self):

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

    def _test_15_case_bug_undo_scale_line_cannot_repeat_drawing(self):

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


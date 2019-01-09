import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.maps.maps_page__path import MapsPagePath
from pages.login_page import LoginPage
from selenium.webdriver import ActionChains
import logging


class TestMapsPagePath(unittest.TestCase, MapsPagePath):

    logging.basicConfig(level=logging.INFO)

    def __test_draw_path_helper(self, path_sections, logger):

        logger.info('Step 1 : Click path button')
        self.path_page.click_path_button()

        logger.info('Step 2 : Draw path one section ')
        self.path_page.draw_path(path_sections)

        logger.info('Step 4 : Get path position')
        expected_att = self.path_page.get_path_lines_positions()

        logger.info('Step 5 : Save draft')
        self.path_page.save_draft_click()

        logger.info('Step 5 : Refresh page')
        self.path_page.refresh_page()

        logger.info('Step 6 : Click path button')
        self.path_page.click_path_button()

        logger.info('Step 8 : Get path lines position')
        result_attr = self.path_page.get_path_lines_positions()

        logger.info('Step 9 : Compare two lines after refresh')
        self.path_page.lines_comparison(result_attr, expected_att)

        self.test_failed = False

    def setUp(self):
        self.test_failed = True
        self.webdriver = webdriver
        self.login_page_url = LoginPage.login_url

        TestDriver.setUp(self, self.MAPS_URL)
        self.page = LoginPage(self.webdriver)
        self.actions = ActionChains(self.webdriver)
        self.path_page = MapsPagePath(self.webdriver)
        self.option = 1
        # Prepare environment
        log_setup = logging.getLogger(' SETUP ')

        log_setup.info('Step 1 : Truncate db')
        self.path_page.truncate_db()

        log_setup.info('Step 2 : Create maps db environment: insert complexes, buildings, floors')
        self.path_page.create_maps_db_env()

        log_setup.info('Step 3 : Insert scale configuration to database')
        self.path_page.insert_conf_to_database('scale')

        log_setup.info('Step 4 : Insert image to db')
        self.path_page.insert_image_to_db()

        log_setup.info('Step 5 : Set image to floor')
        self.path_page.set_image_to_floor()

        log_setup.info('Step 6 : Prepare devices in db - insert -> [Sinks, Anchors, Devices]')
        self.path_page.prepare_devices_in_db()

        log_setup.info('Step 7 : Check the login process is successfully')
        assert LoginPage(self.webdriver).login_process() == 'Dashboard'

        log_setup.info('Step 8 : Refresh page')
        self.webdriver.refresh()

        log_setup.info('Step 9 : Go to page ' + self.MAPS_URL)
        self.webdriver.get(self.MAPS_URL)

    def tearDown(self):
        TestDriver.tearDown(self)
        self.webdriver.quit()

    def test_01_draw_path_correctly_one_section(self):

        """TC01 DRAW PATH CORRECTLY ONE SECTION"""

        log_tc01 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(1, log_tc01)

        self.test_failed = False

    def test_02_draw_path_correctly_two_sections(self):

        """TC02 DRAW PATH CORRECTLY TWO SECTIONS"""

        log_tc02 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(2, log_tc02)

        self.test_failed = False

    def test_03_draw_path_correctly_five_sections(self):

        """TC03 DRAW PATH CORRECTLY FIVE SECTIONS """

        log_tc03 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(5, log_tc03)

        self.test_failed = False

    def test_04_check_intersection_is_created(self):

        """ TC04 CHECK INTERSECTION IS CREATED """

        log_tc04 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(6, log_tc04)

        log_tc04.info('Step 10 : Check the intersection has been created. There should be 8 lines.')
        lines_elements = self.path_page.get_count_of_lines()
        assert lines_elements == 8, "There has been created too much lines." if lines_elements > 8 else "There has been not enought lines."

        self.test_failed = False

    def test_05_check_is_possible_to_draw_path_outside_of_map(self):

        """TC05 CHECK IS POSSIBLE TO DRAW PATH OUTSIDE OF MAP"""

        log_tc05 = logging.getLogger(self.shortDescription())

        log_tc05.info('Step 1 : Click path button.')
        self.path_page.click_path_button()

        log_tc05.info('Step 2 : Draw one section of path.')
        self.path_page.draw_path(1)

        log_tc05.info('Step 3 : Check line displayed on map.')
        expected = self.path_page.get_count_of_lines()

        log_tc05.info('Step 4 : Click outside of map.')
        self.path_page.click_outside_map()

        log_tc05.info('Step 5 : Check there are any additional lines displayed after click outside of map.')
        result = self.path_page.get_count_of_lines()

        assert expected+1 == result

        log_tc05.info('Step 6 : Click save draft button.')
        self.path_page.save_draft_click()

        log_tc05.info('Step 7 : Refresh page.')
        self.path_page.refresh_page()

        log_tc05.info('Step 8 : Click path button.')
        self.path_page.click_path_button()

        log_tc05.info('Step 9 : Click path button.')
        result = self.path_page.get_count_of_lines()

        assert expected == result

        self.test_failed = False

    def test_06_remove_all_lines(self):

        """TC06 CHECK REMOVE ALL LINES IS CORRECTLY"""

        log_tc06 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(5, log_tc06)

        log_tc06.info('Step 10 : Remove all lines')
        self.path_page.remove_all_lines()

        log_tc06.info('Step 11 : Click save draft button.')
        self.path_page.save_draft_click()

        log_tc06.info('Step 12 : Refresh page.')
        self.path_page.refresh_page()

        log_tc06.info('Step 13 : Click path button.')
        self.path_page.click_path_button()

        log_tc06.info('Step 14 : Check the path exists.')
        assert self.path_page.is_path_disappeared()

        self.test_failed = False

    def test_07_bug_check_double_click_on_start_will_display_path(self):

        """TC07 CHECK DOUBLE CLICK ON START WILL DISPLAY PATH"""

        log_tc07 = logging.getLogger(self.shortDescription())

        log_tc07.info('Step 1 : Click path button')
        self.path_page.click_path_button()

        log_tc07.info('Step 2  : Check double click on start will display path')
        assert self.path_page.check_double_click_on_start_will_display_path()

        log_tc07.info('Step 3 : Refresh page.')
        self.path_page.refresh_page()

        log_tc07.info('Step 4 : Click path button.')
        self.path_page.click_path_button()

        log_tc07.info('Step 5 : Check if the path exists')
        self.path_page.is_path_disappeared()

        self.test_failed = False

    def test_08_bug_navi_390_remove_all_paths_doesnt_work(self):

        """TC08 CHECK BUG [NAVI-390] - STILL EXISTS"""

        log_tc08 = logging.getLogger(self.shortDescription())
        self.__test_draw_path_helper(3, log_tc08)

        log_tc08.info('Step 10 : Remove all lines')
        self.path_page.remove_all_lines()

        log_tc08.info('Step 11 : Check the path exists.')
        assert self.path_page.is_path_disappeared()

        log_tc08.info('Step 12 : Click save draft button.')
        self.path_page.save_draft_click()

        log_tc08.info('Step 13 : Check the "Save draft" label still exists')
        self.path_page.is_save_draft_label_disappeared()

        log_tc08.info('Step 14 : Refresh page.')
        self.path_page.refresh_page()

        log_tc08.info('Step 15 : Click path button.')
        self.path_page.click_path_button()

        log_tc08.info('Step 16 : Check the path exists.')
        assert self.path_page.is_path_disappeared()

        self.test_failed = False

    def test_09_bug_navi_391_check_if_possible_to_save_draft_after_disactive_path_toolbar(self):

        """TC09 CHECK BUG [NAVI-391] - STILL EXISTS"""

        log_tc09 = logging.getLogger(self.shortDescription())

        log_tc09.info('Step 1 : Click path button')
        self.path_page.click_path_button()

        log_tc09.info('Step 2 : Draw path one section ')
        self.path_page.draw_path(1)

        log_tc09.info('Step 3 : Click path button')
        self.path_page.click_path_button()

        log_tc09.info('Step 4 : Check the save btn is clickable after disactive tool')
        self.assertFalse(self.path_page.is_save_draft_btn_clickable())

        self.test_failed = False

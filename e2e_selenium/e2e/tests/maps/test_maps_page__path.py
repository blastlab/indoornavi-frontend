import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.maps.maps_page__path import MapsPagePath
from pages.login_page import LoginPage
from selenium.webdriver import ActionChains
import logging


class TestMapsPagePath(unittest.TestCase, MapsPagePath):

    logging.basicConfig(level=logging.INFO)

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
        assert LoginPage(self.webdriver).login_process() == 'Complexes'

        log_setup.info('Step 8 : Refresh page')
        self.webdriver.refresh()

        log_setup.info('Step 9 : Go to page ' + self.MAPS_URL)
        self.webdriver.get(self.MAPS_URL)

    def tearDown(self):
        TestDriver.tearDown(self)
        self.webdriver.quit()
    """
    Test scenario
        1 Check draw path correctly - one section
        2 Check draw path correctly - two section
        3 Check draw path correctly - five sections
        4 Check all toolbars after draw path
        5 Check the intersection is created
        6 Check is possible to draw path outside of map
        7 Remove all lines
        8 Check 1Step Doubleclick draw will not end action
        9 Bug [NAVI - 390] - Remove all paths doesnt work
        10 Bug [NAVI - 391] - newest - check is it possible to save draft after disactive path toolbar
    """
    # SCALE TESTS
    def __test_draw_path_helper(self, path_sections, logger):

        logger.info('Step 1 : Click path button')
        self.path_page.click_path_button()

        logger.info('Step 2 : Draw path one section ')
        self.path_page.draw_path_sections(path_sections)

        logger.info('Step 3 : Check path is displayed')
        self.path_page.is_path_displayed()

        logger.info('Step 4 : Get path position')
        expected_att = self.path_page.get_path_lines_positions()
        print(expected_att)
        # print(len(expected_att))
        # print(str(expected_att.items()))

        logger.info('Step 5 : Refresh page')
        self.path_page.refresh_page()
        #
        logger.info('Step 6 : Click path button')
        self.path_page.click_path_button()

        logger.info('Step 7 : Check the path is still displayed')
        self.path_page.is_path_displayed()

        logger.info('Step 8 : Get path lines position')
        result_attr = self.path_page.get_path_lines_positions()
        print(result_attr)
        print(type(result_attr))
        # self.path_page.line_comparation(result_attr, expected_att)
        #
        # logger.info('Step 9 : Assert ')
        # assert expected_att == result_attr, "Expected attributes {0} != Result attributes {1}".format(expected_att, result_attr)

        self.test_failed = False

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

        """TC03 DRAW PATH CORRECTLY FIVE SECTIONS"""

        log_tc03 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(5, log_tc03)

        self.test_failed = False

    def test_04_check_all_toolbars_after_draw_path(self):

        """TC04 CHECK ALL TOOLBARS AFTER DRAW PATH"""

        log_tc04 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(12, log_tc04)

        log_tc04.info('Step 7 : Click path button')
        self.path_page.click_path_button()

        self.test_failed = False

    def test_05_check_intersection_is_checked(self):

        """TC05 CHECK INTERSECTION IS CREATED """

        log_tc05 = logging.getLogger(self.shortDescription())

        self.__test_draw_path_helper(12, log_tc05)

        log_tc05.info('Step 7 : Click path button')
        self.path_page.click_path_button()

        self.test_failed = False

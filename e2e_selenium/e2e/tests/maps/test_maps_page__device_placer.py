import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.maps.maps_page__device_placer import MapsPageDevicePlacer
from pages.login_page import LoginPage
from selenium.webdriver import ActionChains
import logging


class TestMapsPageDevicePlacer(unittest.TestCase, MapsPageDevicePlacer):

    logging.basicConfig(level=logging.INFO)

    def setUp(self):
        self.test_failed = True
        self.webdriver = webdriver
        self.login_page_url = LoginPage.login_url

        TestDriver.setUp(self, self.MAPS_URL)
        self.page = LoginPage(self.webdriver)
        self.actions = ActionChains(self.webdriver)
        self.device_placer_page = MapsPageDevicePlacer(self.webdriver)
        self.option = 1
        # Prepare environment
        log_setup = logging.getLogger(' SETUP ')

        log_setup.info('Step 1 : Truncate db')
        self.device_placer_page.truncate_db()

        log_setup.info('Step 2 : Create maps db environment: insert complexes, buildings, floors')
        self.device_placer_page.create_maps_db_env()

        log_setup.info('Step 3 : Insert scale configuration to database')
        self.device_placer_page.insert_conf_to_database('scale')

        log_setup.info('Step 4 : Insert image to db')
        self.device_placer_page.insert_image_to_db()

        log_setup.info('Step 5 : Set image to floor')
        self.device_placer_page.set_image_to_floor()

        log_setup.info('Step 6 : Prepare devices in db - insert -> [Sinks, Anchors, Devices]')
        self.device_placer_page.prepare_devices_in_db()

        log_setup.info('Step 7 : Check the login process is successfully')
        assert LoginPage(self.webdriver).login_process() == 'Complexes'

        log_setup.info('Step 8 : Refresh page')
        self.webdriver.refresh()

        log_setup.info('Step 9 : Go to page ' + self.MAPS_URL)
        self.webdriver.get(self.MAPS_URL)

    def tearDown(self):
        TestDriver.tearDown(self)
        self.webdriver.quit()

    # SCALE TESTS
    def test_01_set_single_sink_without_anchors(self):

        """TC01 SET SINGLE SINK WITHOUT ANCHORS"""

        log_tc01 = logging.getLogger(self.shortDescription())

        log_tc01.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        # TODO STEP 2 : Is device placer list displayed
        # log.info(' Step 2 : ASSERT - Is device placer list displayed')
        # is_list_displayed = self.device_placer_page.is_device_placer_list_displayed()

        log_tc01.info('Step 3 : Check the device placer list title is "Sinks"')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc01.info('Step 4 : Set single sink on map')
        self.device_placer_page.set_device_on_map(600, 500)

        # log_tc01.info('Step 4 : Set single sink on map')
        # self.device_placer_page.move_device_on_map('list111111')

        log_tc01.info('Step 5 : ASSERT - Check the single sink is displayed on map')
        is_device_displayed = self.device_placer_page.is_device_appeared('map111111')
        assert is_device_displayed

        log_tc01.info('Step 6 : Save draft click')
        self.device_placer_page.save_draft_click()

        log_tc01.info('Step 7 : Check the device placer list title is "Anchors"')
        self.device_placer_page.check_device_placer_list_title('anchors')

        log_tc01.info('Step 8 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc01.info('Step 9 : ASSERT - Is sink still on the map')
        is_device_still_displayed = self.device_placer_page.is_device_appeared('map111111')
        assert is_device_still_displayed

        self.test_failed = False

    def test_02_set_2_sinks_without_anchors(self):

        log_tc02 = logging.getLogger(' TEST_02 ')
        # log_tc02.info('START')

        log_tc02.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        # TODO STEP 2 : Is device placer list displayed
        # log.info(' Step 2 : ASSERT - Is device placer list displayed')
        # is_list_displayed = self.device_placer_page.is_device_placer_list_displayed()

        log_tc02.info('Step 3 : Check the device placer list title is "Sinks"')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc02.info('Step 4 : Set single sink on map')
        self.device_placer_page.set_device_on_map(600, 500)

        log_tc02.info('Step 5 : Check the device placer list title is "Anchors"')
        self.device_placer_page.check_device_placer_list_title('anchors')

        log_tc02.info('Step 6 : Click on map')
        self.device_placer_page.click_on_map()

        log_tc02.info('Step 7 : Check the device placer list title is "Sinks"')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc02.info('Step 8 : Set single sink on map')
        self.device_placer_page.set_device_on_map(600, 600)

        log_tc02.info('Step 9 : ASSERT - Check the second sink [111111] & second sink [222222] are displayed on map')
        devices_displayed = self.device_placer_page.is_device_appeared('map111111', 'map222222')
        assert devices_displayed

        log_tc02.info('Step 10 : Save draft click')
        self.device_placer_page.save_draft_click()

        log_tc02.info('Step 11 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc02.info('Step 12 : ASSERT - Check the second sink [111111] & sink [222222] are still displayed on map')
        devices_displayed = self.device_placer_page.is_device_appeared('map111111', 'map222222')
        assert devices_displayed

        self.test_failed = False

    def test_03_set_one_sink_with_2_anchors(self):

        log_tc03 = logging.getLogger(' TEST_03 ')

        log_tc03.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        # TODO STEP 2 : Is device placer list displayed
        # log.info(' Step 2 : ASSERT - Is device placer list displayed')
        # is_list_displayed = self.device_placer_page.is_device_placer_list_displayed()

        log_tc03.info('Step 3 : Check the device placer list title is "Sinks"')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc03.info('Step 4 : Set single sink on map')
        self.device_placer_page.set_device_on_map(600, 500)

        log_tc03.info('Step 5 : Check the device placer list title is "Anchors"')
        self.device_placer_page.check_device_placer_list_title('anchors')

        log_tc03.info('Step 6 : Set anchor 33333 on map')
        self.device_placer_page.set_device_on_map(600, 500)

        log_tc03.info('Step 7 : Set anchor 44444 on map')
        self.device_placer_page.set_device_on_map(500, 600)

        log_tc03.info('Step 8 : ASSERT - Are devices displayed 111111, 33333, 44444')
        devices_displayed = self.device_placer_page.is_device_appeared('map111111', 'map33333', 'map44444')
        assert devices_displayed

        log_tc03.info('Step 9 : Save draft click')
        self.device_placer_page.save_draft_click()

        log_tc03.info('Step 10 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc03.info('Step 12 : ASSERT - Are devices still displayed 111111, 33333, 44444')
        devices_displayed = self.device_placer_page.is_device_appeared('map111111', 'map33333', 'map44444')
        assert devices_displayed

        self.test_failed = False

    def _test_04_set_2_sinks_with_1_anchor_for_each(self):

        log_tc04 = logging.getLogger(' TEST_04 ')

        log_tc04.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        # TODO STEP 2 : Is device placer list displayed
        # log.info(' Step 2 : ASSERT - Is device placer list displayed')
        # is_list_displayed = self.device_placer_page.is_device_placer_list_displayed()

        log_tc04.info('Step 3 : Check the device placer list title is "Sinks"')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc04.info('Step 4 : Set first sink [111111] on map')
        self.device_placer_page.set_device_on_map(600, 500)
        # self.device_placer_page.set_device_position_on_map('map111111', '600', '500')
        self.device_placer_page.move_device_on_map('map111111')

        log_tc04.info('Step 5 : Set first anchor [33333] on map')
        self.device_placer_page.set_device_on_map(500, 500)
        # self.device_placer_page.set_device_position_on_map('map33333', '500', '500')
        self.device_placer_page.move_device_on_map('map33333')

        log_tc04.info('Step 6 : Click on map')
        self.device_placer_page.click_on_map()

        log_tc04.info('Step 7 : Set second sink [222222] on map')
        self.device_placer_page.set_device_on_map(500, 600)
        # self.device_placer_page.set_device_position_on_map('map222222', '600', '600')
        self.device_placer_page.move_device_on_map('map222222')

        log_tc04.info('Step 8 : Set second anchor [44444] on map')
        self.device_placer_page.set_device_on_map(600, 600)
        # self.device_placer_page.set_device_position_on_map('map44444', '500', '600')
        self.device_placer_page.move_device_on_map('map44444')

        log_tc04.info('Step 9 : ASSERT - Check all devices are placed on map')
        devices_appeared  = self.device_placer_page.is_device_appeared('map111111', 'map222222', 'map33333', 'map44444')
        assert devices_appeared

        log_tc04.info('Step 10 : Save draft')
        self.device_placer_page.save_draft_click()
        log_tc04.info('Step 11 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc04.info('Step 12 : Check all devices are placed on map')
        devices_appeared = self.device_placer_page.is_device_appeared('map111111', 'map222222', 'map33333', 'map44444')
        assert devices_appeared

        self.test_failed = False

    def _test_05_unset_single_sink(self):

        log_tc05 = logging.getLogger(' TEST_05 ')
        # log_tc02.info('START')

        log_tc05.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        # TODO STEP 2 : Is device placer list displayed
        # log.info(' Step 2 : ASSERT - Is device placer list displayed')
        # is_list_displayed = self.device_placer_page.is_device_placer_list_displayed()

        log_tc05.info('Step 3 : Check the device placer list title is "Sinks"')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc05.info('Step 4 : Set first sink [111111] on map')
        self.device_placer_page.set_device_on_map(600, 500)
        # self.device_placer_page.set_device_position_on_map('map111111', '600', '500')
        self.device_placer_page.move_device_on_map('map111111')

        log_tc05.info('Step 5 : Check the sink is set on map')

        sink_111111 = self.device_placer_page.is_device_appeared('map111111')
        assert sink_111111

        log_tc05.info('Step 6 : Check unset single sink and assert is disappeared from map')
        self.device_placer_page.unset_device_click('map111111')
        assert self.device_placer_page.is_device_disappeared_from_map('map111111')

        # TODO Step 7 : Check is sink 111111 appeared on the list
        #log_tc05.info('Step 7 : Check is sink 111111 appeared on the list')

        log_tc05.info('Step 8 : Save draft')
        self.device_placer_page.save_draft_click()

        log_tc05.info('Step 9 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc05.info('Step 10 : Check the sink is not on the map')
        assert self.device_placer_page.is_device_disappeared_from_map('map111111')

        self.test_failed = False

    def _test_06_unset_single_anchor(self):

        log_tc06 = logging.getLogger(' TEST_06 ')
        # log_tc02.info('START')

        log_tc06.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        # TODO STEP 2 : Is device placer list displayed
        # log.info(' Step 2 : ASSERT - Is device placer list displayed')
        # is_list_displayed = self.device_placer_page.is_device_placer_list_displayed()

        log_tc06.info('Step 3 : Check the device placer list title is "Sinks"')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc06.info('Step 4 : Set first sink [111111] on map')
        self.device_placer_page.set_device_on_map(600, 500)
        # self.device_placer_page.set_device_position_on_map('map111111', '600', '500')
        self.device_placer_page.move_device_on_map('map111111')

        log_tc06.info('Step 5 : Set first anchor [33333] on map')
        self.device_placer_page.set_device_on_map(500, 500)
        # self.device_placer_page.set_device_position_on_map('map33333', '500', '500')
        self.device_placer_page.move_device_on_map('map33333')

        log_tc06.info('Step 6 : Check the sink and anchor are set on map')
        devices_appeared = self.device_placer_page.is_device_appeared('map111111', 'map33333')
        assert devices_appeared

        log_tc06.info('Step 7 : Save draft')
        self.device_placer_page.save_draft_click()

        log_tc06.info('Step 8 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc06.info('Step 9 : Check the sink and anchor are set on map after refresh')
        devices_appeared = self.device_placer_page.is_device_appeared('map111111', 'map33333')
        assert devices_appeared

        log_tc06.info('Step 10 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc06.info('Step 10 : Click on anchor 33333')
        self.device_placer_page.click_on_device('map33333')

        log_tc06.info('Step 11 : Check unset single anchor and assert is disappeared from map')
        self.device_placer_page.unset_device_click('map33333')
        assert self.device_placer_page.is_device_disappeared_from_map('map33333')

        log_tc06.info('Step 12 : Save draft')
        self.device_placer_page.save_draft_click()

        log_tc06.info('Step 13 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc06.info('Step 14 : Check there is no anchor 33333 on the map and sink 111111 is still displayed')
        sink_111111 = self.device_placer_page.is_device_appeared('map111111')
        assert sink_111111 and self.device_placer_page.is_device_disappeared_from_map('map33333')

        self.test_failed = False

    def _test_07_unset_all_anchors_from_sink(self):

        log_tc07 = logging.getLogger(' TEST_07 ')

        log_tc07.info("Step 1 : Update configuration -> add to map sink [111111] & 2 anchors [33333, 44444]")
        self.device_placer_page.update_conf_in_db("tc_07_device_placer")

        log_tc07.info('Step 2 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc07.info('Step 3 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc07.info('Step 4 : Click on anchor 33333')
        self.device_placer_page.click_on_device('map33333')

        log_tc07.info('Step 5 : Unset anchor [33333]')
        self.device_placer_page.unset_device_click('map33333')

        log_tc07.info('Step 6 : Click on anchor 44444')
        self.device_placer_page.click_on_device('map44444')

        log_tc07.info('Step 7 : Unset anchor [44444]')
        self.device_placer_page.unset_device_click('map44444')

        log_tc07.info('Step 8 : Save draft')
        self.device_placer_page.save_draft_click()

        log_tc07.info('Step 9 : Check there are anchors placed on map')
        assert self.device_placer_page.is_device_disappeared_from_map('map33333', 'map44444')

        log_tc07.info('Step 10 : Check there is still sink placed on map')
        assert self.device_placer_page.is_device_appeared('map111111')

        log_tc07.info('Step 11 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc07.info('Step 12 : Check there are anchors placed on map')
        assert self.device_placer_page.is_device_disappeared_from_map('map33333', 'map44444')

        log_tc07.info('Step 13 : Check there is sink placed on map after refresh')
        assert self.device_placer_page.is_device_appeared('map111111')

        self.test_failed = False

    def _test_08_unset_sink_with_all_anchors(self):

        log_tc08 = logging.getLogger(' TEST_08 ')

        log_tc08.info("Step 1 : Update configuration -> add to map sink [111111] & 2 anchors [33333, 44444]")
        self.device_placer_page.update_conf_in_db("tc_07_device_placer")

        log_tc08.info('Step 2 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc08.info('Step 3 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc08.info('Step 4 : Click on sink 111111')
        self.device_placer_page.click_on_device('map111111')

        log_tc08.info('Step 5 : Unset sink [111111]')
        self.device_placer_page.unset_device_click('map111111')

        log_tc08.info('Step 6 : Click accept unset warning')
        self.device_placer_page.unset_warning_ok_click()

        log_tc08.info('Step 7 : Save draft')
        self.device_placer_page.save_draft_click()

        log_tc08.info('Step 8 : Check there are no devices placed on map')
        self.device_placer_page.is_device_disappeared_from_map('map111111', 'map33333', 'map44444')

        log_tc08.info('Step 9 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc08.info('Step 10 : Check there are no devices placed on map after refresh')
        self.device_placer_page.is_device_disappeared_from_map('map111111', 'map33333', 'map44444')

        log_tc08.info('Step 11 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc08.info('Step 12 : Check sinks [111111, 222222] are on the list')
        devices_on_list = self.device_placer_page.is_device_appeared('list111111', 'list222222')
        assert devices_on_list

        log_tc08.info('Step 13 : Set first sink [111111] on map')
        self.device_placer_page.set_device_on_map(600, 600)

        log_tc08.info('Step 14 : Check the device placer list title is "Anchors"')
        self.device_placer_page.check_device_placer_list_title('anchors')

        log_tc08.info('Step 15 : Check anchors [33333, 44444] on the list')
        devices_on_list = self.device_placer_page.is_device_appeared('list33333', 'list44444')
        assert devices_on_list

        self.test_failed = False

    def test_09_searchbox_in_device_placer_list(self):

        log_tc09 = logging.getLogger(' TEST_09 ')

        log_tc09.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc09.info('Step 2 : Insert [TestSink111111] seach device by name')
        self.device_placer_page.insert_into_device_placer_list_searchbox('TestSink111111')

        log_tc09.info('Step 3 : Check [TestSink111111] is still displayed on the list & [TestSink222222] is hidden')
        assert self.device_placer_page.is_device_appeared('list111111')
        assert self.device_placer_page.is_device_disappeared_from_map('list222222')

        log_tc09.info('Step 4 : Insert [222222] search device by shortId')
        self.device_placer_page.insert_into_device_placer_list_searchbox('222222')

        log_tc09.info('Step 5 : Check [TestSink222222] is still displayed on the list & [TestSink111111] is hidden')
        assert self.device_placer_page.is_device_appeared('list222222')
        assert self.device_placer_page.is_device_disappeared_from_map('list111111')
        self.test_failed = False

    # TODO BUG YOUTRACK VERIFY
    def _test_10_bug_searchbox_is_empty_after_reopen_tool(self):

        log_tc10 = logging.getLogger(' TEST_10 ')

        log_tc10.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc10.info('Step 2 : Insert [TestSink111111] seach device by name')
        self.device_placer_page.insert_into_device_placer_list_searchbox('TestSink111111')

        log_tc10.info('Step 3 : Reopen device placer tool')
        self.device_placer_page.click_device_placer_button()
        self.device_placer_page.click_device_placer_button()

        log_tc10.info('Step 3 : Check the device placer searchbox is empty')
        assert self.device_placer_page.is_device_placer_list_searchbox_empty(), \
               "Device placer searchbox has not been cleared"
        self.test_failed = False

    # TODO TOCHECK
    def test_11_height_slider(self):

        log_tc10 = logging.getLogger(' TEST_11 ')
        size_widow = self.webdriver.get_window_size()
        log_tc10.info("SIZE OF SCREEN: {0}".format(size_widow))
        log_tc10.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc10.info('Step 2 : Check the device placer list title is "Sinks" ')
        self.device_placer_page.check_device_placer_list_title('sinks')

        log_tc10.info('Step 3 : Set height slider on 5m and check label has been changed')
        is_displayed = self.device_placer_page.is_text_displayed_after_change_height("Height 5m")
        assert is_displayed == True, "Incorrect height displayed"

        log_tc10.info('Step 4 : Set sink on map')
        self.device_placer_page.set_device_on_map(600, 500)

        log_tc10.info('Step 5 : Move Device On Map')
        self.device_placer_page.move_device_on_map('map111111')

        log_tc10.info('Step 6 : Save draft')
        self.device_placer_page.save_draft_click()

        log_tc10.info('Step 7 : Click on device displayed on map')
        self.device_placer_page.click_on_device('map111111')

        log_tc10.info('Step 8 : Get information of device from map & assert information is correctly displayed')
        device_inf = self.device_placer_page.get_data_device_on_hover('map111111', 'sink')
        assert device_inf == "sink-111111 (5m)"

        log_tc10.info('Step 9 : Refresh page')
        self.device_placer_page.refresh_page()

        log_tc10.info('Step 10 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc10.info('Step 11 : Click on device displayed on map')
        self.device_placer_page.click_on_device('map111111')

        log_tc10.info('Step 12 : Set height slider on 3m and check label has been changed')
        is_displayed = self.device_placer_page.is_text_displayed_after_change_height("Height 3m")
        assert is_displayed == True, "Incorrect height displayed"

        log_tc10.info('Step 13 : Set sink [222222] on map')
        self.device_placer_page.set_device_on_map(600, 600)

        log_tc10.info('Step 14 : Move Device On Map')
        self.device_placer_page.move_device_on_map('map222222')

        log_tc10.info('Step 15 : Get information of device from map & assert information is correctly displayed')
        device_inf = self.device_placer_page.get_data_device_on_hover('map222222', 'sink222222')
        assert device_inf == "sink-222222 (3m)"

        self.test_failed = False

    def test_12_minimize_and_maximized_window_device_placer_list(self):
        log_tc12 = logging.getLogger(' TEST_12 ')

        log_tc12.info('Step 1 : Click device placer button')
        self.device_placer_page.click_device_placer_button()

        log_tc12.info(' Step 2 : Check the device placer list is minimized')
        assert self.device_placer_page.is_device_placer_list_minimized()

        log_tc12.info('Step 3 : Check the device placer list is maximized')
        assert self.device_placer_page.is_device_placer_list_maximized()

        self.test_failed = False











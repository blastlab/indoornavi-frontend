import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from tests.constructions.test_base import TestBase
from pages.permissions.permissions_page import PermissionsPage
from pages.base_page import BasePage
from pages.login_page import LoginPage
import time


class TestPermissionsPage(unittest.TestCase, PermissionsPage):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.webdriver = webdriver
        cls.login_page_url = LoginPage.login_url
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        PermissionsPage.__init__(cls, cls.webdriver)
        cls.option = 1
        cls.page.login_process(cls.option, 1)

    def setUp(self):
        self.test_failed = True
        self.truncate_db_permissions()
        self.create_permissions_db_env()
        self.webdriver.refresh()

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

    # TC003 Test searching permission
    # TC004 Test adding permission group correctly without assigned permission
    # TC005 Test adding permission group correctly with all permissions
    # TC006 Test adding permission group incorrectly with empty input [name]
    # TC007 Test cancel adding permission group by hash button click
    # TC008 Test cancel adding permission group by cancel button click

    def __get_permissions_page(self):

        """ Additional method which redirect user to permission groups page"""

        self.dropdown_menu_click()
        self.dropdown_permissions_button_click()

    def test_01_permissions_page_loaded_correctly(self):

        """Test that permissions page is loaded correctly"""

        self.__get_permissions_page()
        self.assertEqual(self.webdriver.current_url[-16:], 'permissionGroups', 'Page url has not been correct.')
        self.assertTrue(self.is_groups_list_displayed(), 'Permission Groups has not been displayed.')
        # self.assertTrue(self.is_permissions_title_correct(), 'Page title has not been correct.')

    def test_02_multi_select_in_add_permission_group(self):

        """Test that multi select works correctly in add permission group"""

        self.dropdown_menu_click()
        self.dropdown_permissions_button_click()

        self.add_permission_button_click()
        self.assertTrue(self.is_modal_window_displayed(), 'Modal window has not been displayed.')

        # displayed
        self.multi_select_label_click()
        self.assertTrue(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        # hidden
        self.multi_select_label_click()
        self.assertFalse(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been hidden.')

        # displayed
        self.multi_select_arrow_click()
        self.assertTrue(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        # hidden
        self.multi_select_arrow_click()
        self.assertFalse(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been hidden.')

        # displayed
        self.multi_select_arrow_click()
        self.assertTrue(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        # hidden
        self.multi_select_cancel_sharp_click()
        self.assertFalse(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        # displayed
        self.multi_select_arrow_click()
        self.assertTrue(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        # hidden
        self.multi_select_click_all_chekboxes()
        self.assertTrue(self.is_all_permissions_highlighted(), 'All permissions have not been highlighted.')

        self.multi_select_click_all_chekboxes()
        self.assertFalse(self.is_all_permissions_highlighted(), 'All permissions still have been highlighted.')
        # time.sleep(5)

        self.assertEqual(self.checkboxes_simulator_click(), self.get_multiselet_label_container_title())

    def test_03_test_searching_in_add_permission_group(self):

        """Test that searching works correctly in add permission group"""

        self.dropdown_menu_click()
        self.dropdown_permissions_button_click()

        self.add_permission_button_click()
        self.assertTrue(self.is_modal_window_displayed(), 'Modal window has not been displayed.')

        # displayed
        self.multi_select_label_click()
        self.assertTrue(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        self.enter_search_permission(self.searching_data)
        self.assertListEqual(self.verify_elements_count_and_text_contain(1), self.searching_data_array,
                             'Elements count or texts have not been the same.')

        self.enter_search_permission(self.searching_data_02)
        self.assertListEqual(self.verify_elements_count_and_text_contain(4), self.searching_data_02_array,
                             'Elements count or texts have not been the same.')

        self.enter_search_permission(self.searching_data_03)
        self.assertListEqual(self.verify_elements_count_and_text_contain(9), self.searching_data_03_array,
                             'Elements count or texts have not been the same.')

        self.close_modal_click()
        self.assertFalse(self.is_modal_window_displayed(), 'Element has not been disappeared')

    def test_04_test_add_permission_group_correctly_without_assigned_permission(self):

        """Test that will be added without any chosen permission"""

        self.dropdown_menu_click()
        self.dropdown_permissions_button_click()

        self.add_permission_button_click()
        self.assertTrue(self.is_modal_window_displayed(), 'Modal window has not been displayed.')

        self.multi_select_label_click()
        self.assertTrue(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        self.enter_new_permission_name(self.new_name)
        self.save_permission_button_click()
        self.assertTrue(self.is_modal_window_disappeared(), 'Modal window has not been disappeared.')
        self.assertTrue(self.is_toast_present(self.added_toast))
        self.assertTrue(self.is_toast_disappear(self.added_toast))

        self.assertTrue(self.is_new_permission_present())

    def _test_05_test_add_permission_group_correctly_with_all_permissions(self):

        """Test that add permission group correctly with all permissions"""

        self.dropdown_menu_click()
        self.dropdown_permissions_button_click()

        self.add_permission_button_click()
        self.assertTrue(self.is_modal_window_displayed(), 'Modal window has not been displayed.')

        self.multi_select_label_click()
        self.assertTrue(self.is_multiselect_dropdown_displayed(), 'Multiselect dropdown has not been activated.')

        self.enter_new_permission_name(self.new_name)
        self.multi_select_click_all_chekboxes()
        self.save_permission_button_click()
        # self.assertTrue(self.is_all_permissions_highlighted(), 'All permissions have not been highlighted.')

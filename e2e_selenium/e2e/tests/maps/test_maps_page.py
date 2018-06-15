import unittest
from selenium import webdriver
from tests.test_driver import TestDriver
from pages.maps.maps_page import MapsPage
from pages.base_page import BasePage
from pages.login_page import LoginPage
from pages.constructions.floors_page import FloorsPage
import time

class TestMapsPage(unittest.TestCase, MapsPage):

    @classmethod
    def setUpClass(cls):
        cls.test_failed = True
        cls.webdriver = webdriver
        cls.login_page_url = LoginPage.login_url
        TestDriver.setUp(cls, cls.login_page_url)
        cls.page = LoginPage(cls.webdriver)
        cls.floors_page = FloorsPage(cls.webdriver, 'floors')
        cls.maps_page = MapsPage(cls.webdriver)
        cls.option = 1
        cls.page.login_process(cls.option, 1)

    def setUp(self):
        self.test_failed = True
        self.maps_page.truncate_db()
        self.maps_page.create_maps_db_env()
        self.webdriver.refresh()

    @classmethod
    def tearDownClass(cls):
        cls.webdriver.quit()

    def __get_maps_page(self):

        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()

        assert self.floors_page.is_redirect_button_clickable()
        self.floors_page.redirect_button_click()

        assert self.floors_page.multi_assertion()
        self.maps_page.floor_update_button_click()

    def __test_map_image_with_invalid_format(self, extension):

        self.maps_page.choose_image(self.maps_page.incorrect_image, extension)
        self.assertTrue(self.maps_page.is_invalid_format_warning_present(extension))
        self.test_failed = False

    def test_01_maps_page_loaded_correctly(self):

        self.__get_maps_page()

        self.assertTrue(self.maps_page.is_choose_image_title_displayed(),
                        'There has not been information to user could choose image.')

        self.assertTrue(self.maps_page.is_choose_image_button_displayed(),
                        'There has not been button to user could choose image.')

        self.assertTrue(self.maps_page.is_upload_area_displayed(),
                        'There has not been upload area')

        self.test_failed = False

    def test_02_map_is_loaded_correctly_after_press_a_button(self):

        self.maps_page.choose_image(self.maps_page.correct_map_path)
        # Check thumb, filesize, filename, close btn appeared - preview
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()

        self.test_failed = False

    def _test_03_map_loaded_correctly_after_drag_and_drop(self):

        print('\ntest_03_map_loaded_correctly_after_drag_and_drop TestMapsPage \n')

    # def test_04_map_loaded_with_incorrect_file_format_bmp(self):
    #     self.__test_map_image_with_invalid_format('.bmp')
    #
    # def test_05_map_loaded_with_incorrect_file_format_dwg(self):
    #     self.__test_map_image_with_invalid_format('.dwg')
    #
    # def test_06_map_loaded_with_incorrect_file_format_eps(self):
    #     self.__test_map_image_with_invalid_format('.eps')
    #
    # def test_07_map_loaded_with_incorrect_file_format_svg(self):
    #     self.__test_map_image_with_invalid_format('.svg')
    #
    # def test_08_map_loaded_with_incorrect_file_format_dxf(self):
    #     self.__test_map_image_with_invalid_format('.dxf')
    #
    # def test_09_map_loaded_with_incorrect_file_format_gif(self):
    #     self.__test_map_image_with_invalid_format('.gif')
    #
    # def test_10_map_loaded_with_incorrect_file_format_psd(self):
    #     self.__test_map_image_with_invalid_format('.psd')

    def test_11_map_loaded_with_incorrect_text_format_csv(self):

        self.__test_map_image_with_invalid_format('.csv')

    def test_12_map_loaded_with_incorrect_movie_format_mp4(self):

        self.__test_map_image_with_invalid_format('.mp4')

    def test_13_map_loaded_with_incorrect_format_sql(self):

        self.__test_map_image_with_invalid_format('.sql')

    def test_14_map_loaded_with_small_dimensions(self):

        self.maps_page.choose_image(self.maps_page.small_map_path)
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()
        self.test_failed = False

    def test_15_map_loaded_with_large_size_13MB(self):
        print(self.maps_page.large_map_path)
        self.maps_page.choose_image(self.maps_page.large_map_path, '.jpg')
        self.assertTrue(self.maps_page.is_invalid_size_warning_present())
        self.test_failed = False

    def test_16_upload_correct_image_after_warning(self):

        self.maps_page.choose_image(self.maps_page.large_map_path, '.jpg')
        self.assertTrue(self.maps_page.is_invalid_size_warning_present())
        self.maps_page.choose_image(self.maps_page.correct_map_path)
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()

        self.test_failed = False

    def test_17_upload_correct_image_after_cancel_warning(self):

        self.maps_page.choose_image(self.maps_page.large_map_path, '.jpg')
        self.assertTrue(self.maps_page.is_invalid_size_warning_present())
        self.maps_page.warning_cancel_click()
        self.assertTrue(self.maps_page.is_invalid_size_warning_disappear())
        self.maps_page.choose_image(self.maps_page.correct_map_path)
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()

        self.test_failed = False

    def test_18_add_scale_straight_line(self):

        self.maps_page.choose_image(self.maps_page.correct_map_path)
        # Check thumb, filesize, filename, close btn appeared - preview
        self.maps_page.is_image_preview_displayed()
        self.maps_page.upload_button_click()
        self.maps_page.is_image_uploaded()

        # time.sleep(3)
        self.maps_page.scale_button_click()
        # Logic
        self.maps_page.draw_scale_line(400, 0)
        self.assertTrue(self.maps_page.is_scale_line_drawn_correctly(400, 0))

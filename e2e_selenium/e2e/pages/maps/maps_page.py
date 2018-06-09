from pages.base_page import BasePage
from locators.maps_base_locators import MapsBaseLocators


class MapsPage(BasePage, MapsBaseLocators):

    def __init__(self, driver):
        self.__driver = driver
        BasePage.__init__(self, self.__driver)
        MapsBaseLocators.__init__(self)

    def create_maps_db_env(self):
        return self.create_db_env(self.db_maps_env_xml)

    def floor_update_button_click(self):
        return self.click_element(self.floor_update_button)

    def upload_button_click(self):
        return self.click_element(self.upload_image_btn)

    def is_choose_image_title_displayed(self):
        element_text = self.get_text(self.choose_image_title)
        return True if element_text == self.choose_image_string else False

    def is_choose_image_button_displayed(self):
        return self.is_element_appeared(self.choose_image_btn)

    def is_upload_area_displayed(self):
        return True if self.is_element_present(self.upload_area) else False

    def choose_image(self, path, extension='.png'):
        __btn = self.choose_image_btn
        __path = path+extension
        return self.choose_file(__btn, __path)

    def is_invalid_format_warning_present(self, extension):
        __exception_msg = 'Warning that "File with extension: '+extension+' is incorrect" has not been appeared.'
        return True if self.is_element_present(self.warning_invalid_format, msg=__exception_msg) else False

    def is_image_preview_displayed(self):

        __path = self.correct_map_path
        __service = self.service_upload(__path)
        __filename = __service.get_filename()
        __filesize = __service.get_file_size()

        self.check_title_is_correct(__filename, *self.preview_thumb)
        self.is_element_present(self.preview_close_btn)
        self.is_element_present(self.preview_thumb)
        self.check_title_is_correct(str(__filesize), *self.preview_filesize)

    def is_image_uploaded(self):
        self.is_element_present(self.uploaded_image)
        self.is_element_present(self.hint_bar)
        self.is_element_present(self.hint_bar_scale)

    def __del__(self):
        print('\n__del__ MapsPage \n')

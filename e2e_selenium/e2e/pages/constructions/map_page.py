from selenium.webdriver.common.by import By
from pages.base_page import BasePage

class MapPage(BasePage):

    upload_map_button = (By.CSS_SELECTOR, 'label.upload-button')
    upload_content = (By.CSS_SELECTOR, 'div.file-upload')

    map_toolbar = (By.CSS_SELECTOR, 'p#map-toolbar')
    svg_map_layer = (By.CSS_SELECTOR, 'svg#map-upper-layer')
    map_image = (By.CSS_SELECTOR, 'image#map-img')

    input_level_floor = (By.CSS_SELECTOR, 'input#level')
    existing_level = 1
    unique_level_warning = (By.XPATH, "//p[contains(text(),'Floor level must be unique in the building')]")
    table_floor_name = (By.XPATH, '//table/thead/tr/th[2]/span')

    def is_upload_map_button_present(self):
        return True if self.is_element_present(self.upload_map_button) else False

    def is_upload_content_present(self):
        return True if self.is_element_present(self.upload_content) else False

    # If map has been already loaded , check elements
    def is_map_toolbar_present(self):
        return True if self.is_element_present(self.map_toolbar) else False

    def is_map_layer_present(self):
        return True if self.is_element_present(self.svg_map_layer) else False

    def is_map_image_present(self):
        return True if self.is_element_present(self.map_image) else False

    # Upload map
    def upload_image_click(self):
        return self.click_button(*self.upload_map_button)

from selenium.webdriver.common.by import By


class MapsBaseLocators(object):

    def __init__(self):
        # FILE PATHS
        self.correct_map_path = 'src/test_data_upload/correct_map'
        self.small_map_path = 'src/test_data_upload/small_size'
        self.large_map_path = 'src/test_data_upload/large_size'
        self.incorrect_image = 'src/test_data_upload/image_formats/test'

        self.db_maps_env_xml = 'src/test-complexes.xml'
        # LOCATORS
        self.choose_image_string = 'Choose an image from disk or drag&drop it below. It will be used as a background for the floor.'
        self.choose_image_title = (By.CSS_SELECTOR, "div app-map-uploader h4")

        self.floor_update_button = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:nth-child(4)')
        self.choose_image_btn = (By.XPATH, "//div/app-map-uploader/p-fileupload/div/div[1]/span/input")
        self.upload_area = (By.CLASS_NAME, 'ui-fileupload-content')

        self.preview_close_btn = (By.XPATH, '//button[@ng-reflect-icon="fa-close"]')
        self.preview_thumb = (By.CSS_SELECTOR, 'div.ui-fileupload-row > div > img')
        self.preview_filename = (By.CSS_SELECTOR, 'div.ui-fileupload-row > div:nth-child(2)')
        self.preview_filesize = (By.CSS_SELECTOR, 'div.ui-fileupload-row > div:nth-child(3)')
        self.upload_image_btn = (By.XPATH, '//button[@ng-reflect-label="Upload"]')

        self.uploaded_image = (By.ID, 'map-upper-layer')
        self.hint_bar = (By.XPATH, "//span[contains(text(),'Choose a tool.')]")
        self.hint_bar_scale = (By.XPATH, "//span[contains(text(),'Scale is not set')]")

        self.warning_invalid_format = (By.XPATH, "//span[contains(text(),'allowed file types: image/*.')]")
        self.warning_invalid_size = (By.XPATH, "//span[contains(text(),'maximum upload size is 5.243 MB.')]")
        self.warning_close_btn = (By.CSS_SELECTOR, 'div.ui-messages-error > a > i.fa-close')

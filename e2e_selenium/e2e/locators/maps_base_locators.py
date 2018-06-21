from selenium.webdriver.common.by import By


class MapsBaseLocators(object):

    def __init__(self):
        # FILE PATHS
        self.correct_map_path = 'src/test_data_upload/correct_map'
        self.small_map_path = 'src/test_data_upload/small_size'
        self.large_map_path = 'src/test_data_upload/large_size'
        self.incorrect_image = 'src/test_data_upload/image_formats/incorrect_map'
        # INPUT DATA

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

        # input data
        self.scale_value = '750'
        # scale locators
        self.scale_button = (By.XPATH, '//button[@ng-reflect-text="Scale"]')
        self.hint_bar_scale_prompt = (By.XPATH, "//span[contains(text(),' Click on map to set starting point of measurement')]")

        self.displayed_map = (By.CSS_SELECTOR, 'div#map-container > svg.drop-zone')
        self.map_image = (By.CSS_SELECTOR, '#map')
        self.scale_line = (By.CSS_SELECTOR, '#scaleGroup > line.connectLine')
        self.scale_line_point_a = (By.CSS_SELECTOR, '#scaleGroup > circle:nth-child(2)')
        self.scale_line_point_b = (By.CSS_SELECTOR, '#scaleGroup > circle:nth-child(5)')
        self.scale_modal_window = (By.CLASS_NAME, 'ui-dialog')

        self.scale_measurement = (By.CSS_SELECTOR, '#map-container > app-scale-input > app-tool-details > div > div > form > div.ui-g-5 > p-dropdown > div > label')
        self.scale_measurement_cent = (By.XPATH, "//p-dropdown/div/div[4]/div/ul/li[1]/span")
        self.scale_measurement_meters = (By.XPATH, "//p-dropdown/div/div[4]/div/ul/li[2]/span")
        self.scale_distance_input = (By.CSS_SELECTOR, 'input#distance')

        self.scale_ok_button = (By.XPATH, '//button[@id="confirm-decision"]')
        self.scale_cancel_button = (By.CSS_SELECTOR, '#reject-decision > span.ui-button-text.ui-clickable')
        # self.scale_ok_button = (By.XPATH, '//button[@ng-reflect-text="Ok"]')
        # self.scale_cancel_button = (By.XPATH, '//button[@ng-reflect-text="Cancel"]')
        self.scale_set_toast = (By.XPATH, "//p[contains(text(),'Scale has been set.')]")
        self.draft_saved = (By.XPATH, "//p[contains(text(),'Draft has been saved.')]")

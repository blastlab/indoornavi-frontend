from selenium.webdriver.common.by import By


class MapsBaseScaleLocators(object):

    def __init__(self):
        # FILE PATHS
        self.db_maps_env_xml = 'src/test-complexes.xml'

        # LOCATORS
        self.floor_update_button = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:nth-child(4)')
        self.choose_image_btn = (By.XPATH, "//div/app-map-uploader/p-fileupload/div/div[1]/span/input")
        self.upload_area = (By.CLASS_NAME, 'ui-fileupload-content')

        # input data
        self.edit_scale_distance = '999'
        # scale locators
        self.scale_button = (By.XPATH, '//button[@ng-reflect-text="Scale"]')
        self.hint_bar_scale_prompt = (By.XPATH, "//span[contains(text(),' Click on map to set starting point of measurement')]")

        self.map_image = (By.CSS_SELECTOR, '#map')
        self.scale_line = (By.CSS_SELECTOR, '#scaleGroup > line.connectLine')
        self.scale_line_point_a = (By.CSS_SELECTOR, ('#scaleGroup > circle:first-of-type'))
        self.scale_line_point_b = (By.CSS_SELECTOR, ('#scaleGroup > circle:last-of-type'))
        self.scale_modal_window = (By.CLASS_NAME, 'ui-dialog')

        self.scale_measurement = (By.CSS_SELECTOR, '#map-container > app-scale-input > app-tool-details > div > div > form > div.ui-g-5 > p-dropdown > div > label')
        self.scale_measurement_cent = (By.XPATH, "//p-dropdown/div/div[4]/div/ul/li[1]/span")
        self.scale_measurement_meters = (By.XPATH, "//p-dropdown/div/div[4]/div/ul/li[2]/span")
        self.scale_distance_input = (By.CSS_SELECTOR, 'input#distance')

        self.scale_ok_button = (By.XPATH, '//button[@id="confirm-decision"]')
        self.scale_cancel_button = (By.XPATH, '//button[@id="reject-decision"]')
        self.scale_set_toast = (By.XPATH, "//p[contains(text(),'Scale has been set.')]")
        self.draft_saved = (By.XPATH, "//p[contains(text(),'Draft has been saved.')]")
        self.saving_draft_info = (By.XPATH, "//span[contains(text(),'Saving draft...')]")
        self.set_measurement_toast = (By.XPATH, "//p[contains(text(),'Please set the measure unit.')]")
        self.must_be_integer_toast = (By.XPATH, "//p[contains(text(),'Real distance must be an integer.')]")

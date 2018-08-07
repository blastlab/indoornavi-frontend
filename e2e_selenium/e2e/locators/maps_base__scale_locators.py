from selenium.webdriver.common.by import By


class MapsBaseScaleLocators(object):

        # FILE PATHS
        db_maps_env_xml = 'src/test-complexes.xml'

        # LOCATORS
        floor_update_button = (By.CSS_SELECTOR, 'tr:last-child > td.col-button > span > button:nth-child(4)')
        choose_image_btn = (By.XPATH, "//div/app-map-uploader/p-fileupload/div/div[1]/span/input")
        upload_area = (By.CLASS_NAME, 'ui-fileupload-content')

        # input data
        edit_scale_distance = '999'
        # scale locators
        scale_button = (By.XPATH, '//button[@ng-reflect-text="Scale"]')
        hint_bar_scale_prompt = (By.XPATH, "//span[contains(text(),' Click on map to set starting point of measurement')]")

        map_image = (By.CSS_SELECTOR, '#map')
        scale_line = (By.CSS_SELECTOR, '#scaleGroup > line.connectLine')
        scale_line_point_a = (By.CSS_SELECTOR, ('#scaleGroup > circle:first-of-type'))
        scale_line_point_b = (By.CSS_SELECTOR, ('#scaleGroup > circle:last-of-type'))
        scale_modal_window = (By.CLASS_NAME, 'ui-dialog')

        scale_measurement = (By.CSS_SELECTOR, '#map-container > app-scale-input > app-tool-details > div > div > div > div.ui-g-12.content-container.ng-trigger.ng-trigger-toggleMinimizedBottom > form > div.ui-g-5 > p-dropdown > div > label')
        scale_measurement_cent = (By.XPATH, "//p-dropdown/div/div[4]/div/ul/li[1]/span")
        scale_measurement_meters = (By.XPATH, "//p-dropdown/div/div[4]/div/ul/li[2]/span")
        scale_distance_input = (By.CSS_SELECTOR, 'input#distance')

        scale_ok_button = (By.XPATH, '//button[@id="confirm-decision"]')
        scale_cancel_button = (By.XPATH, '//button[@id="reject-decision"]')
        scale_set_toast = (By.XPATH, "//p[contains(text(),'Scale has been set.')]")
        draft_saved = (By.XPATH, "//p[contains(text(),'Draft has been saved.')]")
        saving_draft_info = (By.XPATH, "//span[contains(text(),'Saving draft...')]")
        set_measurement_toast = (By.XPATH, "//p[contains(text(),'Please set the measure unit.')]")
        must_be_integer_toast = (By.XPATH, "//p[contains(text(),'Real distance must be an integer.')]")

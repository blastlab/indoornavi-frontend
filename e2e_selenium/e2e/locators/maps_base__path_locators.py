from selenium.webdriver.common.by import By


class MapsBasePathLocators(object):

    MAPS_URL = 'http://localhost:4200/complexes/3/buildings/2/floors/2/map'
    # TEST_DEVICES_XML = 'src/test-devices.xml'
    PATHS_BTN = (By.CSS_SELECTOR, 'app-path button')
    MAP_LAYER = (By.ID, 'map')
    PATH_LINE = (By.CSS_SELECTOR, '#path-new line')
    PATH_CIRCLE = (By.CSS_SELECTOR, '#path-new circle')
    SAVE_DRAFT_LABEL = (By.XPATH, '//span[contains(text(),"Save draft")]')
    DASHED_PATH_LINDE = (By.CSS_SELECTOR, '#path-new line.tempLine')
    REMOVE_ALL_LINES_BTN = (By.XPATH, '//span[contains(text(),"Remove all lines")]')
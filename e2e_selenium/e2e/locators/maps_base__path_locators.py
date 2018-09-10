from selenium.webdriver.common.by import By


class MapsBasePathLocators(object):

    MAPS_URL = 'http://localhost:4200/complexes/3/buildings/2/floors/2/map'
    # TEST_DEVICES_XML = 'src/test-devices.xml'
    PATHS_BTN = (By.CSS_SELECTOR, 'app-path button')
    MAP_LAYER = (By.ID, 'map')
    PATH_LINE = (By.CSS_SELECTOR, '#path-new line')
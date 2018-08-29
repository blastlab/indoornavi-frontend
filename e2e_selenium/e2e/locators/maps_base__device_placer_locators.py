from selenium.webdriver.common.by import By


class MapsBaseDevicePlacerLocators(object):

    MAPS_URL = 'http://localhost:4200/complexes/3/buildings/2/floors/2/map'
    TEST_DEVICES_XML = 'src/test-devices.xml'

    CONTEXTMENU_UNSET_DEVICE_BTN = (By.XPATH, '//span[contains(text(),"Unset Device")]')
    DEVICE_PLACER_BUTTON = (By.CSS_SELECTOR, 'app-device-placer button')
    DEVICE_PLACER_LIST = (By.CSS_SELECTOR, 'app-device-placer-list div.ui-dialog')
    DEVICE_PLACER_LIST_SEARCHBOX = (By.ID, 'deviceNameFilter')
    DEVICE_PLACER_LIST_MINIMIZE_CONTAINER = (By.CSS_SELECTOR, 'app-device-placer-list div.minimize-container')
    DEVICE_PLACER_LIST_MINIMIZE_BTN = (By.CSS_SELECTOR, 'app-device-placer-list button.minimize-button')
    DEVICE_PLACER_SINKS_TITLE  = (By.XPATH, '//h4[contains(text(), "Sinks")]')
    DEVICE_PLACER_ANCHORS_TITLE  = (By.XPATH, '//h4[contains(text(), "Anchors")]')
    DEVICE_PLACER_MAP_LAYER = (By.ID, 'map')
    DEVICE_PLACER_SINK_111111 = (By.XPATH, '//td[contains(text(), "TestSink111111")]')
    DEVICE_PLACER_SINK_222222 = (By.XPATH, '//td[contains(text(), "TestSink222222")]')
    DEVICE_PLACER_ANCHOR_33333 = (By.XPATH, '//td[contains(text(), "TestAnchor33333")]')
    DEVICE_PLACER_ANCHOR_44444 = (By.XPATH, '//td[contains(text(), "TestAnchor44444")]')
    #TODO CHANGE SINK HOVER SELECTOR
    DEVICE_PLACER_SINK_HOVER_SELECTOR = (By.CSS_SELECTOR, 'svg.sink text:nth-child(3)')
    DEVICE_PLACER_ANCHOR_HOVER_SELECTOR = (By.CSS_SELECTOR, 'svg.anchor text:nth-child(3)')
    DEVICE_PLACER_HEIGHT_SLIDER = (By.CLASS_NAME, 'ui-slider-handle')
    DEVICE_PLACER_HEIGHT_LABEL =  (By.ID, 'height-label')
    JQUERY_DEVICE_LIST_EVEN = 'app-device-placer-list tr.ui-datatable-even'
    JQUERY_DEVICE_LIST_ODD = 'app-device-placer-list tr.ui-datatable-odd'
    JQUERY_MAP_LAYER = '#map-upper-layer'
    MAP_SINK_111111 = (By.CSS_SELECTOR, 'svg.sink')
    MAP_SINK_222222 = (By.CSS_SELECTOR, 'svg.sink:nth-child(2)')
    # MAP_SINK_111111  = (By.ID, '111111')
    MAP_SINK_222222  = (By.ID, '222222')
    MAP_ANCHOR_33333 = (By.ID, '33333')
    MAP_ANCHOR_44444 = (By.ID, '44444')
    UNSET_SINK_WARNING_OK = (By.CSS_SELECTOR, 'app-device-placer button[ng-reflect-label="Ok"]')
    UNSET_SINK_WARNING_CANCEL = (By.CSS_SELECTOR, 'app-device-placer button[ng-reflect-label="Cancel"]')

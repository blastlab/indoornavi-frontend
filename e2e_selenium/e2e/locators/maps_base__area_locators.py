from selenium.webdriver.common.by import By
from src.test_conf import *
from services.service_data import get_toast_selector
from services.service_data import get_multiselect_selector


class MapsBaseAreaLocators(object):

    DB_MAPS_ENV_XML = 'src/test-complexes.xml'
    MAPS_URL        = 'http://localhost:4200/complexes/3/buildings/2/floors/2/map'
    TEST_ADD_AREA_NAME = 'TestAddArea'
    TEST_ADD_AREA_ENTER_OFFSET = '100'
    TEST_ADD_AREA_LEAVE_OFFSET = '200'
    TEST_EDIT_AREA_NAME = 'TestEditArea'
    TEST_EDIT_AREA_ENTER_OFFSET = '300'
    TEST_EDIT_AREA_LEAVE_OFFSET = '300'
    TEST_PARAM_123 = '123'
    TEST_PARAM_456 = '456'
    TEST_EDIT_AREA_NAME = 'TestEditArea'

    # SELECTORS
    AREA_BUTTON           = (By.CLASS_NAME, 'test-area-button')
    AREA_DIALOG           = (By.CSS_SELECTOR, 'app-tool-details .ui-dialog')
    AREA_ADD_CONFIRM      = (By.CSS_SELECTOR, 'app-tool-details button#confirm-decision')
    AREA_ADD_REJECT       = (By.CSS_SELECTOR, 'app-tool-details button#reject-decision')
    AREA_ADD_NAME         = (By.CSS_SELECTOR, 'app-tool-details input#name')
    AREA_ADD_ENTER_OFF    = (By.CSS_SELECTOR, 'app-tool-details input#offset-on_enter')
    AREA_ADD_LEAVE_OFF    = (By.CSS_SELECTOR, 'app-tool-details input#offset-on_leave')
    AREA_ADD_HEIGHT_MIN   = (By.ID, 'heightMin')
    AREA_ADD_HEIGHT_MAX   = (By.ID, 'heightMax')
    AREA_ADD_ENTER_MULTISELECT = (By.CSS_SELECTOR, 'p-multiselect#on_enter label')
    AREA_ADD_ENTER_MULTISELECT_CLOSE = (By.CSS_SELECTOR, 'p-multiselect#on_enter ui-multiselect-close')
    AREA_ADD_ENTER_MULTISELECT_ITEM_123 = (By.CSS_SELECTOR, 'p-multiselect#on_enter ul li')
    AREA_ADD_ENTER_MULTISELECT_ITEM_456 = (By.CSS_SELECTOR, 'p-multiselect#on_enter li:nth-child(2)')

    AREA_ADD_LEAVE_MULTISELECT = (By.CSS_SELECTOR, 'p-multiselect#on_leave label')
    AREA_ADD_LEAVE_MULTISELECT_CLOSE = (By.CSS_SELECTOR, 'p-multiselect#on_leave a.ui-multiselect-close')
    AREA_ADD_LEAVE_MULTISELECT_ITEM_123 = (By.CSS_SELECTOR, 'p-multiselect#on_leave ul li')
    AREA_ADD_LEAVE_MULTISELECT_ITEM_456 = (By.CSS_SELECTOR, 'p-multiselect#on_leave li:nth-child(2)')
    SAVE_DRAFT_BTN             = (By.ID, 'save-draft')
    MAP_IMAGE                  = (By.ID, 'map')
    AREA_NEW_OBJECT       = (By.ID, 'area-new')
    AREA_ZERO_OBJECT      = (By.ID, 'area-0')
    AREA_ONE_OBJECT       = (By.ID, 'area-1')
    AREA_NEW_POLYGON      = (By.CSS_SELECTOR, '#area-new > polygon')
    AREA_ONE_POLYGON  = (By.CSS_SELECTOR, '#area-1 > polygon')
    AREA_ZERO_POLYGON = (By.CSS_SELECTOR, '#area-0 > polygon')

    AREA_CONTEXT_MENU_EDIT     = (By.XPATH, '/html/body/div/p-contextmenusub/ul/li[1]/a')
    AREA_CONTEXT_MENU_REMOVE   = (By.XPATH, '/html/body/div/p-contextmenusub/ul/li[2]/a')

    def AREA_NEW_AREA_CIRCLE(self, choice):
        if choice < 2 and choice > 5:
          raise ValueError("Wrong argument passed for find selector")
        return (By.CSS_SELECTOR, '#area-new > circle:nth-child({0})'.format(choice))

    def AREA_EDIT_CIRCLE(self, choice):
        if choice < 2 and choice > 5:
          raise ValueError("Wrong argument passed for find selector")
        return (By.CSS_SELECTOR, '#area-0 > circle:nth-child({0})'.format(choice))
    # TOASTS
    DRAFT_SAVED_TOAST  = get_toast_selector('configuration.saveDraft.success')

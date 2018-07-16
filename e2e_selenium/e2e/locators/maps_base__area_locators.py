from selenium.webdriver.common.by import By
import json
from src.test_conf import *
from services.service_data import get_toast_selector


class MapsBaseAreaLocators(object):

    DB_MAPS_ENV_XML = 'src/test-complexes.xml'
    MAPS_URL        = 'localhost:4200/complexes/3/buildings/2/floors/2/map'
    TEST_ADD_AREA_NAME = 'TestAddArea'
    TEST_ADD_AREA_ENTER_OFFSET = '100'
    TEST_ADD_AREA_LEAVE_OFFSET = '200'
    TEST_EDIT_AREA_NAME = 'TestEditArea'
    # SELECTORS
    AREA_BUTTON           = (By.CLASS_NAME, 'test-area-button')
    AREA_DIALOG           = (By.ID, 'test-area-dialog')
    AREA_ADD_CONFIRM      = (By.CLASS_NAME, 'test-add-area-confirm')
    AREA_ADD_REJECT       = (By.CLASS_NAME, 'test-add-area-reject')
    AREA_ADD_NAME         = (By.CLASS_NAME, 'test-add-area-name')
    AREA_ADD_ENTER_OFF    = (By.CLASS_NAME, 'test-add-area-enter-offset')
    AREA_ADD_LEAVE_OFF    = (By.CLASS_NAME, 'test-add-area-leave-offset')
    AREA_ADD_ENTER_MULTISELECT = (By.CLASS_NAME, 'test-add-area-enter-multiselect-label')
    AREA_ADD_LEAVE_MULTISELECT = (By.CLASS_NAME, 'test-add-area-leave-multiselect-label')
    MAP_IMAGE                  = (By.ID, 'map')
    AREA_NEW_AREA_OBJECT       = (By.ID, 'area-new')
    AREA_NEW_AREA_POLYGON      = (By.CSS_SELECTOR, '#area-new > polygon')
    AREA_NEW_AREA_ONE          = (By.CSS_SELECTOR, '#area-1 > polygon')
    AREA_NEW_AREA_ZERO         = (By.CSS_SELECTOR, '#area-0 > polygon')
    # TOASTS
    DRAFT_SAVED_TOAST  = get_toast_selector('configuration.saveDraft.success')



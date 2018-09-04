from locators.maps_base_locators import MapsBaseLocators
from locators.maps_base__scale_locators import MapsBaseScaleLocators
from locators.maps_base__area_locators import MapsBaseAreaLocators
from locators.maps_base__device_placer_locators import MapsBaseDevicePlacerLocators
from src.test_conf.test_config import *


class MapsPageUtils(MapsBaseLocators,
                    MapsBaseScaleLocators,
                    MapsBaseAreaLocators,
                    MapsBaseDevicePlacerLocators):

    def __init__(self):
        super().__init__()

    __available_conf = {
        "scale": TEST_SCALE_CONF_DATA,
        "area": TEST_AREA_CONF_DATA,
        "tc_07_device_placer": TC07_DEVICE_PLACER_CONF
    }

    def create_maps_db_env(self):
        return self.create_db_env(self.db_maps_env_xml)

    def set_image_to_floor(self):
        params = TEST_UPDATE_FLOOR_IMG_PARAMS
        return self.service_db().update_table(params)

    def insert_conf_to_database(self, module):

        table = CONFIGURATION_TABLE
        columns = CONFIGURATION_COLUMNS
        data = self.__available_conf[module]
        values = ('1', TEST_DATE, data, '0', '2', TEST_DATE)
        return self.insert_to_db(table, columns, values)

    def update_conf_in_db(self, new_conf):
        params = {
          'table': 'configuration',
          'set_column': 'data',
          'set_value': self.__available_conf[new_conf],
          'where_column': 'id',
          'where_value': '1'
        }
        self.service_db().update_table(params)

    def insert_image_to_db(self):

        with open('src/test_data_upload/correct_map.png', "rb") as f:
          blob = f.read()
        table = IMAGE_TABLE
        columns = IMAGE_COLUMNS
        values = ('1', TEST_DATE, TEST_DATE, blob, '840', '1614')
        return self.insert_to_db(table, columns, values)

    def insert_devices_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(DEVICE_TABLE, DEVICE_COLUMNS, TEST_DEVICES_CSV_PATH)

    def insert_sinks_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(SINK_TABLE, SINK_COLUMNS, TEST_SINKS_CSV_PATH)

    def insert_anchors_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(ANCHOR_TABLE, ANCHOR_COLUMNS, TEST_ANCHORS_CSV_PATH)

    def insert_tags_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(TAG_TABLE, TAG_COLUMNS, TEST_TAGS_CSV_PATH)

    def save_draft_click(self):
        return self.click_element(self.SAVE_DRAFT_BTN)

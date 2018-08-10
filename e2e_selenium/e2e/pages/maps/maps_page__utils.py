from locators.maps_base_locators import MapsBaseLocators
from locators.maps_base__scale_locators import MapsBaseScaleLocators
from locators.maps_base__area_locators import MapsBaseAreaLocators
from src.test_conf.test_config import *


class MapsPageUtils(MapsBaseLocators, MapsBaseScaleLocators, MapsBaseAreaLocators):

    def __init__(self):
        super().__init__()

    def create_maps_db_env(self):
        return self.create_db_env(self.db_maps_env_xml)

    def set_image_to_floor(self):
        params = TEST_UPDATE_FLOOR_IMG_PARAMS
        return self.service_db().update_table(params)

    def insert_conf_to_database(self, module):
        table = CONFIGURATION_TABLE
        columns = CONFIGURATION_COLUMNS
        data = TEST_SCALE_CONF_DATA if module=='scale' else TEST_AREA_CONF_DATA
        values = ('1', TEST_DATE, data, '0', '2', TEST_DATE)
        return self.insert_to_db(table, columns, values)

    def insert_image_to_db(self):

        with open('src/test_data_upload/correct_map.png', "rb") as f:
          blob = f.read()
        table = IMAGE_TABLE
        columns = IMAGE_COLUMNS
        values = ('1', TEST_DATE, TEST_DATE, blob, '840', '1614')
        return self.insert_to_db(table, columns, values)

    def insert_devices_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(DEVICE_TABLE, DEVICE_COLUMNS, TEST_DEVICES_CSV_PATH)

    def insert_tags_to_db_from_csv(self):
        return self.service_db().insert_to_db_from_csv(TAG_TABLE, TAG_COLUMNS, TEST_TAGS_CSV_PATH)

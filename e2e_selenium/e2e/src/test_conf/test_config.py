CONFIGURATION_TABLE = 'configuration'
CONFIGURATION_COLUMNS = ('id', 'creationDate', 'data', 'version', 'floor_id', 'saveDraftDate')
IMAGE_TABLE = 'image'
IMAGE_COLUMNS = ('id', 'creationDate', 'modificationDate', 'bitmap', 'bitmapHeight', 'bitmapWidth')

TEST_CONF_DATA = '{"sinks":[],"anchors":[],"scale":{"start":{"x":807,"y":419},"stop":{"x":1207,"y":419},"realDistance":725,"measure":"CENTIMETERS"},"areas":[]}'
TEST_UPDATE_FLOOR_IMG_PARAMS = {'table': 'floor', 'set_column': 'image_id', 'set_value': '1', 'where_column': 'id', 'where_value': '2'}
TEST_UPDATE_FLOOR_SCALE_PARAMS = {'table': 'floor', 'set_column': 'scale_id', 'set_value': '1', 'where_column': 'id', 'where_value': '2'}
TEST_DATE = '2018-03-02 12:00:00'

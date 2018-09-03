from services.service_data import parse_json_to_string

ANCHOR_TABLE = 'anchor'
ANCHOR_COLUMNS = ('id', 'x', 'y', 'sink_id', 'z')
CONFIGURATION_TABLE = 'configuration'
CONFIGURATION_COLUMNS = ('id', 'creationDate', 'data', 'version', 'floor_id', 'saveDraftDate')
DEVICE_TABLE = 'device'
DEVICE_COLUMNS = ('id', 'creationDate', 'modificationDate', 'longId', 'name', 'shortId', 'floor_id', 'verified', 'commitHash', 'major', 'minor', 'firmwarePartition')
IMAGE_TABLE = 'image'
IMAGE_COLUMNS = ('id', 'creationDate', 'modificationDate', 'bitmap', 'bitmapHeight', 'bitmapWidth')
TAG_TABLE = 'tag'
TAG_COLUMNS = 'id'
TEST_ANCHORS_CSV_PATH = 'src/test_data/anchor.csv'
TC07_DEVICE_PLACER_CONF = parse_json_to_string('src/test_conf/tc07_device_placer_conf.json')
TEST_SCALE_CONF_DATA = parse_json_to_string('src/test_conf/test_scale_conf.json')
TEST_AREA_CONF_DATA = parse_json_to_string('src/test_conf/test_area_conf.json')
TEST_DATE = '2018-07-23 12:00:00'
TEST_DEVICES_CSV_PATH = 'src/test_data/devices.csv'
TEST_IMAGE_PATH = 'src/test_data_upload/correct_map.png'
TEST_UPDATE_FLOOR_IMG_PARAMS = {'table': 'floor', 'set_column': 'image_id', 'set_value': '1', 'where_column': 'id', 'where_value': '2'}
TEST_UPDATE_FLOOR_SCALE_PARAMS = {'table': 'floor', 'set_column': 'scale_id', 'set_value': '1', 'where_column': 'id', 'where_value': '2'}
TEST_SINKS_CSV_PATH = 'src/test_data/sink.csv'
TEST_TAGS_CSV_PATH = 'src/test_data/tag.csv'
SINK_TABLE = 'sink'
SINK_COLUMNS = ('id', 'configured')



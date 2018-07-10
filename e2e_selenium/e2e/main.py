import unittest
import xmlrunner
import HtmlTestRunner
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd)
from tests.test_login_page import TestLoginPage
from tests.constructions.test_complexes_page import TestComplexesPage
from tests.constructions.test_buildings_page import TestBuildingsPage
from tests.constructions.test_floors_page import TestFloorsPage
from tests.devices.test_sinks_page import TestSinksPage
from tests.devices.test_anchors_page import TestAnchorsPage
from tests.devices.test_tags_page import TestTagsPage
from tests.permissions.test_permissions_page import TestPermissionsPage
from tests.maps.test_maps_page import TestMapsPage
from tests.maps.test_maps_page_scale import TestMapsPageScale

if __name__ == '__main__':

    # unittest.main()
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'), failfast=False, buffer=False, catchbreak=False)

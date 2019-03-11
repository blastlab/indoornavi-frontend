import unittest
import xmlrunner
# import HtmlTestRunner
import os
import sys
cwd = os.getcwd()
sys.path.append(cwd)
from tests.test_login_page import TestLoginPage
from tests.constructions.test_complexes_page import TestComplexesPage
from tests.constructions.test_buildings_page import TestBuildingsPage
from tests.constructions.test_floors_page import TestFloorsPage
# from tests.devices.test_sinks_page import TestSinksPage
# from tests.devices.test_anchors_page import TestAnchorsPage
# from tests.devices.test_tags_page import TestTagsPage
# from tests.permissions.test_permissions_page import TestPermissionsPage
# from tests.maps.test_maps_page import TestMapsPage
# from tests.maps.test_maps_page__scale import TestMapsPageScale
# from tests.maps.test_maps_page__area import TestMapsPageArea
# from tests.maps.test_maps_page__device_placer import TestMapsPageDevicePlacer
# from tests.maps.test_maps_page__path import TestMapsPagePath
if __name__ == '__main__':

    # suite = unittest.TestSuite()
    # result = unittest.TestResult()
    # suite.addTests(unittest.makeSuite(TestLoginPage))
    # suite.addTests(unittest.makeSuite(TestComplexesPage))
    # suite.addTests(unittest.makeSuite(TestBuildingsPage))
    # suite.addTests(unittest.makeSuite(TestFloorsPage))
    # suite.addTests(unittest.makeSuite(TestSinksPage))
    # suite.addTests(unittest.makeSuite(TestAnchorsPage))
    # suite.addTests(unittest.makeSuite(TestTagsPage))
    # suite.addTests(unittest.makeSuite(TestPermissionsPage))
    # suite.addTests(unittest.makeSuite(TestMapsPage))
    # suite.addTests(unittest.makeSuite(TestMapsPageScale))
    # runner = unittest.TextTestRunner(verbosity=3)
    # print(runner.run(suite))

    # unittest.main()
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'), failfast=False, buffer=False, catchbreak=False)

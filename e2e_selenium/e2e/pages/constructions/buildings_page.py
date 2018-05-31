from pages.constructions.construction_page import ConstructionPage


class BuildingsPage(ConstructionPage):

    def __init__(self, driver, module_query):
        self.__driver = driver
        self.__module = module_query
        ConstructionPage.__init__(self, self.__driver, self.__module)


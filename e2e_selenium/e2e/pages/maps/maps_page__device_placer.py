from pages.base_page import BasePage
from pages.maps.maps_page__utils import MapsPageUtils
from selenium.webdriver import ActionChains


class MapsPageDevicePlacer(BasePage, MapsPageUtils):

    def __init__(self, driver):
        self.__driver = driver
        self.__actions = ActionChains
        super(MapsPageDevicePlacer, self).__init__(self.__driver)

    def prepare_devices_in_db(self):
        self.insert_sinks_to_db_from_csv()
        self.insert_anchors_to_db_from_csv()
        self.insert_devices_to_db_from_csv()

    def click_on_map(self):
        element = self.wait_for_element_clickable(self.DEVICE_PLACER_MAP_LAYER)
        actions = ActionChains(self.__driver)
        actions.click(element)
        actions.perform()

    def click_device_placer_button(self):
        return self.click_element(self.DEVICE_PLACER_BUTTON)

    def is_device_placer_list_displayed(self):
        return True if self.is_element_present(self.DEVICE_PLACER_LIST) else False

    def is_device_placer_list_disappeared(self):
        return True if self.is_element_disappear(self.DEVICE_PLACER_LIST) else False

    def is_device_placer_list_title_displayed(self):
        print('is_device_placer_list_title_displayed')

    def set_device_on_map(self, offset_x, offset_y):
        self.simulate_drag_and_drop_jquery(self.JQUERY_DEVICE_LIST_EVEN, self.JQUERY_MAP_LAYER, offset_x, offset_y)

    def check_device_placer_list_title(self, device_name):
        selectors = {"sinks": self.DEVICE_PLACER_SINKS_TITLE,
                     "anchors": self.DEVICE_PLACER_ANCHORS_TITLE}
        return self.wait_for_element(selectors[device_name])

    def __select_device_helper(self, device_id):
        selector_by_device_id = {
            "map111111"  : self.MAP_SINK_111111,
            "map222222"  : self.MAP_SINK_222222,
            "map33333"   : self.MAP_ANCHOR_33333,
            "map44444"   : self.MAP_ANCHOR_44444,
            "list111111" : self.DEVICE_PLACER_SINK_111111,
            "list222222" : self.DEVICE_PLACER_SINK_222222,
            "list33333"  : self.DEVICE_PLACER_ANCHOR_33333,
            "list44444"  : self.DEVICE_PLACER_ANCHOR_44444
        }
        return selector_by_device_id[device_id]

    def __presence_device_helper(self, option, devices):
        select_fun = {
          "appeared": self.is_element_appeared,
          "disappear": self.is_element_disappear,
        }
        presence_arr = []
        for i in devices:
            presence = select_fun[option](self.__select_device_helper(i))
            presence_arr.append(presence)
        return False if False in presence_arr else True

    def is_device_appeared(self, *devices):
        return self.__presence_device_helper('appeared', devices)

    def click_on_device(self, device_id):
        device = self.wait_for_element_clickable(self.__select_device_helper(device_id))
        return ActionChains(self.__driver).click(device).perform()

    def is_device_placer_list_minimized(self):
        self.click_element(self.DEVICE_PLACER_LIST_MINIMIZE_BTN)
        self.wait_for_element(self.DEVICE_PLACER_LIST_MINIMIZE_CONTAINER).get_attribute("style")
        headless_transform = '-1848px'
        normal_transform = '-1793px'
        is_minimized = self.wait_for_element_has_changed_value(self.DEVICE_PLACER_LIST_MINIMIZE_CONTAINER,
                                                               "style",
                                                               "transform: translateX({0});".format(headless_transform),
                                                               msg="Device Placer list has not been minimized")
        return is_minimized

    def is_device_placer_list_maximized(self):
        self.click_element(self.DEVICE_PLACER_LIST_MINIMIZE_BTN)
        is_maximized = self.wait_for_element_has_changed_value(self.DEVICE_PLACER_LIST_MINIMIZE_CONTAINER,
                                                               "style",
                                                               "transform: translateX(0px);",
                                                               msg="Device Placer list has not been minimized")
        return is_maximized

    def unset_device_click(self, device_id):
        device = self.wait_for_element_clickable(self.__select_device_helper(device_id))
        ActionChains(self.__driver).move_to_element(device).context_click(device).perform()
        return self.click_element(self.CONTEXTMENU_UNSET_DEVICE_BTN)

    def unset_warning_ok_click(self):
        return self.click_element(self.UNSET_SINK_WARNING_OK)

    def unset_warning_cancel_click(self):
        return self.click_element(self.UNSET_SINK_WARNING_CANCEL)

    def is_device_disappeared_from_map(self, *devices):
        return self.__presence_device_helper('disappear', devices)


    def get_device_color(self, device_id):

        web_element = self.wait_for_element(self.__select_device_helper(device_id))
        return self.__driver.execute_script('var sink = arguments[0];'
                                            'var sinkText = sink.getElementsByTagName("text")[0];'
                                            'console.log(sinkText);', web_element)

    def move_device_on_map(self, device_id):
        web_element = self.wait_for_element(self.__select_device_helper(device_id))
        ActionChains(self.__driver).drag_and_drop_by_offset(web_element, 100, 0).perform()

    def simulate_drag_and_drop_jquery(self, source, target, offsetX, offsetY):
        """
        Helper to simulate drag and drop
        :param source: drag webelement
        :param target: drop webeleemtn
        :param offsetX: passed to Jquery script to can simulate drag and drop by offset X {as dropEvent.offsetX}
        :param offsetY: passed to Jquery script to can simulate drag and drop by offset Y {as dropEvent.offsetY}
        :return:
        """
        driver = self.__driver
        # init jQuery url variable;
        jquery_url = "http://code.jquery.com/jquery-1.11.2.min.js"

        # load jQuery helper
        with open("src/jquery_load_helper.js") as f:
            load_jquery_js = f.read()

        # load drag and drop helper
        with open("src/drag_and_drop_helper.js") as f:
            drag_and_drop_js = f.read()

        # load jQuery
        driver.execute_async_script(load_jquery_js, jquery_url)

        driver.execute_script(drag_and_drop_js + """var source = arguments[0];
                                                    var target = arguments[1];
                                                    var offsetX = arguments[2];
                                                    var offsetY = arguments[3];
                                                    $(source).first().simulateDragDrop({ 
                                                      dropTarget: target,
                                                      dragOffsetX: offsetX,
                                                      dragOffsetY: offsetY 
                                                      });
                                                    console.log("WHICH_MOMENT");""", source, target, offsetX, offsetY)

    def insert_into_device_placer_list_searchbox(self, text):
        return self.clear_and_fill_input(text, self.DEVICE_PLACER_LIST_SEARCHBOX)

    def clear_device_placer_list_searchbox(self):
        return self.clear_text_input(self.DEVICE_PLACER_LIST_SEARCHBOX)

    def is_device_placer_list_searchbox_empty(self):
        return self.is_input_empty(self.DEVICE_PLACER_LIST_SEARCHBOX)

    def change_height_by_slider(self, set_meters):

        """
        Default value of device height is 2m
        User by slider set/change height of device.

        :param
        string - set_meters user define height of device

        :returns
        height_label - string - height of device displayed in label - e.g. "Height 2m"
        """

        start = 2
        step_in_px = 52
        setter = set_meters - start
        pixels_x_to_move = step_in_px*setter
        pixels_y_to_move = 0

        slider = self.wait_for_element_clickable(self.DEVICE_PLACER_HEIGHT_SLIDER)
        ActionChains(self.__driver).drag_and_drop_by_offset(slider, pixels_x_to_move, pixels_y_to_move).perform()
        height_label = self.get_text(self.DEVICE_PLACER_HEIGHT_LABEL)
        return height_label

    def get_data_device_on_hover(self, device_id, set_device):
        element = self.wait_for_element(self.__select_device_helper(device_id))
        ActionChains(self.__driver).move_to_element(element).perform()
        set_selector = {
          'sink': self.DEVICE_PLACER_SINK_HOVER_SELECTOR,
          'anchor': self.DEVICE_PLACER_ANCHOR_HOVER_SELECTOR
        }
        return self.get_text(set_selector[set_device])






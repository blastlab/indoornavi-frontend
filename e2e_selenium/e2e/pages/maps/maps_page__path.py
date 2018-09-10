from pages.base_page import BasePage
from pages.maps.maps_page__utils import MapsPageUtils
from selenium.webdriver import ActionChains
import json

class MapsPagePath(BasePage, MapsPageUtils):

    def __init__(self, driver):
        self.__driver = driver
        self.__actions = ActionChains
        super(MapsPagePath, self).__init__(self.__driver)

    def prepare_devices_in_db(self):
        self.insert_sinks_to_db_from_csv()
        self.insert_anchors_to_db_from_csv()
        self.insert_devices_to_db_from_csv()

    def click_on_map(self):
        element = self.wait_for_element_clickable(self.MAP_LAYER)
        actions = ActionChains(self.__driver)
        actions.click(element)
        actions.perform()

    def double_click_on_map(self):
        element = self.wait_for_element_clickable(self.MAP_LAYER)
        actions = ActionChains(self.__driver)
        actions.double_click(element)
        actions.perform()

    def move_mouse_on_map(self):
        actions = ActionChains(self.__driver)

    def get_path_lines_positions(self):
        lines = self.wait_for_elements(self.PATH_LINE)

        lines_json = {}
        iterator = 0

        for line in lines:
            iterator += 1
            line_attributes = []
            location_x = line.location["x"]
            location_y = line.location["y"]
            line_attributes += location_x, location_y

            lines_json["line-{0}".format(iterator)] = line_attributes

        return json.dumps(lines_json)

    def line_comparation(self, expected_json, result_json):
        data_a = json.loads(expected_json)
        data_b = json.loads(result_json)
        for key_a, value_a in data_a.items():
            for key_b, value_b in data_b.items():
                if key_a == key_b:
                    assert value_b-2 <= value_a <= value_b+2

    def __sections_helper(self, steps_num):
        print('__sections_helper '+ str(steps_num))

        element_image = self.wait_for_element_clickable(self.MAP_IMAGE)
        action_session = ActionChains(self.__driver)
        action_session.click(element_image)
        # action_session.move_by_offset(200, 200).click()
        # action_session.perform()

        # self.draw_line(action_session, 100, 0)
        x_offset = 0
        y_offset = 0
        for x in range(0, steps_num):
            x_offset += 100
            y_offset += 100
            action_session.move_by_offset(x_offset, y_offset)
            action_session.click()
        action_session.click()
        # action_session.double_click()
        action_session.perform()
        self.get_path_lines_positions()


        #
        # action_session.double_click()

        import time
        time.sleep(4)

    def draw_path_sections(self, sections):
        return self.__sections_helper(sections)

    # def draw_path_two_sections(self):
    #     return self.__sections_helper(2)
    #
    # def draw_path_five_sections(self):
    #     return self.__sections_helper(5)

    def is_path_displayed(self):
        return self.wait_for_element_visibility(self.PATH_LINE)

    def click_path_button(self):
        return self.click_element(self.PATHS_BTN)

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

    def is_text_displayed_after_change_height(self, text):

        """
        Default value of device height is 2m.
        User by slider set/change height of device.
        Function check the Height label will be changed correctly after move slider.
        :param
        text - string - passed to helper function which should be result of action
        :var
        slide - webelement needed for move
        h_label_locator - selector of height text
        is_displayed - bool to verify element displayed
        :returns
        is_displayed {boolean} - True or False
        """

        slider = self.wait_for_element_clickable(self.DEVICE_PLACER_HEIGHT_SLIDER)
        h_label_locator = self.DEVICE_PLACER_HEIGHT_LABEL
        is_displayed = self.wait_for_text_has_changed_after_drag(slider, text, h_label_locator)
        return is_displayed

    def get_data_device_on_hover(self, device_id, set_device):
        element = self.wait_for_element(self.__select_device_helper(device_id))
        ActionChains(self.__driver).move_to_element(element).perform()
        set_selector = {
          'sink': self.DEVICE_PLACER_SINK_HOVER_SELECTOR,
          'anchor': self.DEVICE_PLACER_ANCHOR_HOVER_SELECTOR
        }
        info =self.get_text(set_selector[set_device])
        return info






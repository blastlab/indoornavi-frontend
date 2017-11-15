from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
from selenium.common.exceptions import TimeoutException
from termcolor import colored

class Device:
    __test_name = 'Test Device Functionalities '
    __short_id = '123'
    __long_id = '12345'
    __name = 'name'
    __new_short_id = '321'
    __anchor_page_url = 'http://localhost:4200/anchors'
    __compare_array = []

    def __init__(self, wb):
        self.__wb = wb

    # Main function for devices
    def test(self):
        # Add anchor test - with correct credentials
        self.__prepare_to_add_anchor()
        # Edit anchor test
        self.__edit_last_anchor()

    def __navigate_to_home(self):
        print(colored('NAVIGATE TO HOME', 'green'))

    #
    # Test of adding anchor with correct credentials
    #
    """ Condition : correct credentials """

    def __prepare_to_add_anchor(self):
        print(colored('\nADD ANCHOR TEST', 'yellow'))
        print(colored('T2. Preparing to add anchor', 'green'))

        # Load Anchor page
        self.__wb.get(self.__anchor_page_url)

        # Assertion 1: If page is loaded correctly, there will appear anchor title then
        anchors_title = WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.TAG_NAME, 'h1'))).text
        assert anchors_title == "Anchors", "[FAILURE] Anchors page is not loaded correctly"
        print(colored('T3. Anchor Page loaded correctly', 'green'))

        # Assertion 2: First, we check that anchor with shortId already exists, if so we remove him
        # Wait for a Devices list
        WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'devices-list')))
        print(colored('+++ Devices list loaded', 'green'))

        # Check if the anchor exists
        # - true  - call method add anchor
        # - false - call method remove anchor
        try:
            self.__wb.find_element_by_id('shortId-'+self.__short_id)
        except NoSuchElementException:
            print(colored('+++ No element - call add anchor function', 'green'))
            self.__add_anchor()
            return False
        print(colored('--- element Found - call remove anchor function', 'red'))
        self.__remove_anchor(self.__short_id)
        self.__add_anchor()

    def __add_anchor(self):
        print(colored('\nADD ANCHOR TEST', 'yellow'))
        print(colored('T4. Start Add Anchor', 'green'))

        # Wait for new anchor button
        new_device_button = WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.ID, 'new-device-button')))
        new_device_button.click()

        # Wait for modal window
        add_anchor_modal = WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'mat-dialog-container')))
        # [TO DO] - name of modal
        print(colored('[TO DO]. Here should be displayed title "Add anchor"', 'green'))
        # assert(add_anchor_modal.text == 'Add anchor', "[FAILURE] Add modal has not been displayed")
        print(colored('T5. Appear modal window', 'green'))

        # Prepare variables & fill the input fields
        short_id_input = self.__wb.find_element_by_id('device-short-id')
        short_id_input.send_keys(self.__short_id)

        long_id_input = self.__wb.find_element_by_id('device-long-id')
        long_id_input.send_keys(self.__long_id)

        name_input = self.__wb.find_element_by_id('device-name')
        name_input.send_keys(self.__name)

        # Click save button
        save_button = self.__wb.find_element_by_id('save-button')
        save_button.click()

        # There should appear new anchor row with correctly data
        # Step 1: displayed ?
        # Step 2: properly data ?
        # Step 3: push variable to compare_array to check correctly data

        new_anchor_row = WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.ID, 'shortId-'+self.__short_id)))

        check_short_id = self.__wb.find_element_by_id('shortId-'+self.__short_id).text
        assert check_short_id == self.__short_id, '[Failure] Displayed shortId is invalid'
        self.__compare_array.append(check_short_id)

        check_long_id = self.__wb.find_element_by_id('longId-'+self.__short_id).text
        assert check_long_id == self.__long_id, '[Failure] Displayed longId is invalid'
        self.__compare_array.append(check_long_id)

        check_name = self.__wb.find_element_by_id('name-'+self.__short_id).text
        assert check_name == self.__name, '[Failure] Displayed name is invalid'
        self.__compare_array.append(check_name)

        # Print Success
        print(colored('T6.[Complete] Add anchor functionality', 'green'))
    #
    # Test of editing anchor with correct credentials
    #

    def __edit_last_anchor(self):

        expected_array = self.__compare_array
        result_array = []

        # find last element in not verified list
        not_verified_list = self.__wb.find_element_by_id('notVerifiedList')
        last_anchor_xpath = '//table/tbody/tr[last()]'
        last_anchor_row = not_verified_list.find_element_by_xpath(last_anchor_xpath)
        # click edit button & call edit anchor function
        edit_button = last_anchor_row.find_element_by_class_name('edit-button')
        edit_button.click()

        # Wait for modal window
        print(colored('T9. Check is modal window opened', 'green'))
        WebDriverWait(self.__wb, 10).until(EC.presence_of_element_located((By.CLASS_NAME, 'mat-dialog-container')))
        # [TO DO] - name of modal
        print(colored('[TO DO]. Here should be displayed title "Edit anchor"', 'green'))
        # assert(edit_anchor_modal.text == 'Add anchor', "[FAILURE] Edit modal has not been displayed")
        print(colored('T10. Appear [edit] modal window', 'green'))

        # get variables from filled form
        edit_short_id_input = self.__wb.find_element_by_id('device-short-id')
        edit_short_id_input_value = edit_short_id_input.get_attribute('value')
        # Assert 1 : shortId verification
        assert edit_short_id_input_value == self.__short_id, '[Failure] Displayed shortId is invalid'

        edit_long_id_input = self.__wb.find_element_by_id('device-long-id')
        edit_long_id_input_value = edit_long_id_input.get_attribute('value')
        # Assert 2 : LongId verification
        assert edit_long_id_input_value == self.__long_id, '[Failure] Displayed longId is invalid'

        # result_array.append(edit_long_id_input_value)
        edit_name_input = self.__wb.find_element_by_id('device-name')
        edit_name_input_value = edit_name_input.get_attribute('value')
        # Assert 3 : Name verification
        assert edit_name_input_value == self.__name, '[Failure] Displayed name is invalid'

        # clear inputs & and fill new data
        edit_short_id_input.clear()
        edit_long_id_input.clear()
        edit_name_input.clear()

        edit_short_id_input.send_keys(self.__new_short_id)
        edit_long_id_input.send_keys(self.__long_id)
        edit_name_input.send_keys('edited name')
        # click save button
        save_button = self.__wb.find_element_by_id('save-button')
        save_button.click()

        # There should appear new anchor row with correctly data
        # Step 1: displayed information ?
        # Step 2: properly data ?
        # Step 3: push variable to compare_array to check correctly data

        WebDriverWait(self.__wb, 5).until(EC.presence_of_element_located((By.CLASS_NAME, 'mat-simple-snackbar-message')))
        toast_device_saved_text = self.__wb.find_element_by_class_name('mat-simple-snackbar-message').text

        assert toast_device_saved_text == 'Device has been saved', '[Failure] The message is incorrect'
        # Print Success
        print(colored('T11.[Complete] Edit anchor functionality', 'green'))
        # Call function remove anchor
        self.__remove_anchor(self.__new_short_id)
    #
    # Test of removing anchor
    #

    def __remove_anchor(self, short_id):
        print(colored('\nREMOVE ANCHOR TEST', 'yellow'))
        remove_anchor_button = self.__wb.find_element_by_id('remove-'+short_id)
        remove_anchor_button.click()

        try:
            # Wait for message
            WebDriverWait(self.__wb, 5).until(EC.presence_of_element_located((By.CLASS_NAME, 'mat-simple-snackbar-message')))
            toast_device_removed_text = self.__wb.find_element_by_class_name('mat-simple-snackbar-message').text
            # Check the message content is displayed correctly
            assert toast_device_removed_text == 'Device has been removed', '[Failure] The message in toast is invalid'
            print(colored('T12.[Complete] Remove anchor functionality', 'green'))

        except TimeoutException:
            print(colored("[Failure] Wait for element too long", "red"))
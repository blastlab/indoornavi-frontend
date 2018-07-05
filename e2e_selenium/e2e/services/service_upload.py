import os
import random


class ServiceUpload(object):

    def __init__(self, file_path):
        self.thread = random.randint(1, 99999)
        self.__file_path = file_path

    @staticmethod
    def __convert_bytes(num):
        """
        this function will convert bytes to MB.... GB... etc
        """
        for x in ['bytes', 'KB', 'MB', 'GB', 'TB']:
            if num < 1000.0:
                return "%3.3f %s" % (num, x)
            num /= 1000.0

    def get_abs_path(self):
        __path = os.path.dirname(os.path.abspath(__file__))[:-8]+self.__file_path
        return __path

    def get_filename(self):
        __filename = os.path.basename(self.get_abs_path())
        return __filename

    def get_file_size(self):
        """
        this function will return the readable file size
        """
        __abs_path = self.get_abs_path()

        if os.path.isfile(__abs_path):

           file_info = os.stat(__abs_path)
           converted_file = self.__convert_bytes(file_info.st_size)
           return converted_file

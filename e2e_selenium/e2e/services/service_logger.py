import logging
import time
import os


class ServiceLogger(object):

    def __init__(self, module):
        self.__module = module
        self.logger = logging.getLogger(self.__module)
        self.logger.setLevel(logging.INFO)
        self.formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        self.__set_handler()
        self.__save_log()

    def __set_handler(self):
        ch = logging.StreamHandler()
        ch.setFormatter(self.formatter)
        self.logger.addHandler(ch)

    def __save_log(self):
        reports_path = 'test-reports/logs'
        datetime = time.strftime('%H:%M:%S:_%d_%m_%Y')

        try:
          os.makedirs(reports_path)
        except OSError:
          pass

        FORMAT = '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        logging.basicConfig(format=FORMAT, filename='{0}/{1}_{2}.log'.format(reports_path, datetime, self.__module))

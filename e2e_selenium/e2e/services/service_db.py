import mysql.connector
from pyquibase.pyquibase import Pyquibase
from .service_data import get_csv_data
import logging
import time
from .service_logger import ServiceLogger
import threading


class ServiceDb:

    __db_hostname = 'localhost'
    __db_tables_array = ['complex', 'building', 'floor',
                        'sink', 'anchor', 'tag', 'device',
                        'configuration', 'image',
                        'permission', 'permissiongroup',
                        'permissiongroup_permission', ]

    TABLE_TRUNCATE_SIZE = 9
    TABLE_TRUNCATE_PERMISSIONS_SIZE = 12

    def __init__(self):
        self.ServiceDbId = threading.current_thread()
        self.ServiceLogger = ServiceLogger(self.__class__.__name__)
        self.ServiceLogger.logger.info("Init service Db" + str(self.ServiceDbId))

        self.db_connect = mysql.connector.connect(user='root', password='', host=self.__db_hostname, database='Navi')
        self.ServiceLogger.logger.info("Connect to Db")

        self.db_cursor = self.db_connect.cursor()
        self.ServiceLogger.logger.info(" Start cursor")

        self.db_cursor.execute('SET FOREIGN_KEY_CHECKS=0;')
        self.ServiceLogger.logger.info("SET FOREIGN_KEY_CHECKS=0;")

    def __del__(self):
        self.ServiceLogger.logger.info("Destroy service Db")

        self.db_cursor.execute('SET FOREIGN_KEY_CHECKS=1;')

        self.ServiceLogger.logger.info("SET SET FOREIGN_KEY_CHECKS=1;")

        self.db_cursor.close()
        self.ServiceLogger.logger.info("Close cursor")

        self.db_connect.commit()
        self.ServiceLogger.logger.info("Commit changes to Db")

        self.db_connect.close()
        self.ServiceLogger.logger.info("Close connect")

    # Select from db
    def if_exist_in_db(self, query):
        self.db_cursor.execute(query)
        last_construction_name = '';
        for (name) in self.db_cursor:
            last_construction_name = name[0]
            self.ServiceLogger.logger.info("Select from db - query: {0}\n "
                         "Result - {1}".format(query, last_construction_name))

        return last_construction_name

    def insert_to_db(self, table, columns, values):

        if self.db_connect is not None and self.db_cursor is not None:
           if type(values) is not tuple or type(columns) is not tuple or type(table) is not str:
              raise ValueError('Wrong values passed to DB INSERT METHOD.')
           if len(columns) == len(values):
              column_names_for_command = ", ".join([v for v in columns])
              values_string_fields = ", ".join('%s' for _ in range(len(values)))
              command_composition = ("INSERT INTO {} "
                                     "({}) "
                                     "VALUES ({})".format(table, column_names_for_command, values_string_fields)
                                     )
              try:
                self.db_cursor.execute(command_composition, values)
                # values_str = ''.join(values)
                # print(values) if len(values) < 255 else print('Cannot print too long string')
                self.ServiceLogger.logger.info("Insert to db {0} ".format(table))
              except ValueError as error:
                self.ServiceLogger.logger.info(error)
           else:
              raise ValueError('Number of columns is not equal to number of values')
        else:
          raise ValueError('Set connection to db before executing insertion')

    def insert_to_db_from_csv(self, table, columns, filepath):

        if columns is not tuple and columns == 'id':
            columns = tuple([columns])

        _values_array = get_csv_data(filepath)

        for row_values in _values_array:
            values_tuple = tuple(row_values)
            result_tuple = tuple(var if var != 'NULL' else None for var in values_tuple)

            self.insert_to_db(table, columns, result_tuple)

    def update_table(self, update_params):

        if self.db_connect is not None and self.db_cursor is not None:
           if type(update_params) is not dict:
              raise ValueError('Wrong parameters passed to DB UPDATE METHOD.')
           if len(update_params) == 5:
              update_table = update_params['table']
              set_column = update_params['set_column']
              set_value = update_params['set_value']
              where_column = update_params['where_column']
              where_value = update_params['where_value']
              try:
                 self.db_cursor.execute("UPDATE {} SET `{}`='{}' WHERE `{}`='{}';"
                                        .format(update_table, set_column, set_value, where_column, where_value))
              except ValueError as error:
                self.ServiceLogger.logger.info(error)
           else:
             raise ValueError('Number of parameters is not enough to make update.')
        else:
          raise ValueError('Set connection to db before executing update')

    def truncate_single_table(self, table):
        self.db_cursor.execute("TRUNCATE TABLE {}".format(table))
        self.ServiceLogger.logger.info("Truncate table : {}".format(table))

    def truncate_db(self):
        for table in self.__db_tables_array[0:self.TABLE_TRUNCATE_SIZE]:
            self.db_cursor.execute("TRUNCATE TABLE {}".format(table))
            self.ServiceLogger.logger.info("Truncate table : {}".format(table))

    def truncate_db_permissions(self):
        for table in self.__db_tables_array[0:self.TABLE_TRUNCATE_PERMISSIONS_SIZE]:
            self.db_cursor.execute("TRUNCATE TABLE {}".format(table))
            self.ServiceLogger.logger.info("Truncate table : {}".format(table))

    def create_db_env(self, file_path):
        pyquibase = Pyquibase.mysql(
          host=self.__db_hostname,
          port=3306,
          db_name='Navi',
          username='root',
          password='',
          change_log_file=file_path
        )
        pyquibase.update()

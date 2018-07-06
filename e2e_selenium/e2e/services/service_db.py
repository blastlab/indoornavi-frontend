import mysql.connector
from pyquibase.pyquibase import Pyquibase


class ServiceDb(object):

    __db_hostname = 'localhost'
    __db_tables_array = ['complex', 'building', 'floor',
                        'sink', 'anchor', 'tag', 'device',
                         'configuration',
                        'permission', 'permissiongroup',
                        'permissiongroup_permission', ]

    def __init__(self):
        self.db_connect = mysql.connector.connect(user='root', password='', host=self.__db_hostname, database='Navi')
        self.db_cursor = self.db_connect.cursor()
        self.db_cursor.execute('SET FOREIGN_KEY_CHECKS=0;')

    def __del__(self):
        self.db_cursor.execute('SET FOREIGN_KEY_CHECKS=1;')
        self.db_cursor.close()
        self.db_connect.commit()
        self.db_connect.close()

    # Select from db
    def if_exist_in_db(self, query):
        self.db_cursor.execute(query)
        last_construction_name = '';
        for (name) in self.db_cursor:
            last_construction_name = name[0]
        return last_construction_name

    def insert_to_db(self, table, columns, values):

        print(table)
        print(columns)
        print(values)

        if self.db_connect is not None and self.db_cursor is not None:
           print('1st stage')
           if type(values) is not tuple or type(columns) is not tuple or type(table) is not str:
              raise ValueError('Wrong values passed to db insert method')
           print(len(columns))
           if len(columns) == len(values):
              column_names_for_command = ", ".join([v for v in columns])
              values_string_fields = ", ".join('%s' for _ in range(len(values)))
              command_composition = ("INSERT INTO {} "
                                     "({}) "
                                     "VALUES ({})".format(table, column_names_for_command, values_string_fields)
                                     )
              print(column_names_for_command)
              print(values_string_fields)
              print(command_composition)
              try:
                self.db_cursor.execute(command_composition, values)
              except ValueError as error:
                print(error)
           else:
              raise ValueError('Number of columns is not equal to number of values')
        else:
          raise ValueError('Set connection to db before executing insertion')

    def truncate_single_table(self, table):
        self.db_cursor.execute("TRUNCATE TABLE {}".format(table))

    def truncate_db(self):
        for table in self.__db_tables_array[0:8]:
            self.db_cursor.execute("TRUNCATE TABLE {}".format(table))

    def truncate_db_permissions(self):
        for table in self.__db_tables_array[0:11]:
            self.db_cursor.execute("TRUNCATE TABLE {}".format(table))

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

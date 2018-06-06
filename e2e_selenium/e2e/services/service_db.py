import mysql.connector
from pyquibase.pyquibase import Pyquibase


class ServiceDb(object):

    __db_hostname = 'localhost'
    __db_tables_array = ['complex', 'building', 'floor',
                        'sink', 'anchor', 'tag', 'device',
                        'permission', 'permissiongroup',
                        'permissiongroup_permission']

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

    def truncate_db(self):
        for table in self.__db_tables_array[0:7]:
            self.db_cursor.execute("TRUNCATE TABLE {}".format(table))

    def truncate_db_permissions(self):
        for table in self.__db_tables_array[0:10]:
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

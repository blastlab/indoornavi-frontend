from selenium import webdriver

from e2e.Login import Login
from e2e.Device import Device

localUrl = 'http://localhost:4200/'
wb = webdriver.Chrome('/home/motlowski/Downloads/chromedriver')
wb.get(localUrl)

login = Login(wb)
device = Device(wb)

if __name__ == '__main__':
	login.test()
	device.test()
	wb.close()
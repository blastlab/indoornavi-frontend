import {browser, by, element} from 'protractor';
import {Utils} from '../utils';

export class ChangePasswordPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'changePassword');
  }

  static getCurrentUser() {
    return element(by.id('currentUser'));
  }

  static typeDifferentPasswords() {
    Utils.waitForElement(element(by.id('user-newPassword-input')));
    element(by.id('user-newPassword-input')).sendKeys('test');
    element(by.id('user-newPassword-repeat-input')).sendKeys('not');
  }

  static changePassword(oldPassword: string, newPassword: string) {
    Utils.waitForElement(element(by.id('user-oldPassword-input')));
    element(by.id('user-oldPassword-input')).sendKeys(oldPassword);
    element(by.id('user-newPassword-input')).sendKeys(newPassword);
    element(by.id('user-newPassword-repeat-input')).sendKeys(newPassword);
    element(by.id('user-save-button')).click();
  }

  static loginWithNewPassword() {
    Utils.waitForElement(element(by.id('user-name-input')));
    element(by.id('user-name-input')).sendKeys('admin');
    element(by.id('user-password-input')).sendKeys('test');
    element(by.id('login-button')).click();
    return browser.driver.wait(() => {
      return browser.driver.getCurrentUrl().then((url) => {
        return url.indexOf('/complexes') >= 0;
      });
    }, 5000);
  }
}

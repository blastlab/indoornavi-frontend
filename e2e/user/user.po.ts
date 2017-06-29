import {browser, by, element} from 'protractor';
import {Utils} from '../utils';

export class UserPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'users');
  }

  static prepareToAddUser() {
    // first, we check that user with username 'test' already exists, if so we remove him
    element(by.id('remove-test')).isPresent().then((isPresent: boolean) => {
      if (isPresent) {
        element(by.id('remove-test')).click();
      }
    });
  }

  static addUser() {
    element(by.id('new-user-button')).click();
    element(by.id('user-name-input')).sendKeys('test');
    element(by.id('user-password-input')).sendKeys('test');
    element(by.id('user-repeat-password-input')).sendKeys('test');
    element(by.id('user-save-button')).click();
  }

  static removeLastAddedUser() {
    element.all(by.className('remove-button')).last().click();
  }

  static getUsersCount() {
    return element.all(by.tagName('tr')).count();
  }

  static openAddUserModal() {
    element(by.id('new-user-button')).click();
  }

  static typeDifferentPasswords() {
    element(by.id('user-password-input')).sendKeys('test');
    element(by.id('user-repeat-password-input')).sendKeys('not');
  }

  static editUser(id: string, name: string) {
    element(by.id(id)).click();
    element(by.id('user-name-input')).clear();
    element(by.id('user-name-input')).sendKeys(name);
    element(by.id('user-save-button')).click();
  }

  static getEditedUser() {
    return element(by.id('newName'));
  }
}

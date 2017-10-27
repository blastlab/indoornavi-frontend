import {browser, by, element} from 'protractor';
import {Utils} from '../utils';

export class UserPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'users');
  }

  static prepareToAddUser() {
    // first, we check that user with username 'test' already exists, if so we remove him
    // element(by.id('remove-test')).isPresent().then((isPresent: boolean) => {
    //   if (isPresent) {
    //     element(by.id('remove-test')).click();
    //   }
    // });
    const removeTest = element(by.id('user-name-input'));
    Utils.waitForElement(removeTest);
    removeTest.click();
  }

  static addUser() {
    const newUserButton = element(by.id('new-user-button'));
    const userNameInput = element(by.id('user-name-input'));
    const userPsswdInput = element(by.id('user-password-input'));
    const userRepeatPsswdInput = element(by.id('user-repeat-password-input'));
    const userSaveButton = element(by.id('user-save-button'));
    Utils.getScreenshots('AddUser');
    Utils.waitForElement(newUserButton);
    newUserButton.click();
    Utils.waitForElement(userNameInput);
    Utils.getScreenshots('AddUser');
    userNameInput.sendKeys('test');
    userPsswdInput.sendKeys('test');
    userRepeatPsswdInput.sendKeys('test');
    userSaveButton.click();
    Utils.getScreenshots('AddUser');
  }

  static removeLastAddedUser() {
    element.all(by.className('remove-button')).last().click();
  }

  static openAddUserModal() {
    const newUserButton = element(by.id('new-user-button'));
    Utils.waitForElement(newUserButton);
    newUserButton.click();
  }

  static typeDifferentPasswords() {
    Utils.waitForElement(element(by.id('user-password-input')));
    element(by.id('user-password-input')).sendKeys('test');
    element(by.id('user-repeat-password-input')).sendKeys('not');
  }

  static editUser(id: string, name: string) {
    Utils.waitForElement(element(by.id(id)));
    element(by.id(id)).click();
    element(by.id('user-name-input')).clear();
    element(by.id('user-name-input')).sendKeys(name);
    element(by.id('user-save-button')).click();
  }

  static getEditedUser(id: string) {
    const userName = element(by.id(id));
    Utils.waitForElement(userName);
    return userName;
  }
}

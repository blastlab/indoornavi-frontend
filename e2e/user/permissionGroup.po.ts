import {Utils} from '../utils';
import {browser, by, element} from 'protractor';

export class PermissionGroupPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'permissionGroups');
  }

  static addPermissionGroup() {
    const permissionGroupButton = element(by.id('new-permissionGroup-button'));
    const nameInput = element(by.id('name-input'));
    const multiselectNG2 = element(by.tagName('angular2-multiselect'));
    const pureCheckbox = element.all(by.className('pure-checkbox')).first();
    const saveButton = element(by.id('save-button'));
    Utils.waitForElement(permissionGroupButton);
    permissionGroupButton.click();
    Utils.waitForElement(nameInput);
    nameInput.sendKeys('Test');
    Utils.waitForElement(multiselectNG2);
    multiselectNG2.click();
    Utils.waitForElement(pureCheckbox);
    pureCheckbox.click();
    Utils.waitForElement(multiselectNG2);
    multiselectNG2.click();
    Utils.waitForElement(saveButton);
    saveButton.click();
  }

  static editPermissionGroupName(name: string) {
    PermissionGroupPage.getLastPermissionGroup().element(by.className('edit-button')).click();
    Utils.waitForElement(element(by.id('name-input')));
    element(by.id('name-input')).clear();
    element(by.id('name-input')).sendKeys(name);
    element(by.id('save-button')).click();
  }

  static removeLastPermissionGroup() {
    element.all(by.tagName('tr')).last().element(by.className('remove-button')).click();
  }

  static getLastPermissionGroup() {
    return element.all(by.tagName('tr')).last();
  }

  static getLastPermissionGroupName() {
    return PermissionGroupPage.getLastPermissionGroup().all(by.tagName('td')).first().getText();
  }
}

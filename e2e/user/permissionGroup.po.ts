import {Utils} from '../utils';
import {browser, by, element} from 'protractor';

export class PermissionGroupPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'permissionGroups');
  }

  static addPermissionGroup() {
    element(by.id('new-permissionGroup-button')).click();
    element(by.id('name-input')).sendKeys('Test');
    element(by.tagName('angular2-multiselect')).click();
    element.all(by.className('pure-checkbox')).first().click();
    element(by.tagName('angular2-multiselect')).click();
    element(by.id('save-button')).click();
  }

  static getPermissionGroupsCount() {
    return element.all(by.tagName('tr')).count();
  }

  static removeLastPermissionGroup() {
    element.all(by.tagName('tr')).last().element(by.className('remove-button')).click();
  }
}

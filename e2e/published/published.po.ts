import {browser, by, element, promise as protractorPromise} from 'protractor';
import {Utils} from '../utils';
import {WebElement} from 'selenium-webdriver';

export class PublishedPage {
  static navigateToPublishedList() {
    return browser.get(Utils.baseUrl + 'maps');
  }

  static createPublishedMap(elementName: string) {
    element(by.id('new-publishedList-button')).click();
    element(by.name('complexId')).click();
    element(by.cssContainingText('md-option.complexOption', elementName)).click();
    element(by.name('buildingId')).click();
    element(by.cssContainingText('md-option.buildingOption', elementName)).click();
    element(by.name('floorId')).click();
    element(by.cssContainingText('md-option.floorOption', '0')).click();
    element(by.className('tags')).click();
    element(by.className('tags')).element(by.className('select-all')).click();
    element(by.className('tags')).click();
    element(by.className('users')).click();
    element(by.className('users')).element(by.className('select-all')).click();
    element(by.className('users')).click();
    element(by.id('save-button')).click();
  }

  static removeLastlyAddedMap() {
    element.all(by.className('deleteButton')).last().click();
  }

  static getMapsCount(): protractorPromise.Promise<number> {
    return element.all(by.tagName('datatable-row-wrapper')).count();
  }

  static editPublishedMap() {
    element.all(by.className('editButton')).last().click();
    element(by.className('tags')).click();
    element(by.cssContainingText('.pure-checkbox label', '11999 - 1199999')).click();
    element(by.className('tags')).click();
    element(by.className('users')).click();
    element(by.cssContainingText('.pure-checkbox label', 'user')).click();
    element(by.className('users')).click();
    element(by.id('save-button')).click();
  }

  static getLastMap(): Promise<LastMap> {
    return new Promise((resolve) => {
      element.all(by.tagName('datatable-row-wrapper')).last().all(by.className('datatable-body-cell-label')).then((elements: WebElement[]) => {
        resolve({
          floor: elements[0].getText(),
          tags: elements[1].getText(),
          users: elements[2].getText()
        });
      });
    });
  }
}

export interface LastMap {
  floor: string;
  tags: string;
  users: string;
}

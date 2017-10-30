import {browser, by, element, promise as protractorPromise} from 'protractor';
import {Utils} from '../utils';
import {ScaleTool} from '../map/toolbar/tools/scale/scale.po';
import {Measure} from '../../src/app/map/toolbar/tools/scale/scale.type';
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
    element(by.className('tags')).element(by.cssContainingText('label', '10999 - 1099999')).click();
    element(by.className('tags')).element(by.cssContainingText('label', '11999 - 1199999')).click();
    element(by.className('tags')).click();
    element(by.className('users')).click();
    element(by.className('users')).element(by.cssContainingText('label', 'admin')).click();
    element(by.className('users')).element(by.cssContainingText('label', 'user')).click();
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
    element(by.className('tags')).element(by.cssContainingText('label', '11999 - 1199999')).click();
    element(by.className('tags')).click();
    element(by.className('users')).click();
    element(by.className('users')).element(by.cssContainingText('label', 'user')).click();
    element(by.className('users')).click();
    element(by.id('save-button')).click();
  }

  static getLastMap(): Promise<LastMap> {
    return new Promise((resolve) => {
      element.all(by.tagName('datatable-row-wrapper')).last().all(by.className('datatable-body-cell-label')).then((elements: WebElement[]) => {
        elements[0].getText().then((floor: string) => {
          elements[1].getText().then((tags: string) => {
            elements[2].getText().then((users: string) => {
              resolve({
                floor: floor,
                tags: tags,
                users: users
              });
            });
          });
        })
      });
    });
  }

  static prepareScale() {
    const svg = element(by.id('map'));
    ScaleTool.clickScaleTool();
    ScaleTool.clickMap(svg, 126, 125);
    ScaleTool.clickMap(svg, 241, 342);
    ScaleTool.fillInScaleInput(100, Measure.CENTIMETERS);
    ScaleTool.clickConfirm();
    browser.sleep(5000); // wait till save draft
    element(by.id('publish')).click();
    element(by.cssContainingText('button', 'No, just publish changes')).click();
  }
}

export interface LastMap {
  floor: string;
  tags: string;
  users: string;
}

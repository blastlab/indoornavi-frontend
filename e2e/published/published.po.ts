import {browser, by, element, promise as protractorPromise} from 'protractor';
import {Utils} from '../utils';
import {ScaleTool} from '../map/toolbar/tools/scale/scale.po';
import {Measure} from '../../src/app/map/toolbar/tools/scale/scale.type';

export class PublishedPage {
  static navigateToPublishedList() {
    return browser.get(Utils.baseUrl + 'maps');
  }

  static createPublishedMap(elementName: string) {
    Utils.waitForElement(element(by.id('new-publishedList-button')));
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
    Utils.waitForElement(element.all(by.className('deleteButton')).last());
    element.all(by.className('deleteButton')).last().click();
  }

  static getMapsCount(): protractorPromise.Promise<number> {
    return element.all(by.tagName('datatable-row-wrapper')).count();
  }

  static editPublishedMap() {
    Utils.waitForElement(element.all(by.className('editButton')).last());
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
      resolve({
        floor: element.all(by.tagName('datatable-row-wrapper')).last().all(by.className('datatable-body-cell-label')).get(0).getText(),
        tags: element.all(by.tagName('datatable-row-wrapper')).last().all(by.className('datatable-body-cell-label')).get(1).getText(),
        users: element.all(by.tagName('datatable-row-wrapper')).last().all(by.className('datatable-body-cell-label')).get(2).getText()
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

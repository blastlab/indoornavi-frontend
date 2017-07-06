import {browser, by, element} from 'protractor';
import {Utils} from '../utils';

export class IndoorNaviPage {
  static navigateToHome() {
    return browser.get(Utils.baseUrl + 'complexes');
  }

  static addComplex(name: string) {
    element(by.id('new-complex-button')).click();
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-save-button')).click();
  }

  static addBuilding(name: string) {
    element(by.id('new-building-button')).click();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  static addFloor(name: string, level: string) {
    element(by.id('new-floor-button')).click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
    element(by.id('floor-save-button')).click();
  }

  static removeLastFloor() {
    element.all(by.css('.floor-remove-button')).last().click();
  }

  static editLastFloor(name: string, level: string) {
    element.all(by.css('.floor-edit-button')).last().click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
    element(by.id('floor-save-button')).click();
  }

  static openBuildingsOfLastAddedComplex() {
    element.all(by.css('.complex-building-button')).last().click();
  }

  static openFloorOfLastAddedBuilding() {
    element.all(by.css('.building-floor-button')).last().click();
  }

  static editLastFloorWithoutSaving(name: string, level: string) {
    element.all(by.css('.floor-edit-button')).last().click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
  }

  static cancelEditingLastFloor() {
    element(by.css('.cdk-overlay-container')).click();
  }

  static getLatestAddedFloor() {
    return element.all(by.css('.floor-name')).last().getText();
  }

  static getLatestAddedFloorLevel() {
    return element.all(by.css('.floor-level')).last().getText();
  }

}

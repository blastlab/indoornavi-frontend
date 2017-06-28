import {browser, element, by} from 'protractor';

export class BuildingPage {
  static navigateToHome() {
    return browser.get('/');
  }

  static addComplex(name: string) {
    element(by.id('new-complex-button')).click();
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-save-button')).click();
  }

  static getTitle() {
    return element(by.css('app-root h1')).getText();
  }

  static addBuilding(name: string) {
    element(by.id('new-building-button')).click();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  static removeLastBuilding() {
    element.all(by.css('.building-remove-button')).last().click();
  }

  static editLastBuilding(name: string) {
    element.all(by.css('.building-edit-button')).last().click();
    element(by.id('building-name-input')).clear();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  static openBuildingsOfLastAddedComplex() {
    element.all(by.css('.complex-building-button')).last().click();
  }

  static editLastBuildingWithoutSaving(name: string) {
    element.all(by.css('.building-edit-button')).last().click();
    element(by.id('building-name-input')).clear();
    element(by.id('building-name-input')).sendKeys(name);
  }

  static cancelEditingLastBuilding() {
    element(by.css('.cdk-overlay-container')).click();
  }

  static getLatestAddedBuilding() {
    return element.all(by.css('.building-name')).last().getText();
  }

}

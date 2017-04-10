import {browser, element, by} from 'protractor';

export class IndoorNaviPage {
  navigateToHome() {
    return browser.get('/');
  }

  addComplex(name: string) {
    element(by.id('new-complex-button')).click();
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-save-button')).click();
  }

  getTitle() {
    return element(by.css('app-root h1')).getText();
  }

  addBuilding(name: string) {
    element(by.id('new-building-button')).click();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  removeLastBuilding() {
    element.all(by.css('.building-remove-button')).last().click();
  }

  editLastBuilding(name: string) {
    element.all(by.css('.building-edit-button')).last().click();
    element(by.id('building-name-input')).clear();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  openBuildingsOfLastAddedComplex() {
    element.all(by.css('.complex-building-button')).last().click();
  }

  editLastBuildingWithoutSaving(name: string) {
    element.all(by.css('.building-edit-button')).last().click();
    element(by.id('building-name-input')).clear();
    element(by.id('building-name-input')).sendKeys(name);
  }

  cancelEditingLastBuilding() {
    element(by.css('.cdk-overlay-container')).click();
  }

  getLatestAddedBuilding() {
    return element.all(by.css('.building-name')).last().getText();
  }

}

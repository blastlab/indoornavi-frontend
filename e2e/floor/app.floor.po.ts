import {browser, element, by} from 'protractor';

export class IndoorNaviPage {
  navigateToHome() {
    return browser.get('/');
  }

  addComplex(name: string) {
    element(by.id('complex-name-input')).sendKeys(name);
    element(by.id('complex-add-button')).click();
  }

  addBuilding(name: string) {
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-add-button')).click();
  }

  addFloor(name: string) {
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-add-button')).click();
  }

  removeLastFloor() {
    element.all(by.css('.floor-remove-button')).last().click();
  }

  editLastFloor(name: string) {
    element.all(by.css('.floor-edit-button')).last().click();
    element(by.id('new-floor-name-input')).clear();
    element(by.id('new-floor-name-input')).sendKeys(name);
    element(by.id('floor-edit-save-button')).click();
  }

  openBuildingsOfLastAddedComplex() {
    element.all(by.css('.complex-building-button')).last().click();
  }

  openFloorOfLastAddedBuilding() {
    element.all(by.css('.building-floor-button')).last().click();
  }

  editLastFloorWithoutSaving(name: string) {
    element.all(by.css('.floor-edit-button')).last().click();
    element(by.id('new-floor-name-input')).clear();
    element(by.id('new-floor-name-input')).sendKeys(name);
  }

  cancelEditingLastFloor() {
    element(by.css('.cdk-overlay-container')).click();
  }

  getLatestAddedFloor() {
    return element.all(by.css('.floor-name')).last().getText();
  }

}

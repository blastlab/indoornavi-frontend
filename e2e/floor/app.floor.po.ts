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

  addBuilding(name: string) {
    element(by.id('new-building-button')).click();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  addFloor(name: string, level: string) {
    element(by.id('new-floor-button')).click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
    element(by.id('floor-save-button')).click();
  }

  removeLastFloor() {
    element.all(by.css('.floor-remove-button')).last().click();
  }

  editLastFloor(name: string, level: string) {
    element.all(by.css('.floor-edit-button')).last().click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
    element(by.id('floor-save-button')).click();
  }

  openBuildingsOfLastAddedComplex() {
    element.all(by.css('.complex-building-button')).last().click();
  }

  openFloorOfLastAddedBuilding() {
    element.all(by.css('.building-floor-button')).last().click();
  }

  editLastFloorWithoutSaving(name: string, level: string) {
    element.all(by.css('.floor-edit-button')).last().click();
    element(by.id('floor-name-input')).clear();
    element(by.id('floor-level-input')).clear();
    element(by.id('floor-name-input')).sendKeys(name);
    element(by.id('floor-level-input')).sendKeys(level);
  }

  cancelEditingLastFloor() {
    element(by.css('.cdk-overlay-container')).click();
  }

  getLatestAddedFloor() {
    return element.all(by.css('.floor-name')).last().getText();
  }

  getLatestAddedFloorLevel() {
    return element.all(by.css('.floor-level')).last().getText();
  }

}

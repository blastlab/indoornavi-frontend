import {browser, element, by} from 'protractor';

export class MapComponent {
  static navigateToHome() {
    return browser.get('/');
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

  static openBuildingsOfLastAddedComplex() {
    element.all(by.className('complex-building-button')).last().click();
  }

  static openFloorOfLastAddedBuilding() {
    element.all(by.className('building-floor-button')).last().click();
  }

  static openMapOfLastAddedFloor() {
    element.all(by.className('floor-map-button')).last().click();
  }

  static deleteLastAddedComplex() {
    element.all(by.className('complex-remove-button')).last().click();
    element(by.id('complex-confirm-remove-button')).click();
  }

  static openBuildingsOfFirstComplex() {
    element.all(by.css('.complex-building-button')).first().click();
  }

  static openFloorOfFirstBuilding() {
    element.all(by.css('.building-floor-button')).first().click();
  }

  static openMapOfFirstFloor() {
    element.all(by.css('.floor-map-button')).first().click();
  }
}

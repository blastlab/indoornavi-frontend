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

  openBuildingsOfFirstComplex() {
    element.all(by.css('.complex-building-button')).first().click();
  }

  openFloorOfFirstBuilding() {
    element.all(by.css('.building-floor-button')).first().click();
  }

  openMapOfFirstFloor() {
    element.all(by.css('.floor-map-button')).first().click();
  }

  activateScaleTool() {
    element.all(by.css('.scale-button')).click();
  }

  clickMap(svg, x, y) {
    browser.actions().mouseMove(svg, {x: x, y: y}).click().perform();
  }

  clickSave() {
    element.all(by.css('save-button')).click();
  }
}

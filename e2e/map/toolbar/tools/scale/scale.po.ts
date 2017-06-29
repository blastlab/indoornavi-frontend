import {browser, element, by} from 'protractor';
import {Utils} from '../../../../utils';


export class IndoorNaviPage {
  navigateToHome() {
    return browser.get('/');
  }

  addBuilding(name: string) {
    element(by.id('new-building-button')).click();
    element(by.id('building-name-input')).sendKeys(name);
    element(by.id('building-save-button')).click();
  }

  openBuildingsOfFirstComplex() {
    element.all(by.className('complex-building-button')).first().click();
  }

  openFloorOfFirstBuilding() {
    element.all(by.className('building-floor-button')).first().click();
  }

  openMapOfFirstFloor() {
    element.all(by.className('floor-map-button')).first().click();
  }

  clickScaleTool() {
    element.all(by.className('scale-button')).click();
  }

  clickMap(svg, x, y) {
    browser.actions().mouseMove(svg, {x: x, y: y}).click().perform();
  }

  moveMouseTo(element) {
    browser.actions().mouseMove(element).perform();
  }

  clickSave() {
    element(by.id('saveButton')).click();
  }

  clickRemove() {
    element(by.id('removeButton')).click()
  }

  fillInScaleInput(distance, unit) {
    element(by.name('realDistance')).clear();
    element(by.name('realDistance')).sendKeys(distance);

    element(by.name('unit')).click();
    element(by.cssContainingText('md-option', unit)).click();
  }

  dragEnding(ending, point) {
    browser.actions().dragAndDrop(ending, point).mouseUp().perform();
  }
}

import {browser, element, by} from 'protractor';
import {Utils} from '../../../../utils';


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

  openBuildingsOfLastAddedComplex() {
    element.all(by.className('complex-building-button')).last().click();
  }

  openFloorOfLastAddedBuilding() {
    element.all(by.className('building-floor-button')).last().click();
  }

  openMapOfLastAddedFloor() {
    element.all(by.className('floor-map-button')).last().click();
  }

  turnOffScaleTool() {
    const scaleTest = this;
    element(by.id('hintBar')).isPresent().then(function (present) {
      if (!present) {
        return;
      }
    });
    element(by.id('hintBar')).getText().then(function (text) {
      if (text === 'Choose a tool.') {
        return;
      } else {
        scaleTest.clickScaleTool();
      }
    });
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
    element(by.id('removeButton')).click();
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

  deleteLastAddedComplex() {
    element.all(by.className('complex-remove-button')).last().click();
    element(by.id('complex-confirm-remove-button')).click();
  }
}

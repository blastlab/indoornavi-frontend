import {browser, by, element} from 'protractor';
import {Utils} from '../../../../utils';


export class ScaleTool {
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

  static addFloor(name: string, level: number) {
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

  static clickScaleTool() {
    element.all(by.className('scale-button')).click();
  }

  static clickMap(svg, x, y) {
    browser.actions().mouseMove(svg, {x: x, y: y}).click().perform();
  }

  static moveMouseTo(elementOfMouseMovement) {
    browser.actions().mouseMove(elementOfMouseMovement).perform();
  }

  static clickConfirm() {
    element(by.id('confirmScaleButton')).click();
  }

  static fillInScaleInput(distance, unit) {
    element(by.name('realDistance')).clear();
    element(by.name('realDistance')).sendKeys(distance);

    element(by.className('measure')).click();
    element(by.id('md-option-' + unit)).click();
  }

  static dragEnding(ending, point) {
    browser.actions().dragAndDrop(ending, point).mouseUp().perform();
  }

  static deleteLastAddedComplex() {
    element.all(by.className('complex-removeObject-button')).last().click();
    element(by.id('complex-confirm-removeObject-button')).click();
  }

  static turnOffScaleTool() {
    element(by.id('hintBar')).isPresent().then(function (present) {
      if (present) {
        element(by.id('hintBar')).getText().then(function (text) {
          if (text !== 'Choose a tool.') {
            ScaleTool.clickScaleTool();
          }
        });
      }
    });
  }
}

import {IndoorNaviPage} from './scale.po';
import {browser, element, by, ElementFinder, protractor} from 'protractor';

describe('ScaleComponentInit', () => {
  let page: IndoorNaviPage;
  let svg: ElementFinder;

  beforeAll(() => {
    page = new IndoorNaviPage();
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor('Test', '1');
    page.openMapOfLastAddedFloor();
    this.svg = element(by.id('mapBg'));
  });

  it('should upload image', () => {
    const path = require('path');
    const file = '../../../../resources/map.jpg';
    const absolutePath = path.resolve(__dirname, file);
    element(by.tagName('input')).sendKeys(absolutePath);
    expect(element(by.className('map-toolbar'))).toBeTruthy();
    expect(element(by.id('hint-bar'))).toBeTruthy();
    expect(element(by.id('hint-bar')).getText()).toEqual('Choose a tool.');
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale is not set');
  });
});

describe('ScaleComponent', () => {
  let page: IndoorNaviPage;
  let svg: ElementFinder;

  beforeEach(() => {
    page = new IndoorNaviPage();
    page.turnOffScaleTool();
    page.clickScaleTool();
    this.svg = element(by.id('mapBg'));
  });

  afterAll(() => {
    page.navigateToHome();
    page.deleteLastAddedComplex();
  });

  it('should be able to activate scale tool', () => {
    expect(element(by.id('hint-bar')).getText()).toEqual('SCALE: Click at map to set scale.');
  });
  it('should draw first scale and type in distance and unit', () => {
    const distance = '314';
    const unit = 'CENTIMETERS';
    page.clickMap(this.svg, 126, 125);
    page.clickMap(this.svg, 241, 342);
    DrawingChecker.expectScaleToExist();
    page.fillInScaleInput(distance, unit);
    page.clickSave();
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
    expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
    DrawingChecker.expectScaleNotToBeVisible();
  });

  it('should change scale with shift pressed', () => {
    const distance = '543';
    const unit = 'CENTIMETERS';
    const points = element.all(by.className('point'));
    const line = element(by.className('connectLine'));

    browser.actions().keyDown(protractor.Key.SHIFT).perform();
    page.dragEnding(points.first(), {x: 100, y: 0});
    expect(points.first().getAttribute('cx')).toEqual(points.last().getAttribute('cx'));
    expect(points.first().getAttribute('cy')).not.toEqual(points.last().getAttribute('cy'));
    browser.actions().keyUp(protractor.Key.SHIFT).perform();

    page.dragEnding(points.first(), {x: 50, y: 0});

    browser.actions().keyDown(protractor.Key.SHIFT).perform();
    page.dragEnding(points.first(), {x: 0, y: 200});
    expect(points.first().getAttribute('cx')).not.toEqual(points.last().getAttribute('cx'));
    expect(points.first().getAttribute('cy')).toEqual(points.last().getAttribute('cy'));
    browser.actions().keyUp(protractor.Key.SHIFT).perform();

    page.fillInScaleInput(distance, unit);
    DrawingChecker.expectScaleToBeVisible();

    page.clickSave();
    browser.driver.sleep(4000);
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
    expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
    DrawingChecker.expectScaleNotToBeVisible();
  });

   it('should change scale', () => {
   const distance = '543';
   const unit = 'CENTIMETERS';
   const points = element.all(by.className('point'));
   const line = element(by.className('connectLine'));

   page.dragEnding(points.first(), {x: 100, y: 100});
   page.dragEnding(points.last(), {x: 34, y: -100});
   page.fillInScaleInput(distance, unit);
   DrawingChecker.expectScaleToBeVisible();

   expect(points.first().getAttribute('cx')).toEqual(line.getAttribute('x1'));
   expect(points.first().getAttribute('cy')).toEqual(line.getAttribute('y1'));
   expect(points.last().getAttribute('cx')).toEqual(line.getAttribute('x2'));
   expect(points.last().getAttribute('cy')).toEqual(line.getAttribute('y2'));

   page.clickSave();
   expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
   expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
   DrawingChecker.expectScaleNotToBeVisible();
   });

   it('should create new scale after removing old one', () => {
   const distance = '765';
   const unit = 'CENTIMETERS';
   page.clickRemove();
   DrawingChecker.expectScaleNotToExist();
   page.clickMap(this.svg, 54, 34);
   page.clickMap(this.svg, 345, 82);
   DrawingChecker.expectScaleToExist();
   DrawingChecker.expectScaleToBeVisible();
   page.fillInScaleInput(distance, unit);
   page.clickSave();
   expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
   expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
   DrawingChecker.expectScaleNotToBeVisible();
   });

   it('should show scale on mouse over scale hint', () => {
   const scaleHint = element(by.id('scaleHint'));
   page.clickScaleTool();
   DrawingChecker.expectScaleNotToBeVisible();
   page.moveMouseTo(scaleHint);
   DrawingChecker.expectScaleToBeVisible();
   });

   it('should temporarily remove scale only from map view', () => {
   page.clickRemove();
   DrawingChecker.expectScaleNotToExist();

   expect(element(by.id('scaleHint')).getText()).toEqual('Scale is not set');
   expect(element(by.id('hintBar')).getText()).toEqual('SCALE: Click at map to set scale.');
   });
});

class DrawingChecker {

  public static expectScaleToExist() {
    expect(element.all(by.className('connectLine')).isPresent()).toBeTruthy();
    expect(element.all(by.className('endings')).first().isPresent()).toBeTruthy();
    expect(element.all(by.className('point')).first().isPresent()).toBeTruthy();
  }

  public static expectScaleNotToExist() {
    expect(element.all(by.className('connectLine')).isPresent()).not.toBeTruthy();
    expect(element.all(by.className('endings')).first().isPresent()).not.toBeTruthy();
    expect(element.all(by.className('point')).first().isPresent()).not.toBeTruthy();
  }

  public static expectScaleToBeVisible() {
    expect(element(by.id('scaleGroup')).getAttribute('style')).toEqual('display: flex;');
  }

  public static expectScaleNotToBeVisible() {
    expect(element(by.id('scaleGroup')).getAttribute('style')).toEqual('display: none;');
  }
}


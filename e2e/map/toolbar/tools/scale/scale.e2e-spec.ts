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

  it('should not be able to upload wrong type of image', () => {
    const path = require('path');
    const file = '../../../../resources/wrongFile.txt';
    const absolutePath = path.resolve(__dirname, file);
    element(by.tagName('input')).sendKeys(absolutePath);
    expect(element(by.className('file-upload'))).toBeTruthy();
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
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
    expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
    DrawingChecker.expectScaleNotToBeVisible();
  });

  it('should not hide point under the scale input', () => {
    const points = element.all(by.className('point'));
    page.dragEnding(points.first(), {x: 110, y: 30});
    element(by.id('scaleInput')).getCssValue('top').then(function (topPx) {
      const topString = topPx.toString();
      const top = topString.substring(0, topString.length - 2);
      const scaleInputTopInt = parseInt(top, 10);

      element(by.id('scaleInput')).getCssValue('left').then(function (leftPx) {
        const leftString = leftPx.toString();
        const left = leftString.substring(0, leftString.length - 2);
        const scaleInputLeftInt = parseInt(left, 10);

        points.first().getAttribute('cy').then(function (cy) {
          const pointCyInt = parseInt(cy, 10);
          points.first().getAttribute('cx').then(function (cx) {
            const pointCxInt = parseInt(cx, 10);

            const isNotOccurred: boolean = (pointCxInt < scaleInputLeftInt || pointCxInt > scaleInputLeftInt + 313)
              || (pointCyInt < scaleInputTopInt || pointCyInt > scaleInputTopInt + 43);
            expect(isNotOccurred).toBeTruthy();
          });
        });
      });
    });
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

  it('should not be able to type in text instead of number in scale input', () => {
    const distance = 'NaN';
    const unit = 'METERS';
    page.fillInScaleInput(distance, unit);
    page.clickSave();
    expect(element(by.id('hintBar')).getText()).toEqual('SCALE: Click at map to set scale.');
    DrawingChecker.expectScaleToBeVisible();
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

  it('should not draw scale outside of canvas', () => {
    const points = element.all(by.className('point'));
    page.dragEnding(points.first(), {x: 0, y: -100});

    expect(points.first().getAttribute('cy')).toEqual('0');
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


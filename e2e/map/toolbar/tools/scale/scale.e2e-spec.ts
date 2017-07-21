import {ScaleTool} from './scale.po';
import {browser, element, by, protractor, ElementFinder} from 'protractor';

describe('ScaleComponentInit', () => {
  let path: any;

  beforeAll(() => {
    ScaleTool.navigateToHome();
    ScaleTool.addComplex('Test');
    ScaleTool.openBuildingsOfLastAddedComplex();
    ScaleTool.addBuilding('Test');
    ScaleTool.openFloorOfLastAddedBuilding();
    ScaleTool.addFloor('Test', 1);
    ScaleTool.openMapOfLastAddedFloor();
    path = require('path');
  });

  it('should not be able to upload wrong type of image', () => {
    const file = '../../../../resources/wrongFile.txt';
    const absolutePath = path.resolve(__dirname, file);
    element(by.tagName('input')).sendKeys(absolutePath);
    expect(element(by.className('file-upload'))).toBeTruthy();
  });

  it('should upload image', () => {
    const file = '../../../../resources/map.jpg';
    const absolutePath = path.resolve(__dirname, file);
    element(by.tagName('input')).sendKeys(absolutePath);

    expect(element(by.className('map-toolbar'))).toBeTruthy();
    expect(element(by.id('hint-bar')).getText()).toEqual('Choose a tool.');
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale is not set');
  });
});

describe('ScaleComponent', () => {
  let svg: ElementFinder;

  beforeEach(() => {
    ScaleTool.turnOffScaleTool();
    ScaleTool.clickScaleTool();
    svg = element(by.id('mapBackground'));
  });

  afterAll(() => {
    ScaleTool.navigateToHome();
    ScaleTool.deleteLastAddedComplex();
  });

  it('should be able to activate scale tool', () => {
    expect(element(by.id('hint-bar')).getText()).toEqual('SCALE: Click at map to set scale.');
  });

  it('should draw first scale and type in distance and unit', () => {
    const distance = 314;
    const unit = 'CENTIMETERS';
    ScaleTool.clickMap(svg, 126, 125);
    ScaleTool.clickMap(svg, 241, 342);
    DrawingChecker.expectScaleToExist();
    ScaleTool.fillInScaleInput(distance, unit);
    ScaleTool.clickSave();
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
    expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
    DrawingChecker.expectScaleNotToBeVisible();
  });

  it('should change scale with shift pressed', () => {
    const distance = 543;
    const unit = 'CENTIMETERS';
    const points = element.all(by.className('point'));
    browser.actions().keyDown(protractor.Key.SHIFT).perform();
    ScaleTool.dragEnding(points.first(), {x: 100, y: 0});
    expect(points.first().getAttribute('cx')).toEqual(points.last().getAttribute('cx'));
    expect(points.first().getAttribute('cy')).not.toEqual(points.last().getAttribute('cy'));
    browser.actions().keyUp(protractor.Key.SHIFT).perform();
    ScaleTool.dragEnding(points.first(), {x: 50, y: 0});

    browser.actions().keyDown(protractor.Key.SHIFT).perform();

    ScaleTool.dragEnding(points.first(), {x: 0, y: 200});
    expect(points.first().getAttribute('cx')).not.toEqual(points.last().getAttribute('cx'));
    expect(points.first().getAttribute('cy')).toEqual(points.last().getAttribute('cy'));
    browser.actions().keyUp(protractor.Key.SHIFT).perform();

    ScaleTool.fillInScaleInput(distance, unit);
    DrawingChecker.expectScaleToBeVisible();

    ScaleTool.clickSave();
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
    expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
    DrawingChecker.expectScaleNotToBeVisible();

  });

  it('should not hide point under the scale input', (done: DoneFn) => {
    const points = element.all(by.className('point'));
    ScaleTool.dragEnding(points.first(), {x: 110, y: 30});
    element(by.id('scaleInput')).getCssValue('top').then((topPx) => {
      const scaleInputTopInt = parseInt(topPx, 10);
      element(by.id('scaleInput')).getCssValue('left').then((leftPx) => {
        const scaleInputLeftInt = parseInt(leftPx, 10);
        points.first().getAttribute('cy').then((cy: string) => {
          const pointCyInt = parseInt(cy, 10);
          points.first().getAttribute('cx').then((cx: string) => {
            const pointCxInt = parseInt(cx, 10);

            const isNotOccurred: boolean = (pointCxInt < scaleInputLeftInt || pointCxInt > scaleInputLeftInt + 313)
              || (pointCyInt < scaleInputTopInt || pointCyInt > scaleInputTopInt + 43);
            expect(isNotOccurred).toBeTruthy();
            done();
          });
        });
      });
    });
  });
  it('should change scale', () => {
    const distance = 543;
    const unit = 'CENTIMETERS';
    const points = element.all(by.className('point'));
    const line = element(by.className('connectLine'));

    ScaleTool.dragEnding(points.first(), {x: 100, y: 100});
    ScaleTool.dragEnding(points.last(), {x: 34, y: -100});
    ScaleTool.fillInScaleInput(distance, unit);
    DrawingChecker.expectScaleToBeVisible();
    expect(points.first().getAttribute('cx')).toEqual(line.getAttribute('x1'));
    expect(points.first().getAttribute('cy')).toEqual(line.getAttribute('y1'));
    expect(points.last().getAttribute('cx')).toEqual(line.getAttribute('x2'));
    expect(points.last().getAttribute('cy')).toEqual(line.getAttribute('y2'));

    ScaleTool.clickSave();
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
    expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
    DrawingChecker.expectScaleNotToBeVisible();
  });

  it('should not be able to type in text instead of number in scale input', () => {
    const distance = 'NaN';
    const unit = 'METERS';
    ScaleTool.fillInScaleInput(distance, unit);
    ScaleTool.clickSave();
    expect(element(by.id('hintBar')).getText()).toEqual('SCALE: Click at map to set scale.');
    DrawingChecker.expectScaleToBeVisible();
  });

  it('should create new scale after removing old one', () => {
    const distance = 765;
    const unit = 'CENTIMETERS';
    ScaleTool.clickRemove();
    DrawingChecker.expectScaleNotToExist();
    ScaleTool.clickMap(svg, 54, 34);
    ScaleTool.clickMap(svg, 345, 82);
    DrawingChecker.expectScaleToExist();
    DrawingChecker.expectScaleToBeVisible();
    ScaleTool.fillInScaleInput(distance, unit);
    ScaleTool.clickSave();
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale: ' + distance + ' cm');
    expect(element(by.id('hintBar')).getText()).toEqual('Choose a tool.');
    DrawingChecker.expectScaleNotToBeVisible();
  });

  it('should show scale on mouse over scale hint', () => {
    const scaleHint = element(by.id('scaleHint'));
    ScaleTool.clickScaleTool();
    DrawingChecker.expectScaleNotToBeVisible();
    ScaleTool.moveMouseTo(scaleHint);
    DrawingChecker.expectScaleToBeVisible();
  });

  it('should not draw scale outside of canvas', () => {
    const points = element.all(by.className('point'));
    ScaleTool.dragEnding(points.first(), {x: 0, y: -200});

    expect(points.first().getAttribute('cy')).toEqual('0');
  });

  it('should temporarily remove scale only from map view', () => {
    ScaleTool.clickRemove();
    DrawingChecker.expectScaleNotToExist();
    expect(element(by.id('scaleHint')).getText()).toEqual('Scale is not set');
    expect(element(by.id('hintBar')).getText()).toEqual('SCALE: Click at map to set scale.');
  });
});

class DrawingChecker {

  static expectScaleToExist() {
    expect(element.all(by.className('connectLine')).isPresent()).toBeTruthy();
    expect(element.all(by.className('endings')).first().isPresent()).toBeTruthy();
    expect(element.all(by.className('point')).first().isPresent()).toBeTruthy();
  }

  static expectScaleNotToExist() {
    expect(element.all(by.className('connectLine')).isPresent()).not.toBeTruthy();
    expect(element.all(by.className('endings')).first().isPresent()).not.toBeTruthy();
    expect(element.all(by.className('point')).first().isPresent()).not.toBeTruthy();
  }

  static expectScaleToBeVisible() {
    expect(element(by.id('scaleGroup')).getAttribute('style')).toEqual('display: flex;');
  }

  static expectScaleNotToBeVisible() {
    expect(element(by.id('scaleGroup')).getAttribute('style')).toEqual('display: none;');
  }
}


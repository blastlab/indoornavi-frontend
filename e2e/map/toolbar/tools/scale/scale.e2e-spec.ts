import {IndoorNaviPage} from './scale.po';
import {browser, element, by, ElementFinder} from 'protractor';

describe('ScaleComponent', () => {
  let page: IndoorNaviPage;
  let svg: ElementFinder;

  beforeEach(() => {
    page = new IndoorNaviPage();
    page.navigateToHome();
    page.openBuildingsOfFirstComplex();
    page.openFloorOfFirstBuilding();
    page.openMapOfFirstFloor();
    page.clickScaleTool();
    this.svg = element(by.id('mapBg'));
  });

  it('should be able to activate scale tool', () => {
   expect(element.all(by.css('p')).getText()).toContain('SCALE: Click at map to set scale.');
   });

   it('should draw first scale and type in distance and unit', () => {
   const distance = '314';
   const unit = 'CENTIMETERS';
   page.clickMap(this.svg, 26, 25);
   page.clickMap(this.svg, 161, 272);
   DrawingChecker.expectScaleToExist();
   page.fillInScaleInput(distance, unit);
   page.clickSave();
   expect(element.all(by.css('p')).getText()).toContain('Scale: ' + distance + ' cm');
   expect(element.all(by.css('p')).getText()).toContain('Choose a tool.');
   DrawingChecker.expectScaleNotToBeVisible();
   });

   it('should temporarily remove scale only from map view', () => {
   expect(element.all(by.css('p')).getText()).not.toContain('Scale is not set');
   page.clickRemove();
   DrawingChecker.expectScaleNotToExist();

   expect(element.all(by.css('p')).getText()).toContain('Scale is not set');
   expect(element.all(by.css('p')).getText()).toContain('SCALE: Click at map to set scale.');
   });

  it('should change scale', () => {
    const points = element.all(by.className('point'));
    page.dragEnding(points.first(), {x: 100, y: 100});
    page.dragEnding(points.last(), {x: 34, y: -100});
    const distance = '543';
    const unit = 'CENTIMETERS';
    page.fillInScaleInput(distance, unit);
    DrawingChecker.expectScaleToBeVisible();
    page.clickSave();

    expect(element.all(by.css('p')).getText()).toContain('Scale: ' + distance + ' cm');
    expect(element.all(by.css('p')).getText()).toContain('Choose a tool.');
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
   expect(element(by.id('scaleHint')).getText()).toContain('Scale: ' + distance + ' cm');
   expect(element(by.id('hintBar')).getText()).toContain('Choose a tool.');
   DrawingChecker.expectScaleNotToBeVisible();
   });

   it('should show scale on mouse over scale hint', () => {
   const scaleHint = element(by.id('scaleHint'));
   page.clickScaleTool();
   DrawingChecker.expectScaleNotToBeVisible();
   page.moveMouseTo(scaleHint);
   DrawingChecker.expectScaleToBeVisible();
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


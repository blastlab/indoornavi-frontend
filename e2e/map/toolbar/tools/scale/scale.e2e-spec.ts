import {IndoorNaviPage} from './scale.po';
import {browser, element, by} from 'protractor';

describe('ScaleComponent', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should be able to activate scale tool', () => {
    page.navigateToHome();
    // page.addComplex('Test');
    page.openBuildingsOfFirstComplex();
    // page.addBuilding('Test');
    page.openFloorOfFirstBuilding();
    page.openMapOfFirstFloor();
    page.activateScaleTool();
    expect(element.all(by.css('p')).getText()).toContain('SCALE: Click at map to set scale.');
  });

  it('should draw first scale and allow user to type in distance and unit', () => {
    page.navigateToHome();
    // page.addComplex('Test');
    page.openBuildingsOfFirstComplex();
    // page.addBuilding('Test');
    page.openFloorOfFirstBuilding();
    page.openMapOfFirstFloor();
    page.activateScaleTool();
    const svg = element(by.id('mapBg'));
    page.clickMap(svg, 20, 34);
    page.clickMap(svg, 345, 238);
    expect(element.all(by.id('connectLine')).isPresent()).toBeTruthy();
    expect(element.all(by.id('endings')).first().isPresent()).toBeTruthy();
    expect(element.all(by.id('scaleInput')).isPresent()).toBeTruthy();
  });

  it('should be able to activate scale tool', () => {
    page.navigateToHome();
    // page.addComplex('Test');
    page.openBuildingsOfFirstComplex();
    // page.addBuilding('Test');
    page.openFloorOfFirstBuilding();
    page.openMapOfFirstFloor();
    /*page.clickSave();

    browser.wait(result => {
      return element(by.tagName('snack-bar-container')).isPresent();
    }, 5000);*/

    // browser.pause();
    // expect(element.all(by.tagName('snack-bar-container')).isPresent()).toBeTruthy();
  });
});


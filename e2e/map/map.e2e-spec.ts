import {IndoorNaviPage} from './map.po';
import {browser, element, by} from 'protractor';

describe('MapComponent', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should be able to enter to map', () => {
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfFirstComplex();
    page.addBuilding('Test');
    page.openFloorOfFirstBuilding();
    page.openMapOfFirstFloor();
    page.activateScaleTool();
    expect(element.all(by.css('p')).getText()).toContain('SCALE: Click at map to set scale.');
  });
});

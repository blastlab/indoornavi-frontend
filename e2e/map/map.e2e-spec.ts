import {IndoorNaviPage} from './map.po';
import {browser, element, by} from 'protractor';

describe('MapComponent', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should open map', () => {
   page.navigateToHome();
   // page.addComplex('Test');
   page.openBuildingsOfFirstComplex();
   // page.addBuilding('Test');
   page.openFloorOfFirstBuilding();
   page.openMapOfFirstFloor();
    expect(element.all(by.css('p')).getText()).toContain('Choose a tool.');
  });
});

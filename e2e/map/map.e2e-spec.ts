import {MapComponent} from './map.po';
import {browser, element, by} from 'protractor';

describe('MapComponent', () => {
  let page: MapComponent;

  beforeEach(() => {
    page = new MapComponent();
  });

  beforeAll(() => {
    page = new MapComponent();
    MapComponent.navigateToHome();
    MapComponent.addComplex('Test');
    MapComponent.openBuildingsOfLastAddedComplex();
    MapComponent.addBuilding('Test');
    MapComponent.openFloorOfLastAddedBuilding();
    MapComponent.addFloor('Test', '1');
    MapComponent.openMapOfLastAddedFloor();
  });

  afterAll(() => {
    MapComponent.navigateToHome();
    MapComponent.deleteLastAddedComplex();
  });

  it('should open map', () => {
    expect(element.all(by.className('file-upload'))).toBeTruthy();
  });
});

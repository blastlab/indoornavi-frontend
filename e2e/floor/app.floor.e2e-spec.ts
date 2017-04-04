import {AppPage} from '../app.po';
import {IndoorNaviPage} from './app.floor.po';

describe('FloorComponent', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should have title', () => {
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    expect(AppPage.getTitle()).toEqual('Floors');
  });

  it('should be able to add new floor', () => {
    const newName = 'test';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName);
    expect(page.getLatestAddedFloor()).toEqual(newName);
  });

  it('should be able to remove foor', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName);
    page.addFloor(newName2);
    page.removeLastFloor();
    expect(page.getLatestAddedFloor()).toEqual(newName);
  });

  it('should be able to edit floor', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName);
    page.editLastFloor(newName2);
    expect(page.getLatestAddedFloor()).toEqual(newName2);
  });

  it('should cancel editing', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName);
    page.editLastFloorWithoutSaving(newName2);
    page.cancelEditingLastFloor();
    expect(page.getLatestAddedFloor()).toEqual(newName);
  });

});

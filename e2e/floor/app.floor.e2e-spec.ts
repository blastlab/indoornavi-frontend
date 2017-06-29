import {AppPage} from '../app.po';
import {IndoorNaviPage} from './app.floor.po';

describe('FloorComponent', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should have title', () => {
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding('Test');
    IndoorNaviPage.openFloorOfLastAddedBuilding();
    expect(AppPage.getTitle()).toEqual('Floors');
  });

  it('should be able to add new floor', () => {
    const newName = 'test';
    const newLevel = '3';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding('Test');
    IndoorNaviPage.openFloorOfLastAddedBuilding();
    IndoorNaviPage.addFloor(newName, newLevel);
    expect(IndoorNaviPage.getLatestAddedFloor()).toEqual(newName);
  });

  it('should be able to remove foor', () => {
    const newName = 'test';
    const newName2 = 'test2';
    const newLevel = '4';
    const newLevel2 = '5';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding('Test');
    IndoorNaviPage.openFloorOfLastAddedBuilding();
    IndoorNaviPage.addFloor(newName, newLevel);
    IndoorNaviPage.addFloor(newName2, newLevel2);
    IndoorNaviPage.removeLastFloor();
    expect(IndoorNaviPage.getLatestAddedFloor()).toEqual(newName);
  });

  it('should be able to edit floor', () => {
    const newName = 'test';
    const newName2 = 'test2';
    const newLevel = '4';
    const newLevel2 = '5';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding('Test');
    IndoorNaviPage.openFloorOfLastAddedBuilding();
    IndoorNaviPage.addFloor(newName, newLevel);
    IndoorNaviPage.editLastFloor(newName2, newLevel2);
    expect(IndoorNaviPage.getLatestAddedFloor()).toEqual(newName2);
  });

  it('should cancel editing', () => {
    const newName = 'test';
    const newName2 = 'test2';
    const newLevel = '4';
    const newLevel2 = '5';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding('Test');
    IndoorNaviPage.openFloorOfLastAddedBuilding();
    IndoorNaviPage.addFloor(newName, newLevel);
    IndoorNaviPage.editLastFloorWithoutSaving(newName2, newLevel2);
    IndoorNaviPage.cancelEditingLastFloor();
    expect(IndoorNaviPage.getLatestAddedFloor()).toEqual(newName);
    expect(IndoorNaviPage.getLatestAddedFloorLevel()).toEqual(newLevel);
  });


});

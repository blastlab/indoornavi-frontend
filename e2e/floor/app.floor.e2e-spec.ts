import {AppPage} from '../app.po';
import {IndoorNaviPage} from './app.floor.po';
import {browser, element, by} from 'protractor';

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
    const newLevel = '3';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName, newLevel);
    expect(page.getLatestAddedFloor()).toEqual(newName);
  });

  it('should be able to remove foor', () => {
    const newName = 'test';
    const newName2 = 'test2';
    const newLevel = '4';
    const newLevel2 = '5';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName, newLevel);
    page.addFloor(newName2, newLevel2);
    page.removeLastFloor();
    expect(page.getLatestAddedFloor()).toEqual(newName);
  });

  it('should be able to edit floor', () => {
    const newName = 'test';
    const newName2 = 'test2';
    const newLevel = '4';
    const newLevel2 = '5';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName, newLevel);
    page.editLastFloor(newName2, newLevel2);
    expect(page.getLatestAddedFloor()).toEqual(newName2);
  });

  it('should cancel editing', () => {
    const newName = 'test';
    const newName2 = 'test2';
    const newLevel = '4';
    const newLevel2 = '5';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding('Test');
    page.openFloorOfLastAddedBuilding();
    page.addFloor(newName, newLevel);
    page.editLastFloorWithoutSaving(newName2, newLevel2);
    page.cancelEditingLastFloor();
    expect(page.getLatestAddedFloor()).toEqual(newName);
    expect(page.getLatestAddedFloorLevel()).toEqual(newLevel);
  });


});

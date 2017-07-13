import {IndoorNaviPage} from './app.building.po';

describe('BuildingComponent', () => {
  let page: IndoorNaviPage;

  beforeEach(() => {
    page = new IndoorNaviPage();
  });

  it('should have title', () => {
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    expect(IndoorNaviPage.getTitle()).toEqual('Your buildings');
  });

  it('should be able to add new building', () => {
    const newName = 'test';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding(newName);
    expect(IndoorNaviPage.getLatestAddedBuilding()).toEqual(newName);
  });

  it('should be able to remove building', () => {
    const newName = 'test';
    const newName2 = 'test2';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding(newName);
    IndoorNaviPage.addBuilding(newName2);
    IndoorNaviPage.removeLastBuilding();
    expect(IndoorNaviPage.getLatestAddedBuilding()).toEqual(newName);
  });

  it('should be able to edit building', () => {
    const newName = 'test';
    const newName2 = 'test2';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding(newName);
    IndoorNaviPage.editLastBuilding(newName2);
    expect(IndoorNaviPage.getLatestAddedBuilding()).toEqual(newName2);
  });

  it('should cancel editing', () => {
    const newName = 'test';
    const newName2 = 'test2';
    IndoorNaviPage.navigateToHome();
    IndoorNaviPage.addComplex('Test');
    IndoorNaviPage.openBuildingsOfLastAddedComplex();
    IndoorNaviPage.addBuilding(newName);
    IndoorNaviPage.editLastBuildingWithoutSaving(newName2);
    IndoorNaviPage.cancelEditingLastBuilding();
    expect(IndoorNaviPage.getLatestAddedBuilding()).toEqual(newName);
  });

});

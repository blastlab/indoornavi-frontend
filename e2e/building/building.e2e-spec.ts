import {ComplexPage} from '../complex/complex.po';
import {BuildingPage} from './building.po';
import {browser} from 'protractor';
import {AppPage} from '../app.po';

describe('BuildingComponent', () => {

  beforeAll((done: DoneFn) => {
    BuildingPage.navigateToHome();
    ComplexPage.addComplex('testBuilding');
    ComplexPage.openLatestAddedComplex();
    done();
  });

  it('should have title', () => {
    expect(AppPage.getTitle()).toEqual('Your buildings');
  });

});

/*
  beforeEach(() => {
 page = new BuildingPage();
  });

  it('should have title', () => {
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    expect(page.getTitle()).toEqual('Your buildings');
  });

  it('should be able to add new building', () => {
    const newName = 'test';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding(newName);
    expect(page.getLatestAddedBuilding()).toEqual(newName);
  });

  it('should be able to remove building', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding(newName);
    page.addBuilding(newName2);
    page.removeLastBuilding();
    expect(page.getLatestAddedBuilding()).toEqual(newName);
  });

  it('should be able to edit building', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding(newName);
    page.editLastBuilding(newName2);
    expect(page.getLatestAddedBuilding()).toEqual(newName2);
  });

  it('should cancel editing', () => {
    const newName = 'test';
    const newName2 = 'test2';
    page.navigateToHome();
    page.addComplex('Test');
    page.openBuildingsOfLastAddedComplex();
    page.addBuilding(newName);
    page.editLastBuildingWithoutSaving(newName2);
    page.cancelEditingLastBuilding();
    expect(page.getLatestAddedBuilding()).toEqual(newName);
 browser.pause();
  });

});
 */

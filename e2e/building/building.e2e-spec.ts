import {BuildingPage} from './building.po';
import {AppPage} from '../app.po';

describe('BuildingComponent', () => {

  beforeAll(() => {
    BuildingPage.prepareAndOpenComplex('testBuilding');
  });

  afterAll(() => {
    BuildingPage.destroyLastComplex();
  });

  it('should have title', () => {
    expect(AppPage.getTitle()).toEqual('Your buildings');
  });

  it('should be able to add new, and remove building', (done: DoneFn) => {
    const name = 'testAddBuilding';
    const newName = 'testRename';
    BuildingPage.getBuildingsCount().then(initCount => {
      BuildingPage.addBuilding(name);
      expect(BuildingPage.getLatestAddedBuilding()).toEqual(name);
      BuildingPage.getBuildingsCount().then(count => {
        expect(count).toEqual(initCount + 1);
        BuildingPage.editLastBuilding(newName, true);
        expect(BuildingPage.getLatestAddedBuilding()).toEqual(newName);
        BuildingPage.openLatestAddedBuilding();
        AppPage.getCurrentUrl().then(pageUrl => {
          expect(pageUrl).toMatch(/complexes\/.*\/buildings\/.*\/floors/g);
          AppPage.navigateTo(BuildingPage.getBackUrl(pageUrl));
          done();
        });
        BuildingPage.editLastBuilding(name, false);
        AppPage.cancelEditingWithESC();
        expect(BuildingPage.getLatestAddedBuilding()).toEqual(newName);
        BuildingPage.removeLastBuilding();
        BuildingPage.getBuildingsCount().then(finalCount => {
          expect(finalCount).toEqual(initCount);
          done();
        });
      });
    });
  });

});

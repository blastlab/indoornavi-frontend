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
    AppPage.getElementsCount('tr.building').then(initCount => {
      BuildingPage.addBuilding(name);
      expect(BuildingPage.getLatestAddedBuildingName()).toEqual(name);
      AppPage.getElementsCount('tr.building').then(count => {
        expect(count).toEqual(initCount + 1);
        BuildingPage.editLastBuilding(newName, true);
        expect(BuildingPage.getLatestAddedBuildingName()).toEqual(newName);
        BuildingPage.openLatestAddedBuilding();
        AppPage.getCurrentUrl().then(pageUrl => {
          expect(pageUrl).toMatch(/complexes\/.*\/buildings\/.*\/floors/g);
          AppPage.navigateBack();
          BuildingPage.editLastBuilding(name, false);
          AppPage.cancelEditingWithESC();
          expect(BuildingPage.getLatestAddedBuildingName()).toEqual(newName);
          BuildingPage.removeLastBuilding();
          AppPage.getElementsCount('tr.building').then(finalCount => {
            expect(finalCount).toEqual(initCount);
            done();
          });
        });
      });
    });
  });

});

import {AppPage} from '../app.po';
import {FloorPage} from './floor.po';

describe('FloorComponent', () => {

  beforeAll(() => {
    FloorPage.prepareAndOpenBuilding('testFloor');
  });

  afterAll(() => {
    FloorPage.destroyLastComplex();
  });

  it('should have title', () => {
    expect(AppPage.getTitle()).toEqual('Floors');
  });

  it('should be able to add new, and remove floor', (done: DoneFn) => {
    const name = 'testAddFloor';
    const newName = 'testRename';
    AppPage.getElementsCount('tr.floor').then(initCount => {
      FloorPage.addFloor(name, 0);
      expect(FloorPage.getLatestAddedFloorName()).toEqual(name);
      expect(FloorPage.getLatestAddedFloorLevel()).toBe('0');
      AppPage.getElementsCount('tr.floor').then(count => {
        expect(count).toEqual(initCount + 1);
        FloorPage.editLastFloor(newName, 1, true);
        expect(FloorPage.getLatestAddedFloorName()).toEqual(newName);
        FloorPage.openLatestAddedFloor();
        AppPage.getCurrentUrl().then(pageUrl => {
          expect(pageUrl).toMatch(/complexes\/.*\/buildings\/.*\/floors\/.*\/map/g);
          AppPage.navigateBack();
        });
        FloorPage.editLastFloor(name, 7, false);
        AppPage.cancelEditingWithESC();
        expect(FloorPage.getLatestAddedFloorName()).toEqual(newName);
        expect(FloorPage.getLatestAddedFloorLevel()).toBe('1');
        FloorPage.removeLastFloor();
        AppPage.getElementsCount('tr.floor').then(finalCount => {
          expect(finalCount).toEqual(initCount);
          done();
        });
      });
    });
  });
});

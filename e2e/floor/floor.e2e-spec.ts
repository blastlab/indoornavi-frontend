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
    FloorPage.getFloorsCount().then(initCount => {
      FloorPage.addFloor(name, 0);
      expect(FloorPage.getLatestAddedFloor()).toEqual(name);
      expect(FloorPage.getLatestAddedFloorLevel()).toBe('0');
      FloorPage.getFloorsCount().then(count => {
        expect(count).toEqual(initCount + 1);
        FloorPage.editLastFloor(newName, 1, true);
        expect(FloorPage.getLatestAddedFloor()).toEqual(newName);
        FloorPage.openLatestAddedFloor();
        AppPage.getCurrentUrl().then(pageUrl => {
          expect(pageUrl).toMatch(/complexes\/.*\/buildings\/.*\/floors\/.*\/map/g);
          AppPage.navigateTo(FloorPage.getBackUrl(pageUrl));
          done();
        });
        FloorPage.editLastFloor(name, 7, false);
        AppPage.cancelEditingWithESC();
        expect(FloorPage.getLatestAddedFloor()).toEqual(newName);
        expect(FloorPage.getLatestAddedFloorLevel()).toBe('1');
        FloorPage.removeLastFloor();
        FloorPage.getFloorsCount().then(finalCount => {
          expect(finalCount).toEqual(initCount);
          done();
        });
      });
    });
  });
});

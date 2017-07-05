import {AppPage} from '../app.po';
import {MapPage} from './map.po';

describe('MapComponent', () => {
  beforeAll(() => {
    MapPage.prepareAndOpenFloor('testBuilding');
  });

  afterAll(() => {
    MapPage.destroyLastComplex();
  });

  it('should be able to enter to map', (done: DoneFn) => {
    AppPage.getCurrentUrl().then(pageUrl => {
      expect(pageUrl).toMatch(/complexes\/.*\/buildings\/.*\/floors\/.*\/map/g);
      done();
    });
  });
});

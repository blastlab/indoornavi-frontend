// import {AppPage} from '../app.po';
// import {MapPage} from './map.po';
//
// describe('MapComponent', () => {
//   beforeAll(() => {
//     MapPage.prepareAndOpenFloor('testMap');
//   });
//
//   afterAll(() => {
//     MapPage.destroyLastComplex();
//   });
//
//   it('should be able to enter to map', (done: DoneFn) => {
//     AppPage.getCurrentUrl().then(pageUrl => {
//       expect(pageUrl).toMatch(/complexes\/.*\/buildings\/.*\/floors\/.*\/map/g);
//       done();
//     });
//   });
//
//   it('should not upload not image file as map', () => {
//     MapPage.uploadFile('wrongFile.txt');
//     expect(MapPage.getUploader().getAttribute('accept')).toEqual('image/*');
//   });
//
//   it('should upload an image file as map', () => {
//     expect(MapPage.getUploader().getAttribute('accept')).toEqual('image/*');
//     MapPage.uploadFile('map.jpg');
//     MapPage.waitForElement('#map');
//     expect(AppPage.getById('map').getTagName()).toEqual('svg');
//   });
//
// });

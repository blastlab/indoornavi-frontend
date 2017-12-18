// import {LastMap, PublishedPage} from './published.po';
// import {AppPage} from '../app.po';
// import {MapPage} from '../map/map.po';
// import {BuildingPage} from '../building/building.po';
//
// describe('Published Map', () => {
//   afterAll(() => {
//     BuildingPage.destroyLastComplex();
//   });
//
//   it('should open map-view maps list', () => {
//     PublishedPage.navigateToPublishedList();
//     expect(AppPage.getTitle()).toBe('Published maps');
//   });
//
//   it('should create, edit and then remove map-view map', (done: DoneFn) => {
//     // first we need to create floor with uploaded image and scale set
//     const elementName = 'Published Map Test Floor';
//     MapPage.prepareAndOpenFloor(elementName);
//     MapPage.uploadFile('map.jpg');
//     PublishedPage.prepareScale();
//
//     // go back to map-view maps list
//     PublishedPage.navigateToPublishedList();
//     PublishedPage.getMapsCount().then((initialCount: number) => {
//
//       // open dialog to create map
//       PublishedPage.createPublishedMap(elementName);
//       PublishedPage.getMapsCount().then((afterCreateCount: number) => {
//         expect(afterCreateCount).toBe(initialCount + 1);
//
//         PublishedPage.getLastMap().then((lastlyAddedMap: LastMap) => {
//           expect(lastlyAddedMap.floor).toBe('Published Map Test Floor/Published Map Test Floor/0/Published Map Test Floor');
//           expect(lastlyAddedMap.tags).toBe(
//             '10999 - 1099999\n' +
//             '11999 - 1199999');
//           expect(lastlyAddedMap.users).toBe(
//             'admin\n' +
//             'user');
//
//           // open dialog to edit map
//           PublishedPage.editPublishedMap();
//           PublishedPage.getMapsCount().then((afterEditCount: number) => {
//             expect(afterEditCount).toBe(initialCount + 1);
//
//             PublishedPage.getLastMap().then((lastlyEditedMap: LastMap) => {
//               expect(lastlyEditedMap.floor).toBe('Published Map Test Floor/Published Map Test Floor/0/Published Map Test Floor');
//               expect(lastlyEditedMap.tags).toBe('10999 - 1099999');
//               expect(lastlyEditedMap.users).toBe('admin');
//
//               // clean
//               PublishedPage.removeLastlyAddedMap();
//               PublishedPage.getMapsCount().then((afterRemoveCount: number) => {
//                 expect(afterRemoveCount).toBe(initialCount);
//
//                 done();
//               });
//             });
//           });
//         });
//       });
//     });
//   });
// });

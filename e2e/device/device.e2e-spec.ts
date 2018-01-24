// ///<reference path="device.po.ts"/>
// import {AppPage} from '../app.po';
// import {DevicePage} from './device.po';
// import {ElementArrayFinder} from 'protractor';
//
// describe('DeviceComponent', () => {
//   it('should have title', () => {
//     DevicePage.navigateToHome();
//     expect(AppPage.getTitle()).toEqual('Anchors');
//   });
//
//   it('should be able to add new anchor, edit it and then remove it', (done: DoneFn) => {
//     const shortId = '123';
//     const longId = '12345';
//     const name = 'name';
//     const newShortId = '321';
//
//     DevicePage.navigateToHome();
//     DevicePage.prepareToAddAnchor(shortId);
//
//     DevicePage.getRowsCount().then((initialRowsCount: number) => {
//
//       DevicePage.addAnchor(shortId, longId, name);
//
//       DevicePage.getRowsCount().then((afterAddCount: number) => {
//         let row: ElementArrayFinder = DevicePage.getLatestFromNotVerified();
//         expect(row.get(0).getText()).toBe(shortId);
//         expect(row.get(1).getText()).toBe(longId);
//         expect(row.get(2).getText()).toBe(name);
//         expect(afterAddCount).toBe(initialRowsCount + 1, 'test 2');
//
//         DevicePage.editLastAnchor(newShortId, longId, name, true);
//         row = DevicePage.getLatestFromNotVerified();
//         expect(row.get(0).getText()).toBe(newShortId);
//         expect(row.get(1).getText()).toBe(longId);
//         expect(row.get(2).getText()).toBe(name);
//         expect(afterAddCount).toBe(initialRowsCount + 1, 'test 3');
//
//         DevicePage.removeAnchor(newShortId);
//         DevicePage.getRowsCount().then((afterRemoveCount: number) => {
//           expect(afterRemoveCount).toBe(initialRowsCount, 'test 4');
//           done();
//         });
//       });
//     });
//   });
//
//   it('should cancel editing', () => {
//     const shortId = '123';
//     const longId = '12345';
//     const name = 'name';
//     const newShortId = '321';
//
//     DevicePage.navigateToHome();
//     DevicePage.prepareToAddAnchor(shortId);
//
//     DevicePage.addAnchor(shortId, longId, name);
//     let row: ElementArrayFinder = DevicePage.getLatestFromNotVerified();
//     expect(row.get(0).getText()).toBe(shortId);
//     expect(row.get(1).getText()).toBe(longId);
//     expect(row.get(2).getText()).toBe(name);
//
//     DevicePage.editLastAnchor(newShortId, longId, name, false);
//     AppPage.cancelEditingFromModal();
//
//     row = DevicePage.getLatestFromNotVerified();
//     expect(row.get(0).getText()).toBe(shortId);
//     expect(row.get(1).getText()).toBe(longId);
//     expect(row.get(2).getText()).toBe(name);
//   });
//
// });

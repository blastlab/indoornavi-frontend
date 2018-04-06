// import {PermissionGroupPage} from './permissionGroup.po';
// import {AppPage} from '../app.po';
// import {Utils} from '../utils';
//
// describe('Permission group component', () => {
//   beforeAll(() => {
//     PermissionGroupPage.navigateToHome();
//   });
//
//   it('Enters permission groups list', () => {
//     expect(AppPage.getTitle()).toEqual('Permission groups');
//   });
//
//   it('Adds new permission group, edit it and then removeObject it', (done: DoneFn) => {
//     Utils.getNumberOfTagTrElements().then((initCount: number) => {
//       PermissionGroupPage.addPermissionGroup();
//
//       Utils.getNumberOfTagTrElements().then((count: number) => {
//         expect(count).toEqual(initCount + 1);
//
//         PermissionGroupPage.editPermissionGroupName('test 2');
//         Utils.getNumberOfTagTrElements().then((afterEditCount: number) => {
//           expect(afterEditCount).toEqual(count);
//           expect(PermissionGroupPage.getLastPermissionGroupName()).toEqual('test 2');
//
//           PermissionGroupPage.removeLastPermissionGroup();
//
//           Utils.getNumberOfTagTrElements().then((afterRemoveCount: number) => {
//             expect(afterRemoveCount).toEqual(initCount);
//             done();
//           });
//         });
//       });
//     });
//   });
// });

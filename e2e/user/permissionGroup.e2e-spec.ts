import {PermissionGroupPage} from './permissionGroup.po';
import {AppPage} from '../app.po';

describe('Permission group component', () => {
  it('Enters permission groups list', () => {
    PermissionGroupPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Permission groups');
  });

  it('Adds new permission group, edit it and then remove it', (done: DoneFn) => {
    PermissionGroupPage.navigateToHome();

    PermissionGroupPage.getPermissionGroupsCount().then((initCount: number) => {
      PermissionGroupPage.addPermissionGroup();

      PermissionGroupPage.getPermissionGroupsCount().then((count: number) => {
        expect(count).toEqual(initCount + 1);

        PermissionGroupPage.editPermissionGroupName('test 2');
        PermissionGroupPage.getPermissionGroupsCount().then((afterEditCount: number) => {
          expect(afterEditCount).toEqual(count);
          expect(PermissionGroupPage.getLastPermissionGroupName()).toEqual('test 2');

          PermissionGroupPage.removeLastPermissionGroup();

          PermissionGroupPage.getPermissionGroupsCount().then((afterRemoveCount: number) => {
            expect(afterRemoveCount).toEqual(initCount);
            done();
          });
        });
      });
    });

  });
});

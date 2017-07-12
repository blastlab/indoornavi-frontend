import {PermissionGroupPage} from './permissionGroup.po';
import {AppPage} from '../app.po';

describe('Permission group component', () => {
  it('Enters permission groups list', () => {
    PermissionGroupPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Permission groups');
  });

  it('Adds new permission group, edit it and then remove it', () => {
    PermissionGroupPage.navigateToHome();

    PermissionGroupPage.getPermissionGroupsCount().then((initCount: number) => {
      PermissionGroupPage.addPermissionGroup();

      PermissionGroupPage.getPermissionGroupsCount().then((count: number) => {
        expect(count).toEqual(initCount + 1);

        PermissionGroupPage.removeLastPermissionGroup();

        PermissionGroupPage.getPermissionGroupsCount().then((afterRemoveCount: number) => {
          expect(afterRemoveCount).toEqual(initCount);
        });
      });
    });

  });
});

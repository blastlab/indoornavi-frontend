import {PermissionGroupPage} from './permissionGroup.po';
import {AppPage} from '../app.po';
import {Utils} from '../utils';

describe('Permission group component', () => {
  beforeAll(() => {
    PermissionGroupPage.navigateToHome();
  });

  it('Enters permission groups list', () => {
    expect(AppPage.getTitle()).toEqual('Permission groups');
  });

  it('Adds new permission group, edit it and then remove it', (done: DoneFn) => {
    Utils.getUsersCount().then((initCount: number) => {
      PermissionGroupPage.addPermissionGroup();

      Utils.getUsersCount().then((count: number) => {
        expect(count).toEqual(initCount + 1);

        PermissionGroupPage.editPermissionGroupName('test 2');
        Utils.getUsersCount().then((afterEditCount: number) => {
          expect(afterEditCount).toEqual(count);
          expect(PermissionGroupPage.getLastPermissionGroupName()).toEqual('test 2');

          PermissionGroupPage.removeLastPermissionGroup();

          Utils.getUsersCount().then((afterRemoveCount: number) => {
            expect(afterRemoveCount).toEqual(initCount);
            done();
          });
        });
      });
    });
  });
});

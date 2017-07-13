import {UserPage} from './user.po';
import {AppPage} from '../app.po';

describe('User component', () => {
  it('Enters user lists', () => {
    UserPage.navigateToHome();
    expect(AppPage.getTitle()).toEqual('Users');
  });

  it('Adds new user to the list and then removes it', (done: DoneFn) => {
    UserPage.navigateToHome();
    UserPage.prepareToAddUser();

    UserPage.getUsersCount().then((initialUsersCount: number) => {
      UserPage.addUser();

      UserPage.getUsersCount().then((usersCount: number) => {
        expect(usersCount).toBe(initialUsersCount + 1);

        UserPage.removeLastAddedUser();

        UserPage.getUsersCount().then((afterRemoveCount: number) => {
          expect(afterRemoveCount).toBe(initialUsersCount);
          done();
        });
      });
    });
  });

  it('Tries to create user with different values in passwords fields', () => {
    UserPage.navigateToHome();
    UserPage.openAddUserModal();
    UserPage.typeDifferentPasswords();

    expect(AppPage.getValidationErrors().isDisplayed()).toBe(true);
  });

  it('Edits one of the users', () => {
    UserPage.navigateToHome();
    UserPage.editUser('edit-user', 'newName');

    expect(UserPage.getEditedUser().getText()).toBe('newName');

    UserPage.editUser('edit-newName', 'user');
  });

});

// import {ChangePasswordPage} from './changePassword.po';
// import {AppPage} from '../app.po';
//
// describe('Change password component', () => {
//   it('Enters change password form', () => {
//     ChangePasswordPage.navigateToHome();
//     expect(AppPage.getTitle()).toEqual('Change password');
//     expect(ChangePasswordPage.getCurrentUser().getText()).toBe('admin');
//   });
//
//   it('Tries to change password with different values in passwords fields', () => {
//     ChangePasswordPage.navigateToHome();
//     ChangePasswordPage.typeDifferentPasswords();
//     expect(AppPage.getValidationErrors().isDisplayed()).toBe(true);
//   });
//
//   it('Changes current user password', (done: DoneFn) => {
//     ChangePasswordPage.navigateToHome();
//     ChangePasswordPage.changePassword('admin', 'test');
//
//     ChangePasswordPage.logout();
//     ChangePasswordPage.loginWithNewPassword().then(() => {
//       ChangePasswordPage.navigateToHome();
//       ChangePasswordPage.changePassword('test', 'admin');
//       done();
//     });
//   });
// });

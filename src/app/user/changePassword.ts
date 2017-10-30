import {Component} from '@angular/core';
import {UserService} from 'app/user/user.service';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from '../utils/toast/toast.service';
import {Router} from '@angular/router';
import {AuthService} from '../auth/auth.service';

@Component({
  templateUrl: 'changePassword.html'
})
export class ChangePasswordComponent {

  currentUserName: string;
  model = {
    oldPassword: '',
    newPassword: '',
    newPasswordRepeat: ''
  };

  constructor(private userService: UserService, public translateService: TranslateService, private toastService: ToastService, private router: Router, private authService: AuthService) {
    translateService.setDefaultLang('en');
    this.currentUserName = JSON.parse(localStorage.getItem('currentUser'))['username'];
  }

  validatePasswords(): boolean {
    return this.model.newPassword !== this.model.newPasswordRepeat && (this.model.newPassword.length > 0 && this.model.newPasswordRepeat.length > 0);
  }

  save(isValid: boolean): void {
    if (isValid) {
      this.userService.changePassword({oldPassword: this.model.oldPassword, newPassword: this.model.newPassword}).subscribe(() => {
        this.toastService.showSuccess('user.changePassword.success');
      }, (msg: string) => {
        this.toastService.showFailure(msg);
      });
    }
  }
}

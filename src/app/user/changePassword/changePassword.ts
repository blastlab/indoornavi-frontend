import {Component, OnInit} from '@angular/core';
import {UserService} from 'app/user/user.service';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from '../../utils/toast/toast.service';
import {BreadcrumbService} from '../../utils/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: 'changePassword.html'
})
export class ChangePasswordComponent implements OnInit {

  currentUserName: string;
  model = {
    oldPassword: '',
    newPassword: '',
    newPasswordRepeat: ''
  };
  passwordsEqual: boolean = true;

  constructor(private userService: UserService,
              public translateService: TranslateService,
              private toastService: ToastService,
              private breadcrumbService: BreadcrumbService) {
    translateService.setDefaultLang('en');
    this.currentUserName = JSON.parse(localStorage.getItem('currentUser'))['username'];
  }

  ngOnInit () {
    this.translateService.get(`changePassword.header`).subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
  }

  validatePasswords(): void {
    this.passwordsEqual = (!this.model.newPassword || !this.model.newPasswordRepeat) || this.model.newPassword === this.model.newPasswordRepeat;
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

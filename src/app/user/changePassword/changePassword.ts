import {Component, OnInit, ViewChild} from '@angular/core';
import {UserService} from 'app/user/user.service';
import {TranslateService} from '@ngx-translate/core';
import {BreadcrumbService} from '../../utils/breadcrumbs/breadcrumb.service';
import {NgForm} from '@angular/forms';
import {CrudHelper} from '../../utils/crud/crud.component';
import {MessageServiceWrapper} from '../../utils/message.service';

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
  @ViewChild('changePasswordForm') changePasswordForm: NgForm;

  constructor(private userService: UserService,
              public translateService: TranslateService,
              private messageService: MessageServiceWrapper,
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
        this.messageService.success('user.changePassword.success');
      }, (msg: string) => {
        this.messageService.failed(msg);
      });
    } else {
      CrudHelper.validateAllFields(this.changePasswordForm);
    }
  }
}

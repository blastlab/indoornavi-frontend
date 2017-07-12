import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {ToastService} from '../utils/toast/toast.service';
import {User} from './user.type';
import {UserService} from './user.service';
import {TranslateService} from '@ngx-translate/core';
import {Option} from '../utils/multiselect/multiselect.type';

@Component({
  templateUrl: './user.dialog.html',
  styleUrls: ['./user.css']
})
export class UserDialogComponent implements OnInit {
  user: User = {
    password: '',
    username: '',
    permissionGroups: []
  };
  repeatPassword: string = '';
  isEditMode: boolean;
  multiSelectSettings = {badgeShowLimit: 3, maxHeight: 175, text: ''};
  options: Option[] = [];
  selectedOptions: Option[] = [];

  constructor(private dialogRef: MdDialogRef<UserDialogComponent>,
              private toastService: ToastService,
              private userService: UserService,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.get('user.selectPermissionGroup').subscribe((value: string) => {
      this.multiSelectSettings.text = value;
    });
  }

  setEditMode(value: boolean) {
    this.isEditMode = value;
  }

  validatePasswords(): boolean {
    return this.user.password && this.user.password !== this.repeatPassword && (this.user.password.length > 0 && this.repeatPassword.length > 0);
  }

  save(valid: boolean): void {
    if (valid) {
      this.user.permissionGroups = [];
      this.selectedOptions.forEach((item: Option) => {
        this.user.permissionGroups.push({id: item.id, name: item.itemName, permissions: []});
      });
      (!this.user.id ? this.userService.create(this.user) : this.userService.update(this.user))
        .subscribe((savedUser: User) => {
            this.dialogRef.close(savedUser);
          },
          (errorCode: string) => {
            this.toastService.showFailure(errorCode);
          }
        );
    }
  }
}

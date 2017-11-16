import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UserDialogComponent} from './user.dialog';
import {MdDialog, MdDialogRef} from '@angular/material';
import {PermissionGroup, User} from './user.type';
import {ToastService} from '../shared/utils/toast/toast.service';
import {UserService} from './user.service';
import {PermissionGroupService} from './permissionGroup.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: 'user.html',
  styleUrls: ['user.css']
})
export class UserComponent implements OnInit {
  dialogRef: MdDialogRef<UserDialogComponent>;
  users: User[] = [];
  permissionGroups: PermissionGroup[] = [];

  constructor(public translateService: TranslateService,
              private dialog: MdDialog,
              private toast: ToastService,
              private userService: UserService,
              private permissionGroupService: PermissionGroupService,
              private breadcrumbService: BreadcrumbService
  ) {
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    });
    this.translateService.setDefaultLang('en');
    this.translateService.get(`users.header`).subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });

    this.permissionGroupService.getPermissionGroups().subscribe((permissionGroups: PermissionGroup[]) => {
      this.permissionGroups = permissionGroups;
    });
  }

  editUser(index: number): void {
    this.createDialog({...this.users[index]});

    this.dialogRef.componentInstance.selectedOptions = this.users[index].permissionGroups.map((permissionGroup: PermissionGroup) => {
      return {id: permissionGroup.id, itemName: permissionGroup.name};
    });

    this.dialogRef.afterClosed().subscribe((updatedUser: User) => {
      if (updatedUser !== undefined) {
        this.users[index] = updatedUser;
        this.toast.showSuccess('user.save.success');
      }
      this.dialogRef = null;
    });
  }

  removeUser(index: number): void {
    this.userService.remove(this.users[index].id).subscribe(() => {
      this.users.splice(index, 1);
      this.toast.showSuccess('user.remove.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  createUser(): void {
    this.createDialog({
      username: '',
      password: '',
      permissionGroups: []
    });

    this.dialogRef.afterClosed().subscribe((user: User) => {
      if (user !== undefined) {
        this.users.push(user);
        this.toast.showSuccess('user.create.success');
      }
      this.dialogRef = null;
    });
  }

  private createDialog(user: User) {
    this.dialogRef = this.dialog.open(UserDialogComponent, {width: '500px', height: '600px'});
    this.dialogRef.componentInstance.setEditMode(!!user.id);
    this.dialogRef.componentInstance.user = user;
    this.dialogRef.componentInstance.options = this.permissionGroups.map((permissionGroup: PermissionGroup) => {
      return {id: permissionGroup.id, itemName: permissionGroup.name};
    });
  }
}

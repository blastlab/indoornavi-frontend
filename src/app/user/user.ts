import {Component, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UserDialogComponent} from './user.dialog';
import {MdDialog, MdDialogRef} from '@angular/material';
import {User} from './user.type';
import {ToastService} from '../utils/toast/toast.service';
import {UserService} from './user.service';

@Component({
  templateUrl: 'user.html',
  styleUrls: ['user.css']
})
export class UserComponent implements OnInit {
  dialogRef: MdDialogRef<UserDialogComponent>;
  users: User[] = [];

  constructor(public translateService: TranslateService,
              private dialog: MdDialog,
              private toast: ToastService,
              private userService: UserService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');

    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
    });
  }

  editUser(user: User): void {
    this.dialogRef = this.dialog.open(UserDialogComponent);
    this.dialogRef.componentInstance.user = {
      username: user.username,
      id: user.id
    };

    this.dialogRef.afterClosed().subscribe((updatedUser: User) => {
      if (updatedUser !== undefined) {
        user.username = updatedUser.username;
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

  openDialog(): void {
    this.dialogRef = this.dialog.open(UserDialogComponent);
    this.dialogRef.componentInstance.user = {
      username: '',
      password: ''
    };

    this.dialogRef.afterClosed().subscribe((user: User) => {
      if (user !== undefined) {
        this.users.push(user);
        this.toast.showSuccess('user.create.success');
      }
      this.dialogRef = null;
    });
  }
}

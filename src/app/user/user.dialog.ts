import {Component} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {ToastService} from '../utils/toast/toast.service';
import {User} from './user.type';
import {UserService} from './user.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user.dialog.html',
  styleUrls: ['./user.css']
})
export class UserDialogComponent {
  user: User = {
    password: '',
    username: ''
  };
  repeatPassword: string = '';
  isEditMode: boolean;

  constructor(private dialogRef: MdDialogRef<UserDialogComponent>,
              private toastService: ToastService,
              private userService: UserService) {
  }

  setEditMode(value: boolean) {
    this.isEditMode = value;
  }

  validatePasswords(): boolean {
    return this.user.password && this.user.password !== this.repeatPassword && (this.user.password.length > 0 && this.repeatPassword.length > 0);
  }

  save(valid: boolean): void {
    if (valid) {
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

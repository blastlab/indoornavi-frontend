import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {ToastService} from '../utils/toast/toast.service';
import {User} from './user.type';
import {UserService} from './user.service';

@Component({
  selector: 'app-user-dialog',
  templateUrl: './user.dialog.html',
  styleUrls: ['./user.css']
})
export class UserDialogComponent implements OnInit {
  user: User;
  repeatPassword: string;

  constructor(private dialogRef: MdDialogRef<UserDialogComponent>,
              private toastService: ToastService,
              private userService: UserService) {
  }

  ngOnInit(): void {
  }

  save(valid: boolean): void {
    if (valid) {
      if (this.user.password === this.repeatPassword) {
        (!this.user.id ? this.userService.create(this.user) : this.userService.update(this.user))
          .subscribe((savedUser: User) => {
              this.dialogRef.close(savedUser);
            },
            (errorCode: string) => {
              this.toastService.showFailure(errorCode);
            }
          );
      } else {
        this.toastService.showFailure('user.passwords.mustEqual');
      }
    }
  }
}

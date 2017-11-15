import {Component, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {UserDialogComponent} from './user.dialog';
import {MdDialogRef} from '@angular/material';
import {PermissionGroup, User} from './user.type';
import {ToastService} from '../utils/toast/toast.service';
import {UserService} from './user.service';
import {PermissionGroupService} from './permissionGroup/permissionGroup.service';
import {CrudComponent, CrudHelper} from '../utils/crud/crud.component';
import {NgForm} from '@angular/forms';
import {ConfirmationService} from 'primeng/primeng';
import {BreadcrumbService} from '../utils/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: 'user.html',
  styleUrls: ['user.css']
})
export class UserComponent implements OnInit, CrudComponent {
  dialogRef: MdDialogRef<UserDialogComponent>;
  users: User[] = [];
  permissionGroups: PermissionGroup[] = [];
  loading: boolean = true;
  displayDialog: boolean = false;
  user: User;
  repeatPassword: string;
  passwordsEqual: boolean = true;
  @ViewChild('userForm') userForm: NgForm;
  private confirmBody: string;

  constructor(public translateService: TranslateService,
              // private dialog: MdDialog,
              private toast: ToastService,
              private userService: UserService,
              private permissionGroupService: PermissionGroupService,
              private confirmationService: ConfirmationService,
              private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users: User[]) => {
      this.users = users;
      this.loading = false;
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

    this.translateService.get('confirm.body').subscribe((value: string) => {
      this.confirmBody = value;
    });
  }

  save(isValid: boolean): void {
    if (isValid) {
      (!!this.user.id ?
          this.userService.update(this.user)
          :
          this.userService.create(this.user)
      ).subscribe((savedUser: User) => {
        const isNew = !(!!this.user.id);
        if (isNew) {
          this.toast.showSuccess('user.create.success');
        } else {
          this.toast.showSuccess('user.save.success');
        }
        this.users = <User[]>CrudHelper.add(savedUser, this.users, isNew);
      }, (err: string) => {
        this.toast.showFailure(err);
      });
      this.displayDialog = false;
      this.userForm.resetForm();
    } else {
      CrudHelper.validateAllFields(this.userForm);
    }
  }

  cancel(): void {
    this.displayDialog = false;
    this.userForm.resetForm();
  }

  openDialog(user?: User): void {
    this.displayDialog = true;
    if (!!user) {
      this.user = {...user};
    } else {
      this.user = new User();
    }
  }

  remove(index: number): void {
    this.confirmationService.confirm({
      message: this.confirmBody,
      accept: () => {
        this.userService.remove(this.users[index].id).subscribe(() => {
          this.users = <User[]>CrudHelper.remove(index, this.users);
          this.toast.showSuccess('user.remove.success');
        }, (msg: string) => {
          this.toast.showFailure(msg);
        });
      }
    });
  }

  validatePasswords(): void {
    this.passwordsEqual = (!this.user.password || !this.repeatPassword) || this.user.password === this.repeatPassword;
  }
}

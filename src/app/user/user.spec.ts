import {UserComponent} from './user';
import {UserService} from './user.service';
import {ToastService} from '../utils/toast/toast.service';
import {MaterialModule, MdDialog} from '@angular/material';
import {async, TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {TranslateModule} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpService} from '../utils/http/http.service';
import {Observable} from 'rxjs/Observable';
import {SharedModule} from '../utils/shared/shared.module';
import {AuthGuard} from '../auth/auth.guard';
import {PermissionGroupService} from './permissionGroup.service';

describe('User component', () => {
  let component: UserComponent;
  let userService: UserService;
  let toastService: ToastService;
  let dialog: MdDialog;
  let permissionGroupService: PermissionGroupService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpModule,
        DialogTestModule,
        TranslateModule.forRoot(),
        RouterTestingModule,
        SharedModule
      ],
      declarations: [
        UserComponent
      ],
      providers: [
        UserService, HttpService, ToastService, MdDialog, AuthGuard, PermissionGroupService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UserComponent);
    component = fixture.debugElement.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    toastService = fixture.debugElement.injector.get(ToastService);
    dialog = fixture.debugElement.injector.get(MdDialog);
    permissionGroupService = fixture.debugElement.injector.get(PermissionGroupService);

    spyOn(toastService, 'showSuccess');
  }));

  it('should create component', async(() => {
    // given
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([{username: 'test', id: 1}]));
    spyOn(permissionGroupService, 'getPermissionGroups').and.returnValue(Observable.of([]));

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(userService.getUsers).toHaveBeenCalled();
    expect(permissionGroupService.getPermissionGroups).toHaveBeenCalled();

    expect(component.users.length).toEqual(1);
    expect(component.users).toContain({username: 'test', id: 1});
  }));

  it('should add new user to list when form is valid', () => {
    // given
    const expectedUser = {username: 'some name', id: 2};
    spyOn(userService, 'create').and.returnValue(Observable.of(expectedUser));
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.createUser();
    component.dialogRef.close(expectedUser);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.users.length).toEqual(1);
    expect(component.users).toContain({username: 'some name', id: 2});
  });

  it('should remove user from list', () => {
    // given
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([{name: 'test', id: 1}]));
    spyOn(userService, 'remove').and.returnValue(Observable.of({}));

    // when
    component.ngOnInit();
    component.removeUser(0);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.users.length).toEqual(0);
  });

  it('should edit user', () => {
    // given
    const user = {username: 'test', id: 1, permissionGroups: []};
    const expectedUser = {username: 'some name', id: 1, permissionGroups: []};
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([user]));
    spyOn(userService, 'update').and.returnValue(Observable.of(expectedUser));
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.ngOnInit();
    component.editUser(0);
    component.dialogRef.close(expectedUser);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.users.length).toEqual(1);
    expect(component.users).toContain(expectedUser);
  });

  it('should populate permissionGroups while in edit dialog', () => {
    // given
    const user = {username: 'test', id: 1, permissionGroups: [{id: 1, name: 'admin', permissions: []}]};
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([user]));
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.ngOnInit();
    component.editUser(0);

    // then
    expect(component.dialogRef.componentInstance.selectedOptions.length).toEqual(1);
    expect(component.dialogRef.componentInstance.selectedOptions).toContain({id: 1, itemName: 'admin'});
  });
});

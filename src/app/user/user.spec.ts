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

describe('User component', () => {
  let component: UserComponent;
  let userService: UserService;
  let toastService: ToastService;
  let dialog: MdDialog;

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
        UserService, HttpService, ToastService, MdDialog, AuthGuard
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(UserComponent);
    component = fixture.debugElement.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    toastService = fixture.debugElement.injector.get(ToastService);
    dialog = fixture.debugElement.injector.get(MdDialog);

    spyOn(toastService, 'showSuccess');
  }));

  it('should create component', async(() => {
    // given
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([{name: 'test', id: 1}]));

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(userService.getUsers).toHaveBeenCalled();

    expect(component.users.length).toEqual(1);
    expect(component.users).toContain({name: 'test', id: 1});
  }));

  it('should add new user to list when form is valid', () => {
    // given
    const newUsername = 'some name';
    const expectedUser = {name: newUsername, id: 2};
    spyOn(userService, 'create').and.returnValue(Observable.of(expectedUser));
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();
    component.dialogRef.close(expectedUser);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.users.length).toEqual(1);
    expect(component.users).toContain({'name': newUsername, id: 2});
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
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([{name: 'test', id: 1}]));
    const newUsername = 'some name';
    const expectedUser = {name: newUsername, id: 1};
    spyOn(userService, 'update').and.returnValue(Observable.of(expectedUser));
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();
    component.dialogRef.close(expectedUser);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.users.length).toEqual(1);
    expect(component.users).toContain({'name': newUsername, id: 1});
  });
});

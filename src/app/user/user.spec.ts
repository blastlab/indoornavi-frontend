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
    spyOn(permissionGroupService, 'getPermissionGroups').and.returnValue(Observable.of([]));
  }));

  it('should create component', async(() => {
    // given
    spyOn(userService, 'getUsers').and.returnValue(Observable.of([{username: 'test', id: 1}]));

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(userService.getUsers).toHaveBeenCalled();
    expect(permissionGroupService.getPermissionGroups).toHaveBeenCalled();

    expect(component.users.length).toEqual(1);
    expect(component.users).toContain({username: 'test', id: 1});
  }));
});

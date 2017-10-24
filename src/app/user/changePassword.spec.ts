import {ChangePasswordComponent} from './changePassword';
import {UserService} from './user.service';
import {ToastService} from '../utils/toast/toast.service';
import {MaterialModule, MdDialog} from '@angular/material';
import {async, TestBed} from '@angular/core/testing';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {BrowserModule} from '@angular/platform-browser';
import {HttpService} from '../utils/http/http.service';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {TranslateModule} from '@ngx-translate/core';
import {Observable} from 'rxjs/Observable';
import {AuthGuard} from '../auth/auth.guard';
import {ActivatedRoute, Router} from '@angular/router';

describe('Change password component', () => {
  let component: ChangePasswordComponent;
  let userService: UserService;
  let toastService: ToastService;
  let dialog: MdDialog;
  const mockActivatedRoute = {queryParams: Observable.of({})};

  beforeEach(async(() => {
    const routerStub = {
      navigate: jasmine.createSpy('navigate')
    };

    const store = {
      currentUser: JSON.stringify({
        username: 'test'
      })
    };

    spyOn(localStorage, 'getItem').and.callFake((key) => {
      return store[key];
    });

    TestBed.configureTestingModule({
      imports: [
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpModule,
        DialogTestModule,
        TranslateModule.forRoot()
      ],
      declarations: [
        ChangePasswordComponent
      ],
      providers: [
        UserService, HttpService, ToastService, MdDialog, AuthGuard, { provide: Router, useValue: routerStub },
        {provide: ActivatedRoute, useValue: mockActivatedRoute}
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(ChangePasswordComponent);
    component = fixture.debugElement.componentInstance;
    userService = fixture.debugElement.injector.get(UserService);
    toastService = fixture.debugElement.injector.get(ToastService);
    dialog = fixture.debugElement.injector.get(MdDialog);

    spyOn(toastService, 'showSuccess');
    spyOn(toastService, 'showFailure');
  }));

  it('should create component', () => {
    expect(component).toBeTruthy();
    expect(component.currentUserName).toBe('test');
  });

  it('should save new password when form is valid', () => {
    spyOn(userService, 'changePassword').and.returnValue(Observable.of({}));

    component.save(true);

    expect(userService.changePassword).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  it('should omit saving when form is invalid', () => {

    component.save(false);

    expect(toastService.showFailure).toHaveBeenCalledTimes(0);
    expect(toastService.showSuccess).toHaveBeenCalledTimes(0);
  });

  it('should validate passwords equality', () => {
    component.model = {
      oldPassword: 't',
      newPassword: 'test',
      newPasswordRepeat: 'tst'
    };

    let result = component.validatePasswords();

    expect(result).toBe(true);

    component.model.newPasswordRepeat = 'test';

    result = component.validatePasswords();

    expect(result).toBe(false);
  });
});

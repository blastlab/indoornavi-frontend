import {AuthComponent} from './auth';
import {AuthService} from './auth.service';
import {ActivatedRoute, Router} from '@angular/router';
import {async, TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';
import {MaterialModule, MdDialog} from '@angular/material';
import {HttpModule} from '@angular/http';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {TranslateModule} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {AuthGuard} from './auth.guard';
import {Observable} from 'rxjs/Observable';
import {Credentials} from './auth.type';
import {SharedModule} from '../utils/shared/shared.module';
describe('Auth component', () => {
  let component: AuthComponent;
  let authService: AuthService;
  let router: Router;
  let route: ActivatedRoute;
  let authGuard: AuthGuard;

  beforeEach(async(() => {
    const store = {
      currentUser: JSON.stringify({
        username: 'test'
      })
    };

    spyOn(localStorage, 'getItem').and.callFake((key) => {
      return store[key];
    });
    spyOn(localStorage, 'setItem').and.callFake((key, value) => {
      return store[key] = value + '';
    });
    spyOn(localStorage, 'removeItem').and.callFake((key) => {
      delete store[key];
    });

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
        AuthComponent
      ],
      providers: [
        AuthGuard, HttpService, ToastService, MdDialog, AuthService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(AuthComponent);
    component = fixture.debugElement.componentInstance;
    authService = fixture.debugElement.injector.get(AuthService);
    router = fixture.debugElement.injector.get(Router);
    route = fixture.debugElement.injector.get(ActivatedRoute);
    authGuard = fixture.debugElement.injector.get(AuthGuard);

    spyOn(authGuard, 'toggleUserLoggedIn');
    spyOn(router, 'navigate');
  }));

  it('should logout on init when user is logged in', () => {
    spyOn(authService, 'logout');

    component.ngOnInit();

    expect(authService.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
    expect(localStorage.getItem('currentUser')).toBeUndefined();
  });

  it('should login user when credentials are correct', () => {
    spyOn(authService, 'login').and.callFake((credentials: Credentials) => {
      if (credentials.username === 'test' && credentials.plainPassword === 'test') {
        return Observable.of({token: 'testToken'});
      }
    });

    component.login('test', 'test');

    expect(authService.login).toHaveBeenCalled();
    expect(authGuard.toggleUserLoggedIn).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalled();
    expect(localStorage.getItem('currentUser')).toBeDefined();
    expect(JSON.parse(localStorage.getItem('currentUser'))['token']).toBe('testToken');
  });
});

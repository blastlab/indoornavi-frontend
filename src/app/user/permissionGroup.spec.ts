import {PermissionGroupComponent} from './permissionGroup';
import {PermissionGroupService} from './permissionGroup.service';
import {ToastService} from '../utils/toast/toast.service';
import {MaterialModule, MdDialog} from '@angular/material';
import {async, TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../utils/shared/shared.module';
import {HttpService} from '../utils/http/http.service';
import {AuthGuard} from '../auth/auth.guard';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {Observable} from 'rxjs/Rx';

describe('Permission Group Component', () => {
  let component: PermissionGroupComponent;
  let permissionGroupService: PermissionGroupService;
  let translateService: TranslateService;

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
        SharedModule,
        AngularMultiSelectModule
      ],
      declarations: [
        PermissionGroupComponent
      ],
      providers: [
        PermissionGroupService, HttpService, ToastService, AuthGuard, TranslateService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PermissionGroupComponent);
    component = fixture.debugElement.componentInstance;
    translateService = fixture.debugElement.injector.get(TranslateService);
  }));

  it('should create component', () => {
    // given
    spyOn(translateService, 'get').and.returnValue(Observable.of('test'));

    // when
    component.ngOnInit();

    // then
    expect(component.permissionGroup).toBeDefined();
    expect(translateService.get).toHaveBeenCalled();
    expect(permissionGroupService.getPermissions).toHaveBeenCalled();
    expect(permissionGroupService.getPermissionGroups).toHaveBeenCalled();
    expect(component.permissions.length).toEqual(1);
    expect(component.options.length).toEqual(1);
    expect(component.permissionGroups.length).toEqual(1);
  });

});

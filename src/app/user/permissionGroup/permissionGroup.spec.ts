import {PermissionGroupComponent} from './permissionGroup';
import {PermissionGroupService} from './permissionGroup.service';
import {ToastService} from '../../utils/toast/toast.service';
import {MaterialModule, MdDialog} from '@angular/material';
import {async, TestBed} from '@angular/core/testing';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import {DialogTestModule} from '../../utils/dialog/dialog.test';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {RouterTestingModule} from '@angular/router/testing';
import {SharedModule} from '../../utils/shared/shared.module';
import {HttpService} from '../../utils/http/http.service';
import {AuthGuard} from '../../auth/auth.guard';
import {AngularMultiSelectModule} from 'angular2-multiselect-dropdown/angular2-multiselect-dropdown';
import {Observable} from 'rxjs/Rx';
import {Permission, PermissionGroup} from '../user.type';

describe('Permission Group Component', () => {
  let component: PermissionGroupComponent;
  let permissionGroupService: PermissionGroupService;
  let toastService: ToastService;
  let dialog: MdDialog;
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
        PermissionGroupService, HttpService, ToastService, MdDialog, AuthGuard, TranslateService
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(PermissionGroupComponent);
    component = fixture.debugElement.componentInstance;
    toastService = fixture.debugElement.injector.get(ToastService);
    dialog = fixture.debugElement.injector.get(MdDialog);
    permissionGroupService = fixture.debugElement.injector.get(PermissionGroupService);
    translateService = fixture.debugElement.injector.get(TranslateService);

    spyOn(toastService, 'showSuccess');
    spyOn(permissionGroupService, 'getPermissions').and.returnValue(Observable.of(<Permission[]>[{id: 1, name: 'test'}]));
    spyOn(permissionGroupService, 'getPermissionGroups').and.returnValue(Observable.of(<PermissionGroup[]>[{id: 1, name: 'test', permissions: []}]));
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

  it('should let create new permission group when form is valid', () => {
    // given
    const expected = <PermissionGroup>{id: 1, name: 'test', permissions: []};
    spyOn(permissionGroupService, 'save').and.returnValue(Observable.of(expected));

    // when
    component.ngOnInit();
    component.openDialog();
    component.save(true);

    // then
    expect(permissionGroupService.save).toHaveBeenCalled();
    expect(component.permissionGroups).toContain(expected);
    expect(toastService.showSuccess).toHaveBeenCalledWith('permissionGroup.create.success');
  });

  it('should NOT let create new permission group when form is invalid', () => {
    // given
    const notExpected = <PermissionGroup>{id: 2, name: 'test 2', permissions: []};
    spyOn(permissionGroupService, 'save');

    // when
    component.ngOnInit();
    component.openDialog();
    component.save(false);

    // then
    expect(permissionGroupService.save).not.toHaveBeenCalled();
    expect(component.permissionGroups).not.toContain(notExpected);
    expect(toastService.showSuccess).not.toHaveBeenCalledWith('permissionGroup.create.success');
  });

  it('should let add new permission to existing permissionGroup', () => {
    // given
    const toEdit = <PermissionGroup>{id: 1, name: 'test', permissions: [<Permission>{id: 1, name: 'test'}]};
    spyOn(permissionGroupService, 'save').and.returnValue(Observable.of(toEdit));

    // when
    component.edit(toEdit);
    component.save(true);

    // then
    expect(permissionGroupService.save).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalledWith('permissionGroup.save.success');
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {MaterialModule, MdDialog} from '@angular/material';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {DndModule} from 'ng2-dnd';
import {TranslateModule} from '@ngx-translate/core';
import {Observable} from 'rxjs/Rx';
import {DeviceListComponent} from './device.list';
import {DeviceService} from './device.service';
import {Device} from './device.type';
import {Router, RouterModule} from '@angular/router';
import {AuthGuard} from '../auth/auth.guard';
import {SharedModule} from '../utils/shared/shared.module';

describe('DeviceListComponent', () => {
  let component: DeviceListComponent;
  let fixture: ComponentFixture<DeviceListComponent>;

  let dialog: MdDialog;
  let service: DeviceService;
  let toastService: ToastService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        DndModule.forRoot(),
        MaterialModule,
        DialogTestModule,
        SharedModule
      ],
      declarations: [DeviceListComponent],
      providers: [DeviceService, HttpService, ToastService, MdDialog, {provide: Router, useClass: RouterModule}, AuthGuard]
    }).compileComponents();

    fixture = TestBed.createComponent(DeviceListComponent);
    component = fixture.debugElement.componentInstance;
    dialog = fixture.debugElement.injector.get(MdDialog);
    service = fixture.debugElement.injector.get(DeviceService);
    toastService = fixture.debugElement.injector.get(ToastService);

    spyOn(toastService, 'showSuccess');
  }));

  it('should update anchor verified state when added to verified list', () => {
    // given
    const expectedDevice: Device = {id: 1, shortId: 1, longId: 11, verified: true};
    const currentDevice: Device = {id: 1, shortId: 1, longId: 11, verified: false};
    spyOn(service, 'update').and.returnValue(Observable.of(expectedDevice));

    // when
    component.addToList({dragData: currentDevice});

    // then
    expect(service.update).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.devices.getValue(1)).toBe(expectedDevice);
  });

  it('should open dialog to edit anchor', () => {
    // given
    spyOn(dialog, 'open').and.callThrough();
    const currentDevice: Device = {id: 1, shortId: 1, longId: 11, verified: false};

    // when
    component.openDialog(currentDevice);

    // then
    expect(component.dialogRef.config.data['device']).toBeDefined();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should edit anchor when dialog closes with value', () => {
    // given
    const expectedDevice: Device = {id: 1, shortId: 2, longId: 15, verified: false, name: 'test'};
    const currentDevice: Device = {id: 1, shortId: 1, longId: 11, verified: false};
    spyOn(dialog, 'open').and.callThrough();
    spyOn(service, 'update').and.returnValue(Observable.of(expectedDevice));

    // when
    component.openDialog(currentDevice);
    component.dialogRef.close(expectedDevice);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  it('should remove anchor from list and call service to remove it from db', () => {
    // given
    spyOn(service, 'remove').and.returnValue(Observable.of({}));
    const currentDevice: Device = {id: 1, shortId: 1, longId: 11, verified: false};
    component.devices.setValue(1, currentDevice);

    // when
    component.remove(currentDevice);

    // then
    expect(service.remove).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.getDevices().length).toBe(0);
  });
});

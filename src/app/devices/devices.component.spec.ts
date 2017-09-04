import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';
import {DndModule} from 'ng2-dnd';
import {MaterialModule, MdDialog} from '@angular/material';
import {SocketService} from '../utils/socket/socket.service';
import {WebSocketService} from 'angular2-websocket-service';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {Observable} from 'rxjs/Rx';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {Anchor} from './anchor.type';
import {DeviceService} from '../device/device.service';
import {DeviceListComponent} from '../device/device.list';
import {Router, RouterModule} from '@angular/router';
import {SharedModule} from '../utils/shared/shared.module';
import {AuthGuard} from '../auth/auth.guard';

import { DevicesComponent } from './devices.component';

describe('DevicesComponent', () => {
  let component: DevicesComponent;
  let fixture: ComponentFixture<DevicesComponent>;

  let socketService: SocketService;
  let dialog: MdDialog;
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
      declarations: [DevicesComponent, DeviceListComponent],
      providers: [SocketService, WebSocketService, DeviceService, HttpService, ToastService, MdDialog, {provide: Router, useClass: RouterModule}, AuthGuard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DevicesComponent);
    component = fixture.debugElement.componentInstance;
    socketService = fixture.debugElement.injector.get(SocketService);
    dialog = fixture.debugElement.injector.get(MdDialog);
    toastService = fixture.debugElement.injector.get(ToastService);

    spyOn(socketService, 'send').and.callFake(() => {});
    spyOn(toastService, 'showSuccess');
  }));

  it('should create component', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of([{id: 1, verified: true}]));

    // when
    component.ngOnInit();
    component.ngOnDestroy();

    // then
    expect(component).toBeTruthy();

    expect(socketService.connect).toHaveBeenCalled();
    expect(component.verified.length).toBe(1);
  });

  it('should open dialog to create new anchor', () => {
    // given
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();

    // then
    expect(component.dialogRef.componentInstance.device).toBeDefined();
    expect(component.dialogRef.componentInstance.url).toBeDefined();
    expect(component.dialogRef.componentInstance.url).toBe('anchors/');
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should create new anchor when dialog closes with value', () => {
    // given
    const expectedAnchor: Anchor = {id: 1, shortId: 1, longId: 11, verified: false};
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();
    component.dialogRef.close(expectedAnchor);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
  });
});



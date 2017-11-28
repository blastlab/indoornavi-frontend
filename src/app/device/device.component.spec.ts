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
import {DeviceService} from './device.service';
import {DeviceListComponent} from './list/device.list';
import {ActivatedRoute, Router} from '@angular/router';
import {SharedModule} from '../utils/shared/shared.module';
import {AuthGuard} from '../auth/auth.guard';
import {DeviceComponent} from './device';
import {Sink} from './sink.type';

describe('DevicesComponent', () => {
  let component: DeviceComponent;
  let fixture: ComponentFixture<DeviceComponent>;
  let mockActivatedRoute;
  let socketService: SocketService;
  let dialog: MdDialog;
  let toastService: ToastService;

  mockActivatedRoute = {snapshot: {routeConfig: {path: 'sinks'}}, queryParams: Observable.of({})};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        DndModule.forRoot(),
        MaterialModule,
        DialogTestModule,
        SharedModule
      ],
      declarations: [DeviceComponent, DeviceListComponent],
      providers: [
        DeviceService,
        SocketService,
        WebSocketService,
        DeviceService,
        HttpService,
        ToastService,
        MdDialog,
        {provide: Router, useClass: class { navigate = jasmine.createSpy('navigate'); }},
        {provide: ActivatedRoute, useValue: mockActivatedRoute},
        AuthGuard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(DeviceComponent);
    component = fixture.debugElement.componentInstance;
    socketService = fixture.debugElement.injector.get(SocketService);
    dialog = fixture.debugElement.injector.get(MdDialog);
    toastService = fixture.debugElement.injector.get(ToastService);

    spyOn(socketService, 'send').and.callFake(() => {
    });
    spyOn(toastService, 'showSuccess');
  }));

  it('should create component', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of([{id: 1, verified: true}]));
    // // when
    component.ngOnInit();
    component.ngOnDestroy();

    // then
    expect(component).toBeTruthy();

    expect(socketService.connect).toHaveBeenCalled();
    expect(component.verified.length).toBe(1);
  });

  it('should open dialog to create new sink', () => {
    // given
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.ngOnInit();
    component.openDialog();
    component.ngOnDestroy();

    // then
    expect(component.dialogRef.config.data).toBeDefined();
    expect(component.dialogRef.config.data).toBeDefined();
    expect(component.dialogRef.config.data['url']).toBe('sinks/');
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should create new sink when dialog closes with value', () => {
    // given
    const expectedAnchor: Sink = {id: 1, shortId: 1, longId: 11, verified: false, anchors: []};
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.ngOnInit();
    component.openDialog();
    component.dialogRef.close(expectedAnchor);
    component.ngOnDestroy();

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
  });
});

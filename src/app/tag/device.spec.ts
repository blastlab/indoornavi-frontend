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
import {DeviceService} from '../device/device.service';
import {DeviceListComponent} from '../device/device.list';
import {TagComponent} from './tag';
import {Tag} from './tag.type';

describe('DeviceComponent', () => {
  let component: TagComponent;
  let fixture: ComponentFixture<TagComponent>;

  let socketService: SocketService;
  let dialog: MdDialog;
  let toastService: ToastService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        DndModule.forRoot(),
        MaterialModule,
        DialogTestModule
      ],
      declarations: [TagComponent, DeviceListComponent],
      providers: [SocketService, WebSocketService, DeviceService, HttpService, ToastService, MdDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagComponent);
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

  it('should open dialog to create new tag', () => {
    // given
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();

    // then
    expect(component.dialogRef.componentInstance.device).toBeDefined();
    expect(component.dialogRef.componentInstance.url).toBeDefined();
    expect(component.dialogRef.componentInstance.url).toBe('tags/');
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should create new tag when dialog closes with value', () => {
    // given
    const expectedTag: Tag = {id: 1, shortId: 1, longId: 11, verified: false};
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();
    component.dialogRef.close(expectedTag);

    // then
    expect(toastService.showSuccess).toHaveBeenCalled();
  });
});

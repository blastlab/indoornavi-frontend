import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateModule} from '@ngx-translate/core';

import {AnchorComponent} from './anchor';
import {AnchorListComponent} from './anchor.list';
import {DndModule} from 'ng2-dnd';
import {MaterialModule, MdDialog} from '@angular/material';
import {SocketService} from '../utils/socket/socket.service';
import {WebSocketService} from 'angular2-websocket-service';
import {AnchorService} from './anchor.service';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {Observable} from 'rxjs/Rx';
import {DialogTestModule} from '../utils/dialog/dialog.test';
import {Anchor} from './anchor.type';

describe('AnchorComponent', () => {
  let component: AnchorComponent;
  let fixture: ComponentFixture<AnchorComponent>;

  let socketService: SocketService;
  let dialog: MdDialog;
  let anchorService: AnchorService;
  let toastService: ToastService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
        DndModule.forRoot(),
        MaterialModule,
        DialogTestModule
      ],
      declarations: [AnchorComponent, AnchorListComponent],
      providers: [SocketService, WebSocketService, AnchorService, HttpService, ToastService, MdDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnchorComponent);
    component = fixture.debugElement.componentInstance;
    socketService = fixture.debugElement.injector.get(SocketService);
    dialog = fixture.debugElement.injector.get(MdDialog);
    anchorService = fixture.debugElement.injector.get(AnchorService);
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
    expect(socketService.send).toHaveBeenCalled();
    expect(component.verified.length).toBe(1);
  });

  it('should open dialog to create new anchor', () => {
    // given
    spyOn(dialog, 'open').and.callThrough();

    // when
    component.openDialog();

    // then
    expect(component.dialogRef.componentInstance.anchor).toBeDefined();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should create new anchor when dialog closes with value', () => {
    // given
    const expectedAnchor: Anchor = {id: 1, shortId: 1, longId: 11, verified: false};
    spyOn(dialog, 'open').and.callThrough();
    spyOn(anchorService, 'createAnchor').and.returnValue(Observable.of(expectedAnchor));

    // when
    component.openDialog();
    component.dialogRef.close(expectedAnchor);

    // then
    expect(anchorService.createAnchor).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
    expect(component.notVerified.length).toBe(1);
    expect(component.notVerified[0]).toBe(expectedAnchor);
  });
});

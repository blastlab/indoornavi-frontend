import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RemainingDevicesListComponent} from './map-anchors-list';
import {TranslateModule} from '@ngx-translate/core';
import {SocketService} from '../../../../../utils/socket/socket.service';
import {DeviceService} from 'app/device/device.service';
import {DndModule} from 'ng2-dnd';
import {MaterialModule} from '@angular/material';
import {WebSocketService} from 'angular2-websocket-service';
import {ToastService} from '../../../../../utils/toast/toast.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {IconService} from '../../../../../utils/drawing/icon.service';
import {AuthGuard} from 'app/auth/auth.guard';
import {SharedModule} from 'app/utils/shared/shared.module';
import {HttpModule} from '@angular/http';
import {HttpService} from '../../../../../utils/http/http.service';
import {Router, RouterModule} from '@angular/router';

describe('RemainingDevicesListComponent', () => {
  let component: RemainingDevicesListComponent;
  let fixture: ComponentFixture<RemainingDevicesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, HttpModule, DndModule.forRoot(), SharedModule],
      declarations: [RemainingDevicesListComponent],
      providers: [SocketService, WebSocketService, ToastService, AcceptButtonsService,
        DrawingService, IconService, AuthGuard, DeviceService, HttpService, {provide: Router, useClass: RouterModule}]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemainingDevicesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

});

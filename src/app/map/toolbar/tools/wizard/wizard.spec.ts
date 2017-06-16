import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { WizardComponent } from './wizard';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule, MdDialog} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {FirstStepComponent} from './first-step/first-step';
import {SecondStepComponent} from './second-step/second-step';
import {ThirdStepComponent} from './third-step/third-step';
import {WebSocketService} from 'angular2-websocket-service';
import {SocketService} from '../../../../utils/socket/socket.service';
import {ToastService} from '../../../../utils/toast/toast.service';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {AcceptButtonsService} from '../../../../utils/accept-buttons/accept-buttons.service';
import {DrawingService} from '../../../../utils/drawing/drawing.service';
import {IconService} from '../../../../utils/drawing/icon.service';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [WizardComponent, FirstStepComponent, SecondStepComponent,
        ThirdStepComponent],
      providers: [MdDialog, SocketService, WebSocketService, ToastService, HintBarService,
        AcceptButtonsService, DrawingService, IconService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create WizardComponent', () => {
    expect(component).toBeTruthy();
  });
  // it should help place sink and anchors... test it out!
});

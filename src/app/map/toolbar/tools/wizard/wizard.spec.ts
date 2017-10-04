import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {WizardComponent} from './wizard';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
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
import {Observable} from 'rxjs/Observable';
import {AuthGuard} from '../../../../auth/auth.guard';
import {ActionBarService} from '../../../actionbar/actionbar.service';
import {HttpService} from '../../../../utils/http/http.service';
import {RouterTestingModule} from '@angular/router/testing';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let socketService: SocketService;
  let dialog: MdDialog;
  let firstStep: FirstStepComponent;
  let secondStep: SecondStepComponent;
  let thirdStep: ThirdStepComponent;
  let translateService: TranslateService;
  let hintBar: HintBarService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule, RouterTestingModule],
      declarations: [WizardComponent, FirstStepComponent, SecondStepComponent,
        ThirdStepComponent],
      providers: [MdDialog, SocketService, WebSocketService, ToastService, HintBarService,
        AcceptButtonsService, DrawingService, IconService, AuthGuard, ActionBarService, HttpService, TranslateService]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.debugElement.componentInstance;
    dialog = fixture.debugElement.injector.get(MdDialog);
    socketService = fixture.debugElement.injector.get(SocketService);
    translateService = fixture.debugElement.injector.get(TranslateService);
    hintBar = fixture.debugElement.injector.get(HintBarService);
    firstStep = fixture.componentInstance.firstStep;
    spyOn(firstStep, 'clean');
    spyOn(firstStep, 'load');
    secondStep = fixture.componentInstance.secondStep;
    spyOn(secondStep, 'clean');
    thirdStep = fixture.componentInstance.thirdStep;
    spyOn(thirdStep, 'clean');
    fixture.detectChanges();
  }));

  it('should create WizardComponent', () => {
    expect(component).toBeTruthy();
  });

  it('set itself to active state', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of({}));
    expect(component.active).toBeFalsy();

    // when
    component.setActive();

    // then
    expect(component.active).toBeTruthy();
    expect(component.activeStep).toBeDefined();
  });

  it('set from active to inactive and clear only active step (first)', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of({}));
    spyOn(translateService, 'get').and.returnValue(Observable.of('test'));
    spyOn(hintBar, 'publishHint').and.callFake(() => {
    });

    // when
    component.setActive();
    component.setInactive();

    // then
    expect(component.active).toBeFalsy();
    expect(firstStep.clean).toHaveBeenCalled();
    expect(secondStep.clean).not.toHaveBeenCalled();
    expect(thirdStep.clean).not.toHaveBeenCalled();
  });

  it('should clean two steps after setting to inactive when secondStep is active', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of({}));
    spyOn(translateService, 'get').and.returnValue(Observable.of('test'));
    spyOn(hintBar, 'publishHint').and.callFake(() => {
    });
    component.setActive();
    component.activeStep = secondStep;

    // when
    component.setInactive();

    // then
    expect(component.active).toBeFalsy();
    expect(firstStep.clean).toHaveBeenCalled();
    expect(secondStep.clean).toHaveBeenCalled();
    expect(thirdStep.clean).not.toHaveBeenCalled();
  });

  it('should cleanAll steps after setting to inactive when thirdStep is active', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of({}));
    spyOn(translateService, 'get').and.returnValue(Observable.of('test'));
    spyOn(hintBar, 'publishHint').and.callFake(() => {
    });
    component.setActive();
    component.activeStep = thirdStep;

    // when
    component.setInactive();

    // then
    expect(component.active).toBeFalsy();
    expect(firstStep.clean).toHaveBeenCalled();
    expect(secondStep.clean).toHaveBeenCalled();
    expect(thirdStep.clean).toHaveBeenCalled();
  });

  it('should connect with webSocket web service and call activeStep load function', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of(
      [{
        floorId: null, id: 8, longId: 3905731, name: null,
        shortId: 100012, verified: false, x: null, y: null
      }]));

    // when
    component.setActive();

    // then
    expect(socketService.connect).toHaveBeenCalled();
    // calls load when socket sends first data
    expect(firstStep.load).toHaveBeenCalled();
  });

  it('should get socketMsg from FirstStep', () => {
    // given
    spyOn(socketService, 'send').and.callFake(() => {
    });
    spyOn(firstStep, 'updateWizardData').and.callFake(() => {
    });
    spyOn(firstStep, 'prepareToSend').and.returnValue({
      sinkShortId: 8,
      sinkPosition: {x: null, y: null},
      anchorShortId: 0,
      degree: 0
    });
    spyOn(socketService, 'connect').and.returnValue(Observable.of({}));
    component.setActive();

    // when
    component.wizardNextStep(0);

    // then
    expect(firstStep.updateWizardData).toHaveBeenCalled();
    expect(socketService.send).toHaveBeenCalledWith({
      sinkShortId: 8,
      sinkPosition: {x: null, y: null},
      anchorShortId: 0,
      degree: 0
    });
  });

  it('should send SocketMessage in step 2', () => {
    // given
    spyOn(socketService, 'send').and.callFake(() => {
    });
    spyOn(firstStep, 'updateWizardData').and.callFake(() => {
    });
    spyOn(firstStep, 'prepareToSend').and.returnValue({
      sinkShortId: 8,
      sinkPosition: {x: 123, y: 456},
      anchorShortId: 1023,
      degree: 90
    });
    spyOn(socketService, 'connect').and.returnValue(Observable.of({}));
    component.setActive();

    // when
    component.wizardNextStep(1);

    // then
    expect(firstStep.updateWizardData).toHaveBeenCalled();
    expect(socketService.send).toHaveBeenCalledWith({
      sinkShortId: 8,
      sinkPosition: {x: 123, y: 456},
      anchorShortId: 1023,
      degree: 90
    });
  });
});

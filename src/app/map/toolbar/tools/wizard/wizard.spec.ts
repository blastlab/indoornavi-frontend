import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {WizardComponent} from './wizard';
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
import {Observable} from 'rxjs/Observable';
import {AuthGuard} from '../../../../auth/auth.guard';

describe('WizardComponent', () => {
  let component: WizardComponent;
  let fixture: ComponentFixture<WizardComponent>;
  let socketService: SocketService;
  let dialog: MdDialog;
  let firstStep: FirstStepComponent;
  let secondStep: SecondStepComponent;
  let thirdStep: ThirdStepComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [WizardComponent, FirstStepComponent, SecondStepComponent,
        ThirdStepComponent],
      providers: [MdDialog, SocketService, WebSocketService, ToastService, HintBarService,
        AcceptButtonsService, DrawingService, IconService, AuthGuard]
    })
      .compileComponents();

    fixture = TestBed.createComponent(WizardComponent);
    component = fixture.debugElement.componentInstance;
    dialog = fixture.debugElement.injector.get(MdDialog);
    socketService = fixture.debugElement.injector.get(SocketService);
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
    expect(component.active).toBeFalsy();
    component.setActive();
    expect(component.active).toBeTruthy();
    expect(component.activeStep).toBeDefined();
  });

  it('set from active to inactive and clear only active step (first)', () => {
    component.setActive();
    component.setInactive();
    expect(component.active).toBeFalsy();
    expect(firstStep.clean).toHaveBeenCalled();
    expect(secondStep.clean).not.toHaveBeenCalled();
    expect(thirdStep.clean).not.toHaveBeenCalled();
  });

  it('should clean two steps after setting to inactive when secondStep is active', () => {
    component.setActive();
    component.activeStep = secondStep;
    component.setInactive();
    expect(component.active).toBeFalsy();
    expect(firstStep.clean).toHaveBeenCalled();
    expect(secondStep.clean).toHaveBeenCalled();
    expect(thirdStep.clean).not.toHaveBeenCalled();
  });

  it('should cleanAll steps after setting to inactive when thirdStep is active', () => {
    component.setActive();
    component.activeStep = thirdStep;
    component.setInactive();
    expect(component.active).toBeFalsy();
    expect(firstStep.clean).toHaveBeenCalled();
    expect(secondStep.clean).toHaveBeenCalled();
    expect(thirdStep.clean).toHaveBeenCalled();
  });

  it('could open his own and every step dialogs', () => {
    component.setActive();
    expect(component.dialogRef).toBeUndefined();
    component.wizardNextStep(3);
    expect(component.dialogRef).toBeDefined();
    // firstStep dialog is opened by setActive()
    expect(firstStep.dialogRef).toBeDefined();
    expect(secondStep.dialogRef).toBeUndefined();
    secondStep.openDialog();
    expect(secondStep.dialogRef).toBeDefined();
    expect(thirdStep.dialogRef).toBeUndefined();
    thirdStep.openDialog();
    expect(thirdStep.dialogRef).toBeDefined();
  });

  it('should connect with webSocket web service and call activeStep load function', () => {
    spyOn(socketService, 'connect').and.returnValue(Observable.of(
      [{
        floorId: null, id: 8, longId: 3905731, name: null,
        shortId: 100012, verified: false, x: null, y: null
      }]));
    component.setActive();
    expect(socketService.connect).toHaveBeenCalled();
    // calls load when socket sends first data
    expect(firstStep.load).toHaveBeenCalled();
  });

  it('should get socketMsg from FirstStep', () => {
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
    component.setActive();
    component.wizardNextStep(0);
    expect(firstStep.updateWizardData).toHaveBeenCalled();
    expect(socketService.send).toHaveBeenCalledWith({
      sinkShortId: 8,
      sinkPosition: {x: null, y: null},
      anchorShortId: 0,
      degree: 0
    });
  });

  it('should send SocketMsg in step 2', () => {
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
    component.setActive();
    component.wizardNextStep(1);
    expect(firstStep.updateWizardData).toHaveBeenCalled();
    expect(socketService.send).toHaveBeenCalledWith({
      sinkShortId: 8,
      sinkPosition: {x: 123, y: 456},
      anchorShortId: 1023,
      degree: 90
    });
  });

  it('should close dialog after choice has been made', () => {
    component.setActive();
    spyOn(dialog, 'open').and.callThrough();
    expect(component.dialogRef).toBeUndefined();
    component.wizardNextStep(3);
    expect(component.dialogRef).toBeDefined();
    spyOn(component.dialogRef, 'close').and.callThrough();
    component.manualAnchors();
    expect(component.dialogRef.close).toHaveBeenCalled();
    component.wizardNextStep(3);
    expect(component.dialogRef).toBeDefined();
    spyOn(component.dialogRef, 'close').and.callThrough();
    component.wizardAnchors();
    expect(component.dialogRef.close).toHaveBeenCalled();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FirstStepComponent} from './first-step';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule, MdDialog} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {IconService} from '../../../../../utils/drawing/icon.service';
import {Anchor} from '../../../../../anchor/anchor.type';
import createSpy = jasmine.createSpy;
import {SocketMsg, WizardData} from '../wizard';

describe('FirstStepComponent', () => {
  let component: FirstStepComponent;
  let fixture: ComponentFixture<FirstStepComponent>;
  let dialog: MdDialog;
  let acceptButtons: AcceptButtonsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [FirstStepComponent],
      providers: [AcceptButtonsService, IconService, DrawingService, HintBarService, MdDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FirstStepComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MdDialog);
    acceptButtons = fixture.debugElement.injector.get(AcceptButtonsService);
    fixture.detectChanges();
  }));

  it('should create FirstStepComponent', () => {
    expect(component).toBeTruthy();
  });

  it('could open a dialog box', () => {
    spyOn(dialog, 'open').and.callThrough();
    expect(dialog.open).not.toHaveBeenCalled();
    component.openDialog();
    expect(dialog.open).toHaveBeenCalled();
  });

  it('should load sink into collection', () => {
    spyOn(component.socketData, 'add').and.callThrough();
    const anchor: Anchor = {shortId: 99, longId: 21099, verified: true};
    const anchor2: Anchor = {shortId: 39, longId: 22002, verified: false};
    const notAnAnchor: Object = {shortId: 99, name: 'not anchor', verified: false};
    expect(component.socketData.size()).toEqual(0);
    component.load([anchor]);
    expect(component.socketData.add).toHaveBeenCalled();
    expect(component.socketData.size()).toEqual(1);
    component.load([notAnAnchor]);
    expect(component.socketData.size()).toEqual(1);
    component.load([anchor, anchor2]);
    expect(component.socketData.size()).toEqual(2);
    component.load([anchor, notAnAnchor]);
    expect(component.socketData.size()).toEqual(2);
  });

  it('should set sinkShortId into StepMsg and sinkPosition in wizardData', () => {
    const anchor: Anchor = {shortId: 339, longId: 42152, verified: true};
    component.data = anchor;
    component.coords = [{x: 543, y: 623}];
    const givenWizardData: WizardData = {
      sinkShortId: null,
      sinkPosition: null,
      anchorShortId: null,
      degree: null,
      firstAnchorPosition: null,
      secondAnchorPosition: null
    };
    const expectedSocketData: SocketMsg = {
      sinkShortId: 339,
      sinkPosition: null,
      anchorShortId: null,
      degree: null
    };
    const expectedStepMsg = {
      socketData: expectedSocketData,
      wizardData: {
        sinkShortId: 339,
        sinkPosition: {x: 543, y: 623},
        anchorShortId: null,
        degree: null,
        firstAnchorPosition: null,
        secondAnchorPosition: null
      }
    };
    const message = component.prepareToSend(givenWizardData);
    expect(message).toEqual(expectedStepMsg);
  });

  it('should clean data in FirstStep', () => {
    component.coords = [{x: 543, y: 623}];
    component.data = {shortId: 937, longId: 172542, verified: false};
    component.clean();
    expect(component.coords.length).toEqual(0);
    expect(component.data).toBe(null);
    acceptButtons.visibility$.subscribe(async (visible) => {
      expect(visible).toBeFalsy();
    });
  });

  it('could emit setting tool to inactive with a `clear` flag', () => {
    spyOn(component.clearView, 'emit').and.callThrough();
    expect(component.clearView.emit).not.toHaveBeenCalled();
    component.closeWizard(true);
    expect(component.clearView.emit).toHaveBeenCalledWith(true);
    component.closeWizard(false);
    expect(component.clearView.emit).toHaveBeenCalledWith(false);
  });

});

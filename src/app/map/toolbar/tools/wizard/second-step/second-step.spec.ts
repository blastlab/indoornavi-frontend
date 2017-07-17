import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {SecondStepComponent} from './second-step';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule, MdDialog} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {IconService} from '../../../../../utils/drawing/icon.service';
import {AnchorDistance} from '../../../../../anchor/anchor.type';
import {SocketMsg, WizardData} from '../wizard';
import {Point} from '../../../../map.type';

describe('SecondStepComponent', () => {
  let component: SecondStepComponent;
  let fixture: ComponentFixture<SecondStepComponent>;
  let dialog: MdDialog;
  let acceptButtons: AcceptButtonsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [SecondStepComponent],
      providers: [AcceptButtonsService, IconService, DrawingService, HintBarService, MdDialog]
    }).compileComponents();

    fixture = TestBed.createComponent(SecondStepComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MdDialog);
    acceptButtons = fixture.debugElement.injector.get(AcceptButtonsService);
    fixture.detectChanges();
  }));

  it('should create SecondStepComponent', () => {
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
    const anchorDist: AnchorDistance = {anchorId: 16, distance: 200};
    const anchorDist2: AnchorDistance = {anchorId: 23, distance: 125};
    const anchorDist3: AnchorDistance = {anchorId: 31, distance: 350};
    const anAnchor: Object = {shortId: 'text', name: 'not anchor', verified: false};
    const anAnchor2: Object = {shortId: null, name: 'notAnAnchor', verified: false};
    expect(component.socketData.size()).toEqual(0);
    component.load(anchorDist);
    expect(component.socketData.add).toHaveBeenCalled();
    expect(component.socketData.size()).toEqual(1);
    component.load(anAnchor);
    component.load(anAnchor2);
    expect(component.socketData.size()).toEqual(1);
    component.load(anchorDist2);
    expect(component.socketData.size()).toEqual(2);
    component.load(anchorDist3);
    expect(component.socketData.size()).toEqual(3);
  });

  it('should set sinkShortId into StepMsg and sinkPosition in wizardData', () => {
    spyOn(component, 'calculateDegree').and.callFake(() => {
      return 45;
    });
    const anchor: AnchorDistance = {anchorId: 39, distance: 422};
    component.data = anchor;
    const sinkPos: Point = {x: 150, y: 450};
    component.coords = [{x: 300, y: 300}];
    const degree = 45;
    const givenWizardData: WizardData = {
      sinkShortId: 7245,
      sinkPosition: sinkPos,
      anchorShortId: null,
      degree: null,
      firstAnchorPosition: null,
      secondAnchorPosition: null
    };
    const expectedSocketData: SocketMsg = {
      sinkShortId: 7245,
      sinkPosition: sinkPos,
      anchorShortId: 39,
      degree: degree
    };
    const message = component.prepareToSend(givenWizardData);
    expect(message).toEqual(expectedSocketData);
  });

  it('should clean data in SecondStep', () => {
    component.coords = [{x: 543, y: 623}];
    component.data = {anchorId: 37, distance: 752};
    component.clean();
    expect(component.coords.length).toEqual(0);
    expect(component.data).toBe(null);
    acceptButtons.visibilitySet.subscribe(async (visible) => {
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

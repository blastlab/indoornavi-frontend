import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ThirdStepComponent} from './third-step';
import {MaterialModule, MdDialog} from '@angular/material';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {IconService} from '../../../../../utils/drawing/icon.service';
import {AnchorDistance, AnchorSuggestedPositions} from '../../../../../anchor/anchor.type';
import {Point} from '../../../../map.type';
import {SocketMessage, Step, WizardData} from '../wizard.type';

describe('ThirdStepComponent', () => {
  let component: ThirdStepComponent;
  let fixture: ComponentFixture<ThirdStepComponent>;
  let dialog: MdDialog;
  let acceptButtons: AcceptButtonsService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [ThirdStepComponent],
      providers: [AcceptButtonsService, IconService, DrawingService, HintBarService, MdDialog]
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdStepComponent);
    component = fixture.componentInstance;
    dialog = fixture.debugElement.injector.get(MdDialog);
    acceptButtons = fixture.debugElement.injector.get(AcceptButtonsService);
    fixture.detectChanges();
  }));

  it('should create ThirdStepComponent', () => {
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
    const anchorPositions: AnchorSuggestedPositions = {anchorId: 16, points: [{x: 150, y: 450}, {x: 100, y: 200}]};
    const anchorPositions2: AnchorSuggestedPositions = {anchorId: 23, points: [{x: 250, y: 350}, {x: 200, y: 100}]};
    const anchorDist: AnchorDistance = {anchorId: 31, distance: 350};
    const anAnchor: Object = {shortId: 'text', name: 'not anchor', verified: false};
    expect(component.socketData.size()).toEqual(0);
    component.load(anchorPositions);
    expect(component.socketData.add).toHaveBeenCalled();
    expect(component.socketData.size()).toEqual(1);
    component.load(anAnchor);
    expect(component.socketData.size()).toEqual(1);
    component.load(anchorPositions2);
    expect(component.socketData.size()).toEqual(2);
    component.load(anchorDist);
    expect(component.socketData.size()).toEqual(2);
  });

  it('should set sinkShortId into StepMsg and sinkPosition in wizardData', () => {
    component.data = {anchorId: 23, points: [{x: 150, y: 250}, {x: 250, y: 150}]};
    const sinkPos: Point = {x: 150, y: 450};
    const anchorPos: Point = {x: 300, y: 300};
    component.coordinates = [{x: 525, y: 175}];
    const degree = 45;
    const givenWizardData: WizardData = {
      sinkShortId: 7245,
      sinkPosition: sinkPos,
      firstAnchorShortId: 36,
      secondAnchorShortId: null,
      degree: degree,
      firstAnchorPosition: anchorPos,
      secondAnchorPosition: null
    };
    const expectedSocketData: SocketMessage = {
      step: Step.THIRD
    };
    const message = component.prepareToSend(givenWizardData);
    expect(message).toEqual(expectedSocketData);
  });

  it('should clean data in ThirdStep', () => {
    component.coordinates = [{x: 543, y: 623}];
    component.data = {anchorId: 23, points: [{x: 250, y: 350}, {x: 200, y: 100}]};
    component.clean();
    expect(component.coordinates.length).toEqual(0);
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

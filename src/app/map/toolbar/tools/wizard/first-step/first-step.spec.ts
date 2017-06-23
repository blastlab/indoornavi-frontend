import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstStepComponent } from './first-step';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule, MdDialog} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {IconService} from '../../../../../utils/drawing/icon.service';
import {Anchor} from '../../../../../anchor/anchor.type';

describe('FirstStepComponent', () => {
  let component: FirstStepComponent;
  let fixture: ComponentFixture<FirstStepComponent>;
  let dialog: MdDialog;

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

  // test TODO placing on map (coords and DOM should be equal)
  it('should place sink on map', () => {

  });
  // test TODO makeDecision -> accButtons tests...

  // test TODO message validity

  // test TODO cleaning

});

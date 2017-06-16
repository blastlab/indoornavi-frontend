import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SecondStepComponent } from './second-step';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule, MdDialog} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {IconService} from '../../../../../utils/drawing/icon.service';

describe('SecondStepComponent', () => {
  let component: SecondStepComponent;
  let fixture: ComponentFixture<SecondStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [SecondStepComponent],
      providers: [AcceptButtonsService, IconService, DrawingService, HintBarService, MdDialog]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create SecondStepComponent', () => {
    expect(component).toBeTruthy();
  });
});

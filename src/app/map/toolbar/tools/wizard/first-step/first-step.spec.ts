import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FirstStepComponent } from './first-step';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule, MdDialog} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {IconService} from '../../../../../utils/drawing/icon.service';

describe('FirstStepComponent', () => {
  let component: FirstStepComponent;
  let fixture: ComponentFixture<FirstStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [FirstStepComponent],
      providers: [AcceptButtonsService, IconService, DrawingService, HintBarService, MdDialog]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirstStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create FirstStepComponent', () => {
    expect(component).toBeTruthy();
  });
});

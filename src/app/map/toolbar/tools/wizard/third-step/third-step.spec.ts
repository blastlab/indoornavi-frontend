import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ThirdStepComponent } from './third-step';
import {MaterialModule, MdDialog} from '@angular/material';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../utils/accept-buttons/accept-buttons.service';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {IconService} from '../../../../../utils/drawing/icon.service';

describe('ThirdStepComponent', () => {
  let component: ThirdStepComponent;
  let fixture: ComponentFixture<ThirdStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), MaterialModule, FormsModule],
      declarations: [ThirdStepComponent],
      providers: [AcceptButtonsService, IconService, DrawingService, HintBarService, MdDialog]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ThirdStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ThirdStepComponent', () => {
    expect(component).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ThirdStepComponent} from './third-step';
import {HintBarService} from '../../../../hint-bar/hint-bar.service';
import {DrawingService} from '../../../../../utils/drawing/drawing.service';
import {AcceptButtonsService} from '../../../../../shared/components/accept-buttons/accept-buttons.service';
import {TranslateModule} from '@ngx-translate/core';
import {IconService} from '../../../../../utils/drawing/icon.service';

describe('ThirdStepComponent', () => {
  let component: ThirdStepComponent;
  let fixture: ComponentFixture<ThirdStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [ThirdStepComponent],
      providers: [AcceptButtonsService, IconService, DrawingService, HintBarService]
    }).compileComponents();

    fixture = TestBed.createComponent(ThirdStepComponent);
    component = fixture.componentInstance;
  }));

  it('should create ThirdStepComponent', () => {
    expect(component).toBeTruthy();
  });

});

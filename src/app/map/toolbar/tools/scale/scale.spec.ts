import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleComponent} from './scale';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from '../../../../utils/scale-hint/scale-hint.service';
import {ScaleInputService} from '../../../../utils/scale-input/scale-input.service';
import {MapLoaderInformerService} from '../../../../utils/map-loader-informer/map-loader-informer.service';

describe('Scale', () => {
  let component: ScaleComponent;
  let fixture: ComponentFixture<ScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleComponent],
      imports: [
        MaterialModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        ScaleHintService, ScaleInputService, MapLoaderInformerService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

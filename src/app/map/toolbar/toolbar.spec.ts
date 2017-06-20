import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ToolbarComponent} from './toolbar';
import {TranslateModule} from '@ngx-translate/core';
import {ScaleComponent} from "app/map/toolbar/tools/scale/scale";
import {MaterialModule} from '@angular/material';
import {FormsModule} from '@angular/forms';
import {ScaleInputService} from '../../utils/scale-input/scale-input.service';
import {ScaleHintService} from '../../utils/scale-hint/scale-hint.service';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';

describe('ToolbarComponent', () => {
  let component: ToolbarComponent;
  let fixture: ComponentFixture<ToolbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ToolbarComponent, ScaleComponent],
      imports: [
        TranslateModule.forRoot(), MaterialModule, FormsModule
      ],
      providers:[
        ScaleInputService, ScaleHintService, MapLoaderInformerService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleInputComponent} from './input';
import {TranslateModule} from '@ngx-translate/core';
import {ScaleInputService} from './input.service';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from '../hint/hint.service';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {DndModule} from 'ng2-dnd';
import {FloorService} from '../../../../../floor/floor.service';
import {ToastService} from '../../../../../utils/toast/toast.service';
import {AuthGuard} from '../../../../../auth/auth.guard';
import {ScaleService} from '../scale.service';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

describe('ScaleInputComponent', () => {
  let component: ScaleInputComponent;
  let fixture: ComponentFixture<ScaleInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleInputComponent],
      imports: [
        TranslateModule.forRoot(),
        BrowserModule,
        FormsModule,
        MaterialModule,
        HttpModule,
        RouterTestingModule,
        DndModule.forRoot(),
        BrowserAnimationsModule
      ],
      providers: [
        ScaleInputService, ScaleHintService, FloorService, ToastService, AuthGuard, ScaleService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleInputComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

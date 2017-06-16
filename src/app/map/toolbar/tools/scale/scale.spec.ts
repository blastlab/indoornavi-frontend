import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleComponent } from './scale';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';

describe('ScaleComponent', () => {
  let component: ScaleComponent;
  let fixture: ComponentFixture<ScaleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MaterialModule, TranslateModule.forRoot()],
      declarations: [ ScaleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ScaleComponent', () => {
    expect(component).toBeTruthy();
  });
});

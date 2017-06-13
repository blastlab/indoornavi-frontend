import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleInputComponent } from './scale-input';
import {TranslateModule} from '@ngx-translate/core';
import {ScaleInputService} from './scale-input.service';

describe('ScaleInputComponent', () => {
  let component: ScaleInputComponent;
  let fixture: ComponentFixture<ScaleInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleInputComponent ],
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        ScaleInputService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

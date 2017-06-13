import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleHintComponent } from './scale-hint';
import {TranslateModule} from '@ngx-translate/core';
import {ScaleHintService} from './scale-hint.service';

describe('ScaleHintComponent', () => {
  let component: ScaleHintComponent;
  let fixture: ComponentFixture<ScaleHintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleHintComponent ],
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        ScaleHintService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

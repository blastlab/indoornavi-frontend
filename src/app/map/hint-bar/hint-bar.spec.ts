import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HintBarComponent } from './hint-bar';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {TranslateStore} from '@ngx-translate/core/src/translate.store';

describe('HintBarComponent', () => {
  let component: HintBarComponent;
  let fixture: ComponentFixture<HintBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HintBarComponent ],
      imports: [
        TranslateModule.forRoot(),
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HintBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

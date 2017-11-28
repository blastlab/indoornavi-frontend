import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {HintBarComponent} from './hint-bar';
import {TranslateModule} from '@ngx-translate/core';
import {HintBarService} from './hint-bar.service';

describe('HintBarComponent', () => {

  let component: HintBarComponent;
  let fixture: ComponentFixture<HintBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      declarations: [HintBarComponent],
      providers: [
        HintBarService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HintBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create HintBarComponent and set hintMessage', () => {
    expect(component).toBeTruthy();
    expect(component.hintMessage).toBeDefined();
  });

  it('should set hintMessage into passed string', () => {
    component.hintMessage = undefined;
    expect(component.hintMessage).toBeUndefined();
    component.setHint('testString!*.nG');
    expect(component.hintMessage).toBeDefined();
    expect(component.hintMessage).toEqual('testString!*.nG');
  });

});

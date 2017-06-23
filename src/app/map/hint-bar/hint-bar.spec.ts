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

  it('should create HintBarComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should set hintMsg to default', () => {
    // translations called onInit
    expect(component.hintMsg).toBeDefined();
  });

  it('should set hintMsg into passed string', () => {
    component.hintMsg = undefined;
    expect(component.hintMsg).toBeUndefined();
    component.setHint('testString!*.nG');
    expect(component.hintMsg).toBeDefined();
    expect(component.hintMsg).toEqual('testString!*.nG');
  });


});

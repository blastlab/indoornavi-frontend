import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaleHintComponent } from './scale-hint';

describe('ScaleHintComponent', () => {
  let component: ScaleHintComponent;
  let fixture: ComponentFixture<ScaleHintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScaleHintComponent ]
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

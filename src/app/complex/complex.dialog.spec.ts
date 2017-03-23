import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexDialog } from './complex.dialog';

describe('ComplexComponent', () => {
  let component: ComplexDialog;
  let fixture: ComponentFixture<ComplexDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplexDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplexDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

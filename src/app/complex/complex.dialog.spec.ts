import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComplexDialogComponent } from './complex.dialog';

describe('ComplexComponent', () => {
  let component: ComplexDialogComponent;
  let fixture: ComponentFixture<ComplexDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComplexDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComplexDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

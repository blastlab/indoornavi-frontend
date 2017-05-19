import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptButtonsComponent } from './accept-buttons';

describe('AcceptButtonsComponent', () => {
  let component: AcceptButtonsComponent;
  let fixture: ComponentFixture<AcceptButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AcceptButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

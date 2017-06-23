import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AcceptButtonsComponent } from './accept-buttons';
import {AcceptButtonsService} from './accept-buttons.service';

describe('AcceptButtonsComponent', () => {
  let component: AcceptButtonsComponent;
  let fixture: ComponentFixture<AcceptButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AcceptButtonsComponent],
      providers: [AcceptButtonsService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create AcceptButtonsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should publish next value for decision$ observable', () => {
    expect(component.decide(false)).toEqual(false);
    expect(component.decide(true)).toEqual(true);
  });

});

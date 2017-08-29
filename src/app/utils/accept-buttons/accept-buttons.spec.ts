import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {AcceptButtonsComponent} from './accept-buttons';
import {AcceptButtonsService} from './accept-buttons.service';

describe('AcceptButtonsComponent', () => {
  let component: AcceptButtonsComponent;
  let fixture: ComponentFixture<AcceptButtonsComponent>;
  let acceptButtons: AcceptButtonsService;

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
    acceptButtons = fixture.debugElement.injector.get(AcceptButtonsService);
    fixture.detectChanges();
  });

  it('should create AcceptButtonsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should set o visible when service observable `visibilitySet` changed to true', () => {
    acceptButtons.visibilitySet.subscribe(async (visibility) => {
      expect(visibility).toBeTruthy();
    });
    acceptButtons.publishVisibility(true);
  });

  it('should have found `#accept-buttons` element', () => {
    expect(fixture.nativeElement.querySelector('#accept-buttons')).toBeTruthy();
  });

  it('should publish next value for decisionMade observable and hide (false)', () => {
    spyOn(component, 'decide').and.callThrough();
    component.decide(false);
    acceptButtons.decisionMade.subscribe(async (decision) => {
      expect(decision).toBeFalsy();
    });
    expect(component.visible).toEqual(false);
  });

  it('should publish next value for decisionMade observable and hide (true)', () => {
    spyOn(component, 'decide').and.callThrough();
    component.decide(true);
    acceptButtons.decisionMade.subscribe(async (decision) => {
      expect(decision).toBeTruthy();
    });
    expect(component.visible).toEqual(false);
  });

});

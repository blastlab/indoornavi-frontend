import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeatMapControllerComponent } from './heat-map-controller.component';

describe('HeatMapControllerComponent', () => {
  let component: HeatMapControllerComponent;
  let fixture: ComponentFixture<HeatMapControllerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeatMapControllerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeatMapControllerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

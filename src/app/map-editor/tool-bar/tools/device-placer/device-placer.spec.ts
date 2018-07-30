import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {DevicePlacerComponent} from './device-placer.component';

describe('DevicePlacerComponent', () => {
  let component: DevicePlacerComponent;
  let fixture: ComponentFixture<DevicePlacerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DevicePlacerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicePlacerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapViewerComponent } from './map.viewer';
import {ScaleInputComponent} from '../utils/scale-input/scale-input';

describe('MapViewerComponent', () => {
  let component: MapViewerComponent;
  let fixture: ComponentFixture<MapViewerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapViewerComponent ],
      providers: [
        ScaleInputComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


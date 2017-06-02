import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MapLoaderInformerComponent} from './map-loader-informer';

describe('MapLoaderInformerComponent', () => {
  let component: MapLoaderInformerComponent;
  let fixture: ComponentFixture<MapLoaderInformerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MapLoaderInformerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLoaderInformerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

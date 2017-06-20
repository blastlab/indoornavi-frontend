import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleComponent} from './scale';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from '../../../../utils/scale-hint/scale-hint.service';
import {ScaleInputService} from '../../../../utils/scale-input/scale-input.service';
import {MapLoaderInformerService} from '../../../../utils/map-loader-informer/map-loader-informer.service';
import {MeasureEnum, Scale} from 'app/map/toolbar/tools/scale/scale.type';
import {DOCUMENT} from '@angular/platform-browser';
import {Floor} from '../../../../floor/floor.type';
import {Point} from '../../../map.type';


describe('Scale', () => {
  let component: ScaleComponent;
  let fixture: ComponentFixture<ScaleComponent>;
  let mapLoaderInformer: MapLoaderInformerService;
  let document;
  let floor: Floor;
  let scale: Scale;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleComponent],
      imports: [
        MaterialModule,
        TranslateModule.forRoot(),
      ],
      providers: [
        ScaleHintService, ScaleInputService, MapLoaderInformerService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleComponent);
    component = fixture.componentInstance;
    mapLoaderInformer = fixture.debugElement.injector.get(MapLoaderInformerService);
    document = fixture.debugElement.injector.get(DOCUMENT);
    scale = <Scale>{
      start: <Point>{
        x: 123,
        y: 456
      },
      stop: <Point>{
        x: 789,
        y: 101
      },
      realDistance: 112,
      measure: MeasureEnum.METERS
    };
    floor = <Floor>{
      scale: this.scale
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create scale svg group', () => {
    component.floor = floor;
    spyOn(component, 'createSvgGroupWithScale')
    mapLoaderInformer.publishIsLoaded(true);
    expect(document.getElementById('scaleGroup')).toBeTruthy();// not working
  });
});

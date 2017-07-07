import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleComponent} from './scale';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from '../../../../utils/scale-hint/scale-hint.service';
import {ScaleInputService} from '../../../../utils/scale-input/scale-input.service';
import {MapLoaderInformerService} from '../../../../utils/map-loader-informer/map-loader-informer.service';
import {MeasureEnum, Scale} from 'app/map/toolbar/tools/scale/scale.type';
import {Floor} from '../../../../floor/floor.type';
import {Line, Point} from '../../../map.type';


describe('Scale', () => {
  let component: ScaleComponent;
  let fixture: ComponentFixture<ScaleComponent>;
  let mapLoaderInformer: MapLoaderInformerService;
  let floor: Floor;
  let scale: Scale;
  let point1: Point;
  let point2: Point;

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
    point1 = <Point>{
      x: 861.0,
      y: 300.0
    };
    point2 = <Point>{
      x: 361.0,
      y: 50.0
    };
    scale = <Scale>{
      start: point1,
      stop: point2,
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

  it('should calculate scale line slope', () => {
    const exemplarySlope = 0.5;

    const testedSlope = ScaleComponent.getSlope(point1, point2);
    expect(testedSlope).toEqual(exemplarySlope);
  });

  it('should calculate vertical and horizontal endings offset', () => {
    const testedComponent = component as any;
    testedComponent.linesArray = [];

    testedComponent.linesArray.push(<Line>{
      p1: point1,
      p2: point1
    });
    const testedVerticalOffset: number = testedComponent.getVerticalEndingOffset();
    const testedHorizontalOffset: number = testedComponent.getHorizontalEndingOffset();
    const p1 = testedComponent.linesArray[0].p1;
    const p2 = testedComponent.linesArray[0].p2;
    const exemplarySlope = (p1.y - p2.y) / (p1.x - p2.x);

    const exemplaryVerticalOffset = testedComponent.END_SIZE * Math.cos(Math.atan(exemplarySlope));
    const exemplaryHorizontalOffset = testedComponent.END_SIZE * Math.sin(Math.atan(exemplarySlope));

    expect(exemplaryVerticalOffset).toEqual(testedVerticalOffset);
    expect(exemplaryHorizontalOffset).toEqual(testedHorizontalOffset);
  });
});

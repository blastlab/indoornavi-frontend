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
  let x1;
  let y1;
  let x2;
  let y2;

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
     x1 = 523.0;
     y1 = 294.0;
     x2 = 361.0;
     y2 = 363.0;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate scale line slope', () => {
    const exemplarySlope = (y1 - y2) / (x1 - x2);

    const testedSlope = ScaleComponent.getSlope(x1, y1, x2, y2);
    expect(testedSlope).toEqual(exemplarySlope);
  });

  it('should calculate vertical and horizontal endings offset', () => {
    const testedComponent = component as any;
    testedComponent.linesArray = [];

    testedComponent.linesArray.push(<Line>{
      p1: <Point>{
        x: x1,
        y: y1
      },
      p2: <Point>{
        x: x2,
        y: y2
      }
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

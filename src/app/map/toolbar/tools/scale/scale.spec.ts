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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate scale line slope', () => {
    const x1 = 523.0;
    const y1 = 294.0;
    const x2 = 361.0;
    const y2 = 363.0;
    const exemplarySlope = (y1 - y2) / (x1 - x2);

    const testedSlope = (component as any).getSlope(x1, y1, x2, y2);
    expect(testedSlope).toEqual(exemplarySlope);
  });

  it('should calculate vertical and horizontal endings offset', () => {
    const testedComponent = component as any;
    testedComponent.linesArray = [];

    testedComponent.linesArray.push(<Line>{
      p1: <Point>{
        x: 523.0,
        y: 294.0
      },
      p2: <Point>{
        x: 361.0,
        y: 363.0
      }
    });
    const testedVerticalOffset: number = testedComponent.getVerticalEndingOffset();
    const testedHorizontalOffset: number = testedComponent.getHorizontalEndingOffset();
    const x1 = testedComponent.linesArray[0].p1.x;
    const y1 = testedComponent.linesArray[0].p1.y;
    const x2 = testedComponent.linesArray[0].p2.x;
    const y2 = testedComponent.linesArray[0].p2.y;
    const exemplarySlope = (y1 - y2) / (x1 - x2);

    const exemplaryVerticalOffset = testedComponent.END_SIZE * Math.cos(Math.atan(exemplarySlope));
    const exemplaryHorizontalOffset = testedComponent.END_SIZE * Math.sin(Math.atan(exemplarySlope));

    expect(exemplaryVerticalOffset).toEqual(testedVerticalOffset);
    expect(exemplaryHorizontalOffset).toEqual(testedHorizontalOffset);
  });
});

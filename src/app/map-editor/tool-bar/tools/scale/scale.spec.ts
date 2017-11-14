import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleComponent} from './scale';
import {TranslateModule} from '@ngx-translate/core';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from './hint/hint.service';
import {ScaleInputService} from './input/input.service';
import {MapLoaderInformerService} from '../../../../utils/map-loader-informer/map-loader-informer.service';
import {Measure, Scale} from 'app/map-editor/tool-bar/tools/scale/scale.type';
import {Floor} from '../../../../floor/floor.type';
import {Line, Point} from '../../../map.type';
import {Geometry} from '../../../../utils/helper/geometry';
import {AuthGuard} from '../../../../auth/auth.guard';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {RouterTestingModule} from '@angular/router/testing';
import {ScaleService} from './scale.service';


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
        RouterTestingModule
      ],
      providers: [
        ScaleHintService, ScaleInputService, MapLoaderInformerService, AuthGuard, HintBarService, ActionBarService,
        ScaleService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleComponent);
    component = fixture.componentInstance;
    mapLoaderInformer = fixture.debugElement.injector.get(MapLoaderInformerService);
    point1 = <Point>{
      x: 300.0,
      y: 300.0
    };
    point2 = <Point>{
      x: 100.0,
      y: 100.0
    };
    scale = <Scale>{
      start: point1,
      stop: point2,
      realDistance: 112,
      measure: Measure.METERS
    };
    floor = <Floor>{
      scale: this.scale
    };
    fixture.detectChanges();
  });

  it('should create ScaleComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate scale line slope', () => {
    const exemplarySlope = 1;

    const testedSlope = Geometry.getSlope(point1, point2);
    expect(testedSlope).toEqual(exemplarySlope);
  });

  it('should calculate vertical and horizontal endings offset', () => {
    const line = <Line>{
      p1: point1,
      p2: point2
    };
    const testedVerticalOffset: number = Geometry.getVerticalEndingOffset(line, 5);
    const testedHorizontalOffset: number = Geometry.getHorizontalEndingOffset(line, 5);

    const exemplaryVerticalOffset = 3.5355339059327378;
    const exemplaryHorizontalOffset = 3.5355339059327373;

    expect(testedHorizontalOffset).toEqual(exemplaryHorizontalOffset);
    expect(testedVerticalOffset).toEqual(exemplaryVerticalOffset);
  });
});

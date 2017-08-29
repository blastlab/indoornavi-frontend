import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleInputComponent} from './input';
import {TranslateModule} from '@ngx-translate/core';
import {ScaleInputService} from './input.service';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from '../hint/hint.service';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {DndModule} from 'ng2-dnd';
import {FloorService} from '../../../../../floor/floor.service';
import {ToastService} from '../../../../../utils/toast/toast.service';
import {HttpService} from '../../../../../utils/http/http.service';
import {Measure, Scale} from '../scale.type';
import {Point} from '../../../../map.type';
import {Floor} from '../../../../../floor/floor.type';
import {Observable} from 'rxjs/Rx';
import {AuthGuard} from '../../../../../auth/auth.guard';
import {ScaleService} from '../scale.service';

describe('ScaleInputComponent', () => {
  let component: ScaleInputComponent;
  let fixture: ComponentFixture<ScaleInputComponent>;
  let route: ActivatedRoute;
  let toastService: ToastService;
  let scaleHintService: ScaleHintService;
  let scaleInputService: ScaleInputService;
  let floorService: FloorService;
  let scaleService: ScaleService;
  let scale: Scale;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleInputComponent],
      imports: [
        TranslateModule.forRoot(), BrowserModule, FormsModule, MaterialModule, HttpModule, RouterTestingModule, DndModule.forRoot()
      ],
      providers: [
        ScaleInputService, ScaleHintService, FloorService, ToastService, HttpService, AuthGuard, ScaleService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScaleInputComponent);
    component = fixture.componentInstance;
    route = fixture.debugElement.injector.get(ActivatedRoute);
    toastService = fixture.debugElement.injector.get(ToastService);
    scaleHintService = fixture.debugElement.injector.get(ScaleHintService);
    scaleInputService = fixture.debugElement.injector.get(ScaleInputService);
    floorService = fixture.debugElement.injector.get(FloorService);
    scaleService = fixture.debugElement.injector.get(ScaleService);
    fixture.detectChanges();
    spyOn(toastService, 'showSuccess');
    spyOn(toastService, 'showFailure');
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
      measure: Measure.METERS
    };
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should publish scale after confirm button has been clicked', () => {
    // given
    const expectedFloor: Floor = {
        id: 6,
        level: 0,
        name: '',
        buildingId: 4,
        imageId: 1,
        scale: scale
      };
    spyOn(scaleHintService, 'publishScale');
    spyOn(scaleInputService, 'publishSaveClicked');
    component.scale = scale;
    const valid = true;

    // when
    component.confirm(valid);

    // then
    expect(scaleInputService.publishSaveClicked).toHaveBeenCalled();
    expect(scaleHintService.publishScale).toHaveBeenCalled();
    expect(toastService.showSuccess).toHaveBeenCalled();
  });

  it('should NOT save scale in DB because of Measure unit not set', () => {
    // given
    component.scale = scale;
    component.scale.measure = null;
    const errorCode = 'Please set the measure unit';
    const valid = true;
    spyOn(floorService, 'setScale').and.returnValue(Observable.of(errorCode));

    // when
    component.confirm(valid);

    // then
    expect(toastService.showSuccess).not.toHaveBeenCalled();
    expect(toastService.showFailure).toHaveBeenCalled();
  });

  it('should NOT save scale in DB because of invalid real distance', () => {
    // given
    component.scale = scale;
    const valid = false;
    const errorCode = 'Real distance must be integer';
    spyOn(floorService, 'setScale').and.returnValue(Observable.of(errorCode));

    // when
    component.confirm(valid);

    // then
    expect(toastService.showSuccess).not.toHaveBeenCalled();
    expect(toastService.showFailure).toHaveBeenCalled();
  });
});

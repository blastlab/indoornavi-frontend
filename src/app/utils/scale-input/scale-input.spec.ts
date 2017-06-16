import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ScaleInputComponent} from './scale-input';
import {TranslateModule} from '@ngx-translate/core';
import {ScaleInputService} from './scale-input.service';
import {FormsModule} from '@angular/forms';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from '../scale-hint/scale-hint.service';
import {ActivatedRoute} from '@angular/router';
import {RouterTestingModule} from '@angular/router/testing';
import {DndModule} from 'ng2-dnd';
import {FloorService} from '../../floor/floor.service';
import {ToastService} from '../toast/toast.service';
import {HttpService} from '../http/http.service';
import {MeasureEnum, Scale} from '../../map/toolbar/tools/scale/scale.type';
import {Point} from '../../map/map.type';

describe('ScaleInputComponent', () => {
  let component: ScaleInputComponent;
  let fixture: ComponentFixture<ScaleInputComponent>;
  let route: ActivatedRoute;
  let toastService: ToastService;
  let scaleHintService: ScaleHintService;
  let scale = <Scale>{
    start: <Point>{
      x: 123,
      y: 234
    },
    stop: <Point>{
      x: 567,
      y: 789
    },
    realDistance: 234,
    measure: MeasureEnum.METERS
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ScaleInputComponent],
      imports: [
        TranslateModule.forRoot(), BrowserModule, FormsModule, MaterialModule, HttpModule, RouterTestingModule, DndModule.forRoot()
      ],
      providers: [
        ScaleInputService, ScaleHintService, FloorService, ToastService, HttpService
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
    fixture.detectChanges();
    spyOn(toastService, 'showSuccess');
    spyOn(toastService, 'showFailure');

  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Saves scale in DB and checks if scale is properly created', () => {
    it('should save scale in DB', () => {
      // given
      spyOn(scaleHintService, 'publishScale');
      component.scale = scale;
      const valid = true;

      // when
      component.save(valid);

      // then
      expect(scaleHintService.publishScale).toHaveBeenCalled();
      expect(toastService.showSuccess).toHaveBeenCalled();
      expect(toastService.showFailure).not.toHaveBeenCalled();
    });

    it('should NOT save scale in DB because of Measure unit not set', () => {
      // given
      component.scale = scale;
      component.scale.measure = null;
      const valid = true;

      // when
      component.save(valid);

      // then
      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(toastService.showFailure).toHaveBeenCalled();
    });

    it('should NOT save scale in DB because of invalid real distance', () => {
      // given
      component.scale = scale;
      const valid = false;

      // when
      component.save(valid);

      // then
      expect(toastService.showSuccess).not.toHaveBeenCalled();
      expect(toastService.showFailure).toHaveBeenCalled();
    });
  });
});

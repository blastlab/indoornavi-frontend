import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MapViewerComponent} from './map.viewer';
import {ScaleInputComponent} from './toolbar/tools/scale/input/input';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from './toolbar/tools/scale/hint/hint.service';
import {ScaleInputService} from './toolbar/tools/scale/input/input.service';
import {FormsModule} from '@angular/forms';
import {ScaleHintComponent} from './toolbar/tools/scale/hint/hint';
import {TranslateModule} from '@ngx-translate/core';
import {MapLoaderInformerService} from '../utils/map-loader-informer/map-loader-informer.service';
import {RouterTestingModule} from '@angular/router/testing';
import {FloorService} from '../floor/floor.service';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {Floor} from '../floor/floor.type';
import {MapService} from './map.service';
import {AuthGuard} from '../auth/auth.guard';

describe('MapViewerComponent', () => {
  let component: MapViewerComponent;
  let fixture: ComponentFixture<MapViewerComponent>;
  const floor: Floor = <Floor> {
    imageId: 23
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(), MaterialModule, FormsModule, RouterTestingModule
      ],
      declarations: [MapViewerComponent, ScaleInputComponent, ScaleHintComponent],
      providers: [
        ScaleInputService, ScaleHintService, MapLoaderInformerService, FloorService, HttpService, ToastService, MapService, AuthGuard
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapViewerComponent);
    component = fixture.componentInstance;
    component.floor = floor;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});


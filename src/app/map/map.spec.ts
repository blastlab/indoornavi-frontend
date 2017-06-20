import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {MapViewerComponent} from './map.viewer';
import {ScaleInputComponent} from '../utils/scale-input/scale-input';
import {MaterialModule} from '@angular/material';
import {ScaleHintService} from '../utils/scale-hint/scale-hint.service';
import {ScaleInputService} from '../utils/scale-input/scale-input.service';
import {FormsModule} from '@angular/forms';
import {ScaleHintComponent} from '../utils/scale-hint/scale-hint';
import {TranslateModule} from '@ngx-translate/core';
import {MapLoaderInformerService} from '../utils/map-loader-informer/map-loader-informer.service';
import {RouterTestingModule} from '@angular/router/testing';
import {FloorService} from '../floor/floor.service';
import {HttpService} from '../utils/http/http.service';
import {ToastService} from '../utils/toast/toast.service';
import {Floor} from '../floor/floor.type';

describe('MapViewerComponent', () => {
  let component: MapViewerComponent;
  let fixture: ComponentFixture<MapViewerComponent>;
  let floor: Floor = <Floor>{
    imageId: 23
    };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(), MaterialModule, FormsModule, RouterTestingModule
      ],
      declarations: [MapViewerComponent, ScaleInputComponent, ScaleHintComponent],
      providers: [
        ScaleInputService, ScaleHintService, MapLoaderInformerService, FloorService, HttpService, ToastService
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


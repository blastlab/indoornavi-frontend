import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {WebSocketService} from 'angular2-websocket-service';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpModule} from '@angular/http';
import {AuthGuard} from '../../../auth/auth.guard';
import {MaterialModule, MdIconRegistry} from '@angular/material';
import {AnalyticsComponent} from './analytics';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {TranslateModule} from '@ngx-translate/core';

import {FormsModule} from '@angular/forms';
import {PublishedService} from '../../published.service';
import {MapViewerService} from '../../../map-editor/map.editor.service';
import {AreaService} from '../../../shared/services/area/area.service';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {HttpService} from '../../../shared/services/http/http.service';
import {MapService} from '../../../map-editor/map.service';
import {Measure} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {MeasureSocketDataType} from '../../published.type';


describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let publishedService: PublishedService;
  let mapViewerService: MapViewerService;
  let areaService: AreaService;
  let socketService: SocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AnalyticsComponent],
      imports: [
        FormsModule,
        MaterialModule,
        TranslateModule.forRoot(),
        HttpModule,
        RouterTestingModule,

      ],
      providers: [SocketService, WebSocketService, PublishedService, MapViewerService,
        IconService, HttpService, AuthGuard, MapService, MdIconRegistry, AreaService,
        {
          provide: ActivatedRoute, useValue: {
          params: Observable.of({id: '1'}),
          queryParams: Observable.of({})
        }
        }]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    publishedService = fixture.debugElement.injector.get(PublishedService);
    mapViewerService = fixture.debugElement.injector.get(MapViewerService);
    areaService = fixture.debugElement.injector.get(AreaService);
    socketService = fixture.debugElement.injector.get(SocketService);
    fixture.detectChanges();
  });

  it('should create and draw map', (done: DoneFn) => {
    // given
    console.log(publishedService);
    spyOn(publishedService, 'get').and.returnValue(Observable.of({
      tags: [],
      floor: {
        id: 2,
        imageId: 1,
        scale: {
          realDistance: 100,
          measure: Measure.METERS,
          start: {
            x: 0,
            y: 0
          },
          stop: {
            x: 100,
            y: 100
          }
        }
      }
    }));
    spyOn(mapViewerService, 'drawMap').and.returnValue(new Promise((resolve) => {
      resolve();
    }));
    spyOn(areaService, 'getAllByFloor').and.returnValue(Observable.of([]));
    spyOn(socketService, 'connect').and.returnValue(Observable.of({type: MeasureSocketDataType.COORDINATES}));
    spyOn(socketService, 'send').and.callFake(() => {
    });

    // when
    component.ngOnInit();

    // then
    fixture.whenStable().then(() => {
      expect(component).toBeTruthy();
      expect(publishedService.get).toHaveBeenCalled();
      expect(mapViewerService.drawMap).toHaveBeenCalled();
      expect(areaService.getAllByFloor).toHaveBeenCalled();
      expect(socketService.send).toHaveBeenCalled();
      expect(socketService.connect).toHaveBeenCalled();
      done();
    });
  });
});

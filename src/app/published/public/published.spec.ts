import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PublishedComponent} from './published';
import {SocketService} from '../../utils/socket/socket.service';
import {WebSocketService} from 'angular2-websocket-service';
import {RouterTestingModule} from '@angular/router/testing';
import {PublishedService} from './published.service';
import {MapViewerService} from '../../map/map.viewer.service';
import {IconService} from '../../utils/drawing/icon.service';
import {HttpModule} from '@angular/http';
import {HttpService} from '../../utils/http/http.service';
import {AuthGuard} from '../../auth/auth.guard';
import {MapService} from '../../map/map.service';
import {MdIconRegistry} from '@angular/material';
import {Observable} from 'rxjs/Rx';
import {ActivatedRoute} from '@angular/router';
import {MeasureSocketDataType} from './published.type';
import {TranslateModule} from '@ngx-translate/core';
import {AreaService} from '../../area/area.service';
import {Measure} from '../../map/toolbar/tools/scale/scale.type';

describe('PublishedComponent', () => {
  let component: PublishedComponent;
  let fixture: ComponentFixture<PublishedComponent>;
  let publishedService: PublishedService;
  let mapViewerService: MapViewerService;
  let areaService: AreaService;
  let socketService: SocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublishedComponent],
      imports: [
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
    fixture = TestBed.createComponent(PublishedComponent);
    component = fixture.componentInstance;
    publishedService = fixture.debugElement.injector.get(PublishedService);
    mapViewerService = fixture.debugElement.injector.get(MapViewerService);
    areaService = fixture.debugElement.injector.get(AreaService);
    socketService = fixture.debugElement.injector.get(SocketService);
  });

  it('should create and draw map', (done: DoneFn) => {
    // given
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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {WebSocketService} from 'angular2-websocket-service';
import {RouterTestingModule} from '@angular/router/testing';
import {IconService} from '../../utils/drawing/icon.service';
import {HttpModule} from '@angular/http';
import {HttpService} from '../../utils/http/http.service';
import {AuthGuard} from '../../auth/auth.guard';
import {MapService} from '../../map/map.service';
import {MdIconRegistry} from '@angular/material';
import {AnalyticsComponent} from './analytics';
import {MapViewerService} from '../../map/map.viewer.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {SocketService} from '../../utils/socket/socket.service';
import {PublishedService} from '../publication/published.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {HeatMapBuilder} from './heatmap.service';


describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let publishedService: PublishedService;
  let mapViewerService: MapViewerService;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [AnalyticsComponent],
      imports: [
        HttpModule,
        RouterTestingModule
      ],
      providers: [
        WebSocketService,
        MapViewerService,
        IconService,
        HttpService,
        AuthGuard,
        MapService,
        MdIconRegistry,
        SocketService,
        PublishedService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    publishedService = fixture.debugElement.injector.get(PublishedService);
    mapViewerService = fixture.debugElement.injector.get(MapViewerService);
    activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);
  });

  it('should create component with map', () => {
    // given
    spyOn(publishedService, 'get').and.returnValue(Observable.of({floor: {imageId: 1}}));
    spyOn(mapViewerService, 'drawMap').and.returnValue(new Promise(() => {}));
    activatedRoute.params = Observable.of({'id': '1'});
    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(publishedService.get).toHaveBeenCalled();
    expect(mapViewerService.drawMap).toHaveBeenCalled();;
  });
});

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
import {SocketService} from '../../utils/socket/socket.service';
import {PublishedService} from '../public/published.service';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {MaterialModule} from '@angular/material';
import {TranslateModule, TranslateService} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {SocketConnectorComponent} from '../socket-connector.component';



describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let publishedService: PublishedService;
  let mapViewerService: MapViewerService;
  let activatedRoute: ActivatedRoute;
  let socketService: SocketService;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SocketConnectorComponent, AnalyticsComponent],
      imports: [
        TranslateModule.forRoot(),
        MaterialModule,
        HttpModule,
        RouterTestingModule,
        FormsModule,
      ],
      providers: [
        TranslateService,
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
    socketService = fixture.debugElement.injector.get(SocketService);
    publishedService = fixture.debugElement.injector.get(PublishedService);
    mapViewerService = fixture.debugElement.injector.get(MapViewerService);
    activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);
  });

  it('should create component with map', () => {
    // given
    spyOn(socketService, 'connect').and.returnValue(Observable.of([{}]));
    spyOn(publishedService, 'get').and.returnValue(Observable.of({floor: {imageId: 1}}));
    spyOn(mapViewerService, 'drawMap').and.returnValue(new Promise(() => {}));
    activatedRoute.params = Observable.of({'id': '1'});
    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(publishedService.get).toHaveBeenCalled();
    expect(mapViewerService.drawMap).toHaveBeenCalled();
  });
});

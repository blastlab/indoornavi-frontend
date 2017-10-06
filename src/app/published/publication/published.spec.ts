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

describe('PublishedComponent', () => {
  let component: PublishedComponent;
  let fixture: ComponentFixture<PublishedComponent>;
  let publishedService: PublishedService;
  let mapViewerService: MapViewerService;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PublishedComponent],
      imports: [
        HttpModule,
        RouterTestingModule,
      ],
      providers: [SocketService, WebSocketService, PublishedService, MapViewerService,
        IconService, HttpService, AuthGuard, MapService, MdIconRegistry]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PublishedComponent);
    component = fixture.componentInstance;
    publishedService = fixture.debugElement.injector.get(PublishedService);
    mapViewerService = fixture.debugElement.injector.get(MapViewerService);
    activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);
  });

  it('should create and draw map', () => {
    // given
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

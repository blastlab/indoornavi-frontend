import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {SocketService} from '../../utils/socket/socket.service';
import {WebSocketService} from 'angular2-websocket-service';
import {RouterTestingModule} from '@angular/router/testing';
import {IconService} from '../../utils/drawing/icon.service';
import {HttpModule} from '@angular/http';
import {HttpService} from '../../utils/http/http.service';
import {AuthGuard} from '../../auth/auth.guard';
import {MapService} from '../../map/map.service';
import {MdIconRegistry} from '@angular/material';
import {ActivatedRoute} from '@angular/router';
import {AnalyticsComponent} from './analytics';
import {MapViewerService} from '../../map/map.viewer.service';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HeatMapBuilder} from './heatmap.service';
import {Observable} from 'rxjs/Observable';

describe('AnalyticsComponent', () => {
  let component: AnalyticsComponent;
  let fixture: ComponentFixture<AnalyticsComponent>;
  let heatMapBuilder: HeatMapBuilder;
  let activatedRoute: ActivatedRoute;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ],
      declarations: [AnalyticsComponent],
      imports: [
        HttpModule,
        RouterTestingModule,
      ],
      providers: [SocketService, WebSocketService, AnalyticsComponent, MapViewerService,
        IconService, HttpService, AuthGuard, MapService, MdIconRegistry, HeatMapBuilder]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AnalyticsComponent);
    component = fixture.componentInstance;
    heatMapBuilder = fixture.debugElement.injector.get(HeatMapBuilder);
    activatedRoute = fixture.debugElement.injector.get(ActivatedRoute);
  });

  it('should create and draw canvas', () => {
    // given
    spyOn(heatMapBuilder, 'createHeatGroup').and.returnValue({
      pathLength: 100,
      heatValue: 20,
      radius: 20,
      opacity: 0.5,
      blur: 0.5
      });
    // activatedRoute.params = Observable.of({'id': '1'});

    // when
    component.ngOnInit();

    // then
    expect(component).toBeTruthy();
    expect(heatMapBuilder.createHeatGroup).toHaveBeenCalled();
  });
});

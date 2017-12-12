import {MapViewerService} from './map.editor.service';
import {TestBed, inject} from '@angular/core/testing';
import {Point} from './map.type';
import {MapService} from './map.service';
import {HttpModule} from '@angular/http';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpService} from '../shared/services/http/http.service';
import {AuthGuard} from '../auth/auth.guard';

describe('MapViewerService', () => {

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MapViewerService, MapService, HttpService, AuthGuard],
      imports: [HttpModule, RouterTestingModule]
    });
  });

  it('should be created', inject([MapViewerService], (mapViewerService) => {
    expect(mapViewerService).toBeTruthy();
  }));

  it('should calculate transition', inject([MapViewerService], (mapViewerService) => {
    // given
    // when
    const p1: Point = {
      x: 0,
      y: 0
    };
    const p2: Point = {
      x: 10,
      y: 10
    };
    // then
    expect(mapViewerService.calculateTransition(p1).x).toEqual(0);
    expect(mapViewerService.calculateTransition(p1).y).toEqual(0);
    expect(mapViewerService.calculateTransition(p2).x).toEqual(10);
    expect(mapViewerService.calculateTransition(p2).y).toEqual(10);
  }));
});

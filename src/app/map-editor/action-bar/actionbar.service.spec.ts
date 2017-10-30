import {inject, TestBed} from '@angular/core/testing';

import {ActionBarService} from './actionbar.service';
import {HttpService} from '../../utils/http/http.service';
import {HttpModule} from '@angular/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthGuard} from '../../auth/auth.guard';
import {Floor} from '../../floor/floor.type';
import {Observable} from 'rxjs/Rx';
import {Configuration} from './actionbar.type';
import {Measure, Scale} from '../tool-bar/tools/scale/scale.type';
import {Sink} from '../../device/sink.type';
import {Anchor} from '../../device/anchor.type';

describe('ActionBarService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ActionBarService, HttpService, AuthGuard],
      imports: [HttpModule, RouterTestingModule]
    });
  });

  it('should create component', inject([ActionBarService], (service: ActionBarService) => {
    expect(service).toBeTruthy();
  }));

  it('should create empty configuration and emit event', (done: DoneFn) => {
    inject([ActionBarService, HttpService], (service: ActionBarService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        building: {id: 1, name: '', complexId: 1}
      };
      spyOn(httpService, 'doGet').and.returnValue(Observable.of([]).delay(1000));

      // when
      service.loadConfiguration(floor);

      // then
      service.configurationLoaded().subscribe((configuration: Configuration) => {
        expect(configuration.floorId).toBe(1);
        done();
      });
    })();
  });

  it('should load configuration and emit event', (done: DoneFn) => {
    inject([ActionBarService, HttpService], (service: ActionBarService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        building: {id: 1, name: '', complexId: 1}
      };
      spyOn(httpService, 'doGet').and.returnValue(Observable.of([{
        version: 1,
        floorId: 1,
        data: {
          sinks: [],
          scale: <Scale>{
            start: {
              x: 1,
              y: 2
            },
            stop: {
              x: 1,
              y: 2
            },
            realDistance: 1000,
            measure: Measure.CENTIMETERS
          }
        }
      }]).delay(1000));

      // when
      service.loadConfiguration(floor);

      // then
      service.configurationLoaded().subscribe((configuration: Configuration) => {
        expect(configuration.floorId).toBe(1);
        expect(configuration.version).toBe(1);
        expect(configuration.data.scale).toBeDefined();
        expect(configuration.data.sinks.length).toBe(0);
        done();
      });
    })();
  });

  it('should emit changed event when setting scale', (done: DoneFn) => {
    inject([ActionBarService, HttpService], (service: ActionBarService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        building: {id: 1, name: '', complexId: 1}
      };
      spyOn(httpService, 'doGet').and.returnValue(Observable.of([]).delay(1000));
      spyOn(service, 'configurationChanged').and.callFake(() => {
        return Observable.of({
          data: {
            scale: {
              start: {
                x: 1,
                y: 2
              },
              realDistance: 1000
            }
          }
        });
      });
      service.loadConfiguration(floor);

      service.configurationLoaded().subscribe((_: Configuration) => {
        // when
        setTimeout(() => {
          service.setScale(<Scale>{
            start: {
              x: 1,
              y: 2
            },
            stop: {
              x: 1,
              y: 2
            },
            realDistance: 1000,
            measure: Measure.CENTIMETERS
          });
        }, 1000);

        // then
        service.configurationChanged().subscribe((changedConfiguration: Configuration) => {
          expect(changedConfiguration.data.scale.start.x).toBe(1);
          expect(changedConfiguration.data.scale.start.y).toBe(2);
          expect(changedConfiguration.data.scale.realDistance).toBe(1000);
          done();
        });
      });
    })();
  });

  it('should emit changed event when adding sink', (done: DoneFn) => {
    inject([ActionBarService, HttpService], (service: ActionBarService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        building: {id: 1, name: '', complexId: 1}
      };
      spyOn(httpService, 'doGet').and.returnValue(Observable.of([]).delay(1000));
      spyOn(service, 'configurationChanged').and.callFake(() => {
        return Observable.of({
          data: {
            sinks: [
              {
                shortId: 123,
                anchors: [{
                  shortId: 321
                }]
              }
            ]
          }
        });
      });
      service.loadConfiguration(floor);

      service.configurationLoaded().subscribe((_: Configuration) => {
        // when
        setTimeout(() => {
          service.setSink(<Sink>{
            shortId: 123,
            verified: true,
            anchors: [
              <Anchor>{
                shortId: 321,
                verified: true
              }
            ]
          });
        }, 1000);

        // then
        service.configurationChanged().subscribe((changedConfiguration: Configuration) => {
          expect(changedConfiguration.data.sinks.length).toBe(1);
          expect(changedConfiguration.data.sinks[0].shortId).toBe(123);
          expect(changedConfiguration.data.sinks[0].anchors.length).toBe(1);
          expect(changedConfiguration.data.sinks[0].anchors[0].shortId).toBe(321);
          done();
        });
      });
    })();
  });
});

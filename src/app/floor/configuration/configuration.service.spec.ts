import {inject, TestBed} from '@angular/core/testing';

import {ConfigurationService} from './configuration.service';
import {HttpService} from '../../utils/http/http.service';
import {HttpModule} from '@angular/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthGuard} from '../../auth/auth.guard';
import {Floor} from '../floor.type';
import {Observable} from 'rxjs/Rx';
import {Configuration} from './configuration.type';
import {Measure, Scale} from '../../map/toolbar/tools/scale/scale.type';
import {Sink} from '../../sink/sink.type';
import {Anchor} from '../../anchor/anchor.type';

describe('ConfigurationService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfigurationService, HttpService, AuthGuard],
      imports: [HttpModule, RouterTestingModule]
    });
  });

  it('should create component', inject([ConfigurationService], (service: ConfigurationService) => {
    expect(service).toBeTruthy();
  }));

  it('should create empty configuration and emit event', (done: DoneFn) => {
    inject([ConfigurationService, HttpService], (service: ConfigurationService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        buildingId: 1
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
    inject([ConfigurationService, HttpService], (service: ConfigurationService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        buildingId: 1
      };
      spyOn(httpService, 'doGet').and.returnValue(Observable.of([{
        version: 1,
        floorId: 1,
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
      }]).delay(1000));

      // when
      service.loadConfiguration(floor);

      // then
      service.configurationLoaded().subscribe((configuration: Configuration) => {
        expect(configuration.floorId).toBe(1);
        expect(configuration.version).toBe(1);
        expect(configuration.scale).toBeDefined();
        expect(configuration.sinks.length).toBe(0);
        done();
      });
    })();
  });

  it('should save draft when setting scale', (done: DoneFn) => {
    inject([ConfigurationService, HttpService], (service: ConfigurationService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        buildingId: 1
      };
      spyOn(httpService, 'doPut').and.returnValue(Observable.of({}).delay(1000));
      spyOn(httpService, 'doGet').and.returnValue(Observable.of([]).delay(1000));
      service.loadConfiguration(floor);

      service.configurationLoaded().subscribe((_: Configuration) => {
        // when
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

        // then
        service.configurationChanged().subscribe((changedConfiguration: Configuration) => {
          expect(httpService.doPut).toHaveBeenCalled();
          expect(changedConfiguration.scale.start.x).toBe(1);
          expect(changedConfiguration.scale.start.y).toBe(2);
          expect(changedConfiguration.scale.realDistance).toBe(1000);
          done();
        });
      });
    })();
  });

  it('should save draft when adding sink', (done: DoneFn) => {
    inject([ConfigurationService, HttpService], (service: ConfigurationService, httpService: HttpService) => {
      // given
      const floor: Floor = {
        id: 1,
        level: 0,
        name: '',
        buildingId: 1
      };
      spyOn(httpService, 'doPut').and.returnValue(Observable.of({}).delay(1000));
      spyOn(httpService, 'doGet').and.returnValue(Observable.of([]).delay(1000));
      service.loadConfiguration(floor);

      service.configurationLoaded().subscribe((_: Configuration) => {
        // when
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

        // then
        service.configurationChanged().subscribe((changedConfiguration: Configuration) => {
          expect(httpService.doPut).toHaveBeenCalled();
          expect(changedConfiguration.sinks.length).toBe(1);
          expect(changedConfiguration.sinks[0].shortId).toBe(123);
          expect(changedConfiguration.sinks[0].anchors.length).toBe(1);
          expect(changedConfiguration.sinks[0].anchors[0].shortId).toBe(321);
          done();
        });
      });
    })();
  });
});

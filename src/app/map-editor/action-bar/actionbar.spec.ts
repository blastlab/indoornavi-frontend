import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActionBarComponent} from './actionbar';
import {TranslateModule} from '@ngx-translate/core';
import {ActionBarService} from './actionbar.service';
import {HttpService} from '../../shared/services/http/http.service';
import {HttpModule} from '@angular/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthGuard} from '../../auth/auth.guard';
import {MapLoaderInformerService} from '../../shared/services/map-loader-informer/map-loader-informer.service';
import {Observable} from 'rxjs/Rx';
import {Configuration} from './actionbar.type';
import {Floor} from '../../floor/floor.type';
import {MaterialModule} from '@angular/material';
import {Measure} from '../tool-bar/tools/scale/scale.type';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ButtonModule, TooltipModule} from 'primeng/primeng';

class ConfigurationServiceMock {
  private configuration: Configuration;

  public static saveDraft(): Promise<void> {
    return new Promise<void>(resolve => {
      resolve();
    });
  }

  public configurationChanged(): Observable<Configuration> {
    return Observable.of(this.configuration);
  }

  public configurationLoaded(): Observable<Configuration> {
    return Observable.of(this.configuration);
  }

  public loadConfiguration(_: Floor): Observable<Configuration> {
    return Observable.of(this.configuration);
  }

  public getLatestPublishedConfiguration(): Configuration {
    return {
      version: 0,
      floorId: 1,
      data: {
        sinks: [],
        scale: {
          start: {
            x: 0,
            y: 0
          },
          stop: {
            x: 0,
            y: 0
          },
          realDistance: 0,
          measure: Measure.CENTIMETERS
        }
      },
      publishedDate: new Date().getMilliseconds()
    };
  }
}

describe('ActionBarComponent', () => {
  let component: ActionBarComponent;
  let mapLoader: MapLoaderInformerService;
  let configurationService: ActionBarService;
  let fixture: ComponentFixture<ActionBarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActionBarComponent],
      imports: [
        TranslateModule.forRoot(),
        HttpModule,
        RouterTestingModule,
        MaterialModule,
        BrowserAnimationsModule,
        ButtonModule,
        TooltipModule
      ],
      providers: [
        {provide: ActionBarService, useClass: ConfigurationServiceMock},
        HttpService,
        AuthGuard,
        MapLoaderInformerService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionBarComponent);
    component = fixture.componentInstance;
    mapLoader = fixture.debugElement.injector.get(MapLoaderInformerService);
    configurationService = fixture.debugElement.injector.get(ActionBarService);
    // spyOn((component as any).cd, 'detectChanges');
    spyOn(configurationService, 'configurationLoaded').and.callFake(() => {
      return Observable.of({
        publishedDate: new Date().getMilliseconds()
      });
    });
    // fixture.detectChanges();
  });

  it('should create component ', () => {
    expect(component).toBeTruthy();
  });


});

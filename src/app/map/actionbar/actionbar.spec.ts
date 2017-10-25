import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ActionBarComponent} from './actionbar';
import {TranslateModule} from '@ngx-translate/core';
import {ActionBarService} from './actionbar.service';
import {HttpService} from '../../utils/http/http.service';
import {HttpModule} from '@angular/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthGuard} from '../../auth/auth.guard';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';
import {Observable} from 'rxjs/Rx';
import {Configuration} from './actionbar.type';
import {Floor} from '../../floor/floor.type';
import {MaterialModule} from '@angular/material';
import {DialogTestModule} from '../../utils/dialog/dialog.test';
import {Measure} from '../toolbar/tools/scale/scale.type';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

class ConfigurationServiceMock {
  private configuration: Configuration;

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

  public saveDraft(): Promise<void> {
    return new Promise<void>(resolve => {
      resolve();
    });
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
        DialogTestModule,
        BrowserAnimationsModule
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
    spyOn(configurationService, 'configurationLoaded').and.callFake(() => {
      return Observable.of({
        publishedDate: new Date().getMilliseconds()
      });
    });
    fixture.detectChanges();
  });

  it('should create component ', () => {
    expect(component).toBeTruthy();
  });

  it('should load configuration after map gets loaded', () => {
    // given
    spyOn(configurationService, 'loadConfiguration');

    // when
    component.ngOnInit();
    mapLoader.publishIsLoaded();

    // then
    expect(configurationService.loadConfiguration).toHaveBeenCalled();
  });

  it('should save draft after SAVE_DRAFT_TIMEOUT', (done: DoneFn) => {
    // given
    spyOn(configurationService, 'saveDraft').and.callThrough();

    // when
    component.ngOnInit();
    mapLoader.publishIsLoaded();

    // then
    setTimeout(() => {
      expect(configurationService.configurationLoaded).toHaveBeenCalled();
      expect(configurationService.saveDraft).toHaveBeenCalled();
      done();
    }, ActionBarComponent.SAVE_DRAFT_TIMEOUT);
  });
});

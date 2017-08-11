import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ConfigurationComponent} from './configuration';
import {TranslateModule} from '@ngx-translate/core';
import {ConfigurationService} from './configuration.service';
import {HttpService} from '../../utils/http/http.service';
import {HttpModule} from '@angular/http';
import {RouterTestingModule} from '@angular/router/testing';
import {AuthGuard} from '../../auth/auth.guard';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';
import {Observable} from 'rxjs/Rx';
import {Configuration} from './configuration.type';
import {Floor} from '../floor.type';

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
}

describe('ConfigurationComponent', () => {
  let component: ConfigurationComponent;
  let mapLoader: MapLoaderInformerService;
  let configurationService: ConfigurationService;
  let fixture: ComponentFixture<ConfigurationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigurationComponent],
      imports: [TranslateModule.forRoot(), HttpModule, RouterTestingModule],
      providers: [{
        provide: ConfigurationService,
        useClass: ConfigurationServiceMock
      }, HttpService, AuthGuard, MapLoaderInformerService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationComponent);
    component = fixture.componentInstance;
    mapLoader = fixture.debugElement.injector.get(MapLoaderInformerService);
    configurationService = fixture.debugElement.injector.get(ConfigurationService);
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

  it('should change state of publish button and message span', () => {
    // given
    component.messageSpanState = 'hidden';
    component.publishButtonDisabled = true;

    // when
    component.ngOnInit();

    // then
    expect(component.messageSpanState).toBe('visible');
    expect(component.publishButtonDisabled).toBe(false);
  });
});

import {Injectable} from '@angular/core';
import {HttpService} from '../../shared/services/http/http.service';
import {Configuration, ConfigurationData} from './actionbar.type';
import {Observable} from 'rxjs/Rx';
import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Floor} from '../../floor/floor.type';
import * as Collections from 'typescript-collections';
import {Subject} from 'rxjs/Subject';
import {Md5} from 'ts-md5/dist/md5';
import {Helper} from '../../shared/utils/helper/helper';
import {Area} from '../tool-bar/tools/area/area.type';
import {Sink} from '../../device/device.type';

@Injectable()
export class ActionBarService {
  private static URL: string = 'configurations/';
  private configuration: Configuration;
  private latestPublishedConfiguration: Configuration;
  private configurationLoadedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private configurationChangedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private configurationResetEmitter: Subject<Configuration> = new Subject<Configuration>();
  private loaded = this.configurationLoadedEmitter.asObservable();
  private reset = this.configurationResetEmitter.asObservable();
  private changed = this.configurationChangedEmitter.asObservable();
  private configurationHash: string | Int32Array;

  private static findLatestConfiguration(configurations: Configuration[]): Configuration {
    return configurations.sort((a, b): number => {
      return b.publishedDate - a.publishedDate;
    }).find((configuration: Configuration): boolean => {
      return !!configuration.publishedDate;
    });
  }

  private static compareFn(sink: Sink): string {
    return '' + sink.shortId;
  }

  constructor(private httpService: HttpService) {
  }

  public configurationLoaded(): Observable<Configuration> {
    return this.loaded;
  }

  public configurationReset(): Observable<Configuration> {
    return this.reset;
  }

  public configurationChanged(): Observable<Configuration> {
    return this.changed;
  }

  public getLatestPublishedConfiguration(): Configuration {
    return this.latestPublishedConfiguration;
  }

  public publish(): Observable<ConfigurationData> {
    return this.httpService.doPost(ActionBarService.URL + this.configuration.floorId, {});
  }

  public loadConfiguration(floor: Floor): void {
    this.httpService.doGet(ActionBarService.URL + floor.id).subscribe((configurations: Configuration[]): void => {
      if (configurations.length === 0) {
        this.configuration = <Configuration>{
          floorId: floor.id,
          version: 0,
          publishedDate: new Date().getMilliseconds(),
          data: {
            sinks: [],
            scale: null
          }
        };
        this.latestPublishedConfiguration = this.configuration;
      } else {
        this.configuration = configurations[0];
        if (configurations.length > 1) {
          this.latestPublishedConfiguration = ActionBarService.findLatestConfiguration(configurations);
        } else {
          this.latestPublishedConfiguration = this.configuration;
        }
      }
      this.configurationHash = this.hashConfiguration();
      this.configurationLoadedEmitter.next(this.configuration);
    });
  }

  public saveDraft(): Promise<void> {
    return new Promise<void>((resolve: Function): void => {
      if (this.hashConfiguration() !== this.configurationHash) {
        this.httpService.doPut(ActionBarService.URL, this.configuration).subscribe((): void => {
          this.configurationHash = this.hashConfiguration();
          resolve();
        });
      }
    });
  }

  public undo(): Promise<Configuration> {
    return new Promise<Configuration>((resolve: Function): void => {
      this.httpService.doDelete(ActionBarService.URL + this.configuration.floorId).subscribe((configuration: Configuration): void => {
        this.configuration = configuration;
        this.sendConfigurationResetEvent();
        this.configurationHash = this.hashConfiguration();
        resolve(configuration);
      });
    });
  }

  public setScale(scale: Scale): void {
    this.configuration.data.scale = Helper.deepCopy(scale);
    this.sendConfigurationChangedEvent();
  }

  public setSink(sink: Sink): void {
    const sinks: Collections.Set<Sink> = this.getConfigurationSinks();
    const sinkCopy = {...sink};
    if (sinks.contains(sinkCopy)) {
      sinks.remove(sinkCopy);
    }
    sinks.add(sinkCopy);
    this.configuration.data.sinks = sinks.toArray();
    this.sendConfigurationChangedEvent();
  }

  public setAreas(areas: Area[]): void {
    this.configuration.data.areas = areas;
    this.sendConfigurationChangedEvent();
  }

  private getConfigurationSinks(): Collections.Set<Sink> {
    const sinks = new Collections.Set<Sink>(ActionBarService.compareFn);
    this.configuration.data.sinks.forEach((configurationSink: Sink): void => {
      sinks.add(configurationSink);
    });
    return sinks;
  }

  private hashConfiguration(): string | Int32Array {
    return Md5.hashStr(JSON.stringify(this.configuration));
  }

  private sendConfigurationChangedEvent(): void {
    if (this.hashConfiguration() !== this.configurationHash) {
      this.configurationChangedEmitter.next(this.configuration);
    }
  }

  private sendConfigurationResetEvent(): void {
    this.configurationResetEmitter.next(this.configuration);
  }

}

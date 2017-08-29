import {Injectable} from '@angular/core';
import {HttpService} from '../../utils/http/http.service';
import {Configuration, ConfigurationData} from './configuration.type';
import {Observable} from 'rxjs/Rx';
import {Scale} from '../../map/toolbar/tools/scale/scale.type';
import {Sink} from 'app/sink/sink.type';
import {Floor} from '../floor.type';
import * as Collections from 'typescript-collections';
import {Subject} from 'rxjs/Subject';
import {Md5} from 'ts-md5/dist/md5';

@Injectable()
export class ConfigurationService {
  public static SAVE_DRAFT_ANIMATION_TIME = 500;
  private static URL: string = 'configurations/';
  private configuration: Configuration;
  private configurationLoadedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private configurationChangedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private loaded = this.configurationLoadedEmitter.asObservable();
  private changed = this.configurationChangedEmitter.asObservable();
  private configurationHash: string | Int32Array;

  private static compareFn(sink: Sink): string {
    return '' + sink.shortId;
  }

  constructor(private httpService: HttpService) {
  }

  public configurationLoaded(): Observable<Configuration> {
    return this.loaded;
  }

  public configurationChanged(): Observable<Configuration> {
    return this.changed;
  }

  public loadConfiguration(floor: Floor): void {
    this.httpService.doGet(ConfigurationService.URL + floor.id).subscribe((configurations: Configuration[]) => {
      if (configurations.length === 0) {
        this.configuration = <Configuration>{
          floorId: floor.id,
          version: 0,
          data: {
            sinks: [],
            scale: null
          }
        };
      } else {
        this.configuration = configurations[0];
      }
      this.configurationHash = this.hashConfiguration();
      this.configurationLoadedEmitter.next(this.configuration);
    });
  }

  public publish(): Observable<ConfigurationData> {
    return this.httpService.doPost(ConfigurationService.URL, this.configuration.floorId);
  }

  public setScale(scale: Scale): void {
    this.configuration.data.scale = {...scale};
    this.configurationChangedEmitter.next(this.configuration);
  }

  public setSink(sink: Sink): void {
    const sinks: Collections.Set<Sink> = this.getConfigurationSinks();
    const sinkCopy = {...sink};
    if (sinks.contains(sinkCopy)) {
      sinks.remove(sinkCopy);
    }
    sinks.add(sinkCopy);
    this.configuration.data.sinks = sinks.toArray();
    this.configurationChangedEmitter.next(this.configuration);
  }

  public saveDraft(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.hashConfiguration() !== this.configurationHash) {
        this.httpService.doPut(ConfigurationService.URL, this.configuration).subscribe(() => {
          this.configurationHash = this.hashConfiguration();
          resolve();
        });
      }
    });
  }

  private getConfigurationSinks(): Collections.Set<Sink> {
    const sinks = new Collections.Set<Sink>(ConfigurationService.compareFn);
    this.configuration.data.sinks.forEach((configurationSink: Sink) => {
      sinks.add(configurationSink);
    });
    return sinks;
  }

  private hashConfiguration(): string | Int32Array {
    return Md5.hashStr(JSON.stringify(this.configuration));
  }
}

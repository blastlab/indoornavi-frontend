import {Injectable} from '@angular/core';
import {HttpService} from '../../utils/http/http.service';
import {Configuration} from './configuration.type';
import {Observable} from 'rxjs/Rx';
import {Scale} from '../../map/toolbar/tools/scale/scale.type';
import {Sink} from 'app/sink/sink.type';
import {Floor} from '../floor.type';
import * as Collections from 'typescript-collections';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ConfigurationService {
  public static SAVE_DRAFT_ANIMATION_TIME = 500;
  private static URL: string = 'configurations/';
  private configuration: Configuration;
  private configurationLoadedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private configurationChangedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private loaded = this.configurationLoadedEmitter.asObservable();
  private changed = this.configurationChangedEmitter.asObservable();

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
          sinks: [],
          scale: null,
          version: 0
        };
      } else {
        this.configuration = configurations[0];
      }
      this.configurationLoadedEmitter.next(this.configuration);
    });
  }

  public publish(): Observable<Configuration> {
    return this.httpService.doPost(ConfigurationService.URL, this.configuration);
  }

  public setScale(scale: Scale): void {
    this.configuration.scale = {...scale};
    this.saveDraft();
  }

  public setSink(sink: Sink): void {
    const sinks: Collections.Set<Sink> = this.getConfigurationSinks();
    const sinkCopy = {...sink};
    if (sinks.contains(sinkCopy)) {
      sinks.remove(sinkCopy);
    }
    sinks.add(sinkCopy);
    this.configuration.sinks = sinks.toArray();
    this.saveDraft();
  }

  private saveDraft(): void {
    this.httpService.doPut(ConfigurationService.URL, this.configuration).subscribe(() => {
      this.configurationChangedEmitter.next(this.configuration);
    });
  }

  private getConfigurationSinks(): Collections.Set<Sink> {
    const sinks = new Collections.Set<Sink>(ConfigurationService.compareFn);
    this.configuration.sinks.forEach((configurationSink: Sink) => {
      sinks.add(configurationSink);
    });
    return sinks;
  }
}

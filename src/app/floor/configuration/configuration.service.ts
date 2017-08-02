import {Injectable} from '@angular/core';
import {HttpService} from '../../utils/http/http.service';
import {Configuration} from './configuration.type';
import {Observable} from 'rxjs/Rx';
import {Scale} from '../../map/toolbar/tools/scale/scale.type';
import {Sink} from 'app/sink/sink.type';
import {Md5} from 'ts-md5/dist/md5';
import {Floor} from '../floor.type';
import * as Collections from 'typescript-collections';
import {Subject} from 'rxjs/Subject';
import {Anchor} from '../../anchor/anchor.type';

@Injectable()
export class ConfigurationService {
  private static URL: string = 'configurations/';
  private configuration: Configuration;
  private configurationEmitter: Subject<Configuration> = new Subject<Configuration>();
  private loaded = this.configurationEmitter.asObservable();

  private static compareFn(sink: Sink): string {
    return '' + sink.shortId;
  }

  constructor(private httpService: HttpService) {
  }

  public configurationLoaded(): Observable<Configuration> {
    return this.loaded;
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
      this.configurationEmitter.next(this.configuration);
    });
  }

  public publish(): Observable<Configuration> {
    return this.httpService.doPost(ConfigurationService.URL, this.configuration);
  }

  public saveDraft(): Observable<Configuration> {
    return this.httpService.doPut(ConfigurationService.URL, this.configuration);
  }

  public setScale(scale: Scale): void {
    this.configuration.scale = {...scale};
  }

  public addSink(sink: Sink): void {
    const sinks = this.getConfigurationSinks();
    sinks.setValue(sink, sink.anchors);
    this.configuration.sinks = sinks.keys();
  }

  public addAnchor(sink: Sink, anchor: Anchor) {
    const sinks = this.getConfigurationSinks();
    if (sinks.containsKey(sink)) {
      sinks.getValue(sink).push(anchor);
    }
  }

  public getHashedConfiguration(): string | Int32Array {
    return Md5.hashStr(JSON.stringify(this.configuration));
  }

  private getConfigurationSinks(): Collections.Dictionary<Sink, Anchor[]> {
    const sinks = new Collections.Dictionary<Sink, Anchor[]>(ConfigurationService.compareFn);
    this.configuration.sinks.forEach((configurationSink: Sink) => {
      sinks.setValue(configurationSink, configurationSink.anchors);
    });
    return sinks;
  }
}

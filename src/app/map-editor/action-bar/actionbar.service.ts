import {Injectable} from '@angular/core';
import {HttpService} from '../../utils/http/http.service';
import {Configuration, ConfigurationData} from './actionbar.type';
import {Observable} from 'rxjs/Rx';
import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Sink} from 'app/device/sink.type';
import {Floor} from '../../floor/floor.type';
import * as Collections from 'typescript-collections';
import {Subject} from 'rxjs/Subject';
import {Md5} from 'ts-md5/dist/md5';
import {Helper} from '../../utils/helper/helper';
import {Anchor} from '../../device/anchor.type';

@Injectable()
export class ActionBarService {
  public static SAVE_DRAFT_ANIMATION_TIME = 500;
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
    return configurations.sort((a, b) => {
      return b.publishedDate - a.publishedDate;
    }).find((configuration: Configuration) => {
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

  public loadConfiguration(floor: Floor): void {
    this.httpService.doGet(ActionBarService.URL + floor.id).subscribe((configurations: Configuration[]) => {
      if (configurations.length === 0) {
        this.configuration = <Configuration>{
          floorId: floor.id,
          version: 0,
          publishedDate: new Date().getMilliseconds(),
          data: {
            sinks: [],
            scale: null,
            anchors: []
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

  public publish(): Observable<ConfigurationData> {
    return this.httpService.doPost(ActionBarService.URL + this.configuration.floorId, {});
  }

  public saveDraft(): Promise<void> {
    return new Promise<void>((resolve) => {
      if (this.hashConfiguration() !== this.configurationHash) {
        this.httpService.doPut(ActionBarService.URL, this.configuration).subscribe(() => {
          this.configurationHash = this.hashConfiguration();
          resolve();
        });
      }
    });
  }

  public undo(): Promise<Configuration> {
    return new Promise<Configuration>((resolve) => {
      this.httpService.doDelete(ActionBarService.URL + this.configuration.floorId).subscribe((configuration: Configuration) => {
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

  public removeSink(sink: Sink): void {
    const sinks: Collections.Set<Sink> = this.getConfigurationSinks();
    const sinkCopy = {...sink};
    if (sinks.contains(sinkCopy)) {
      sinks.remove(sinkCopy);
    }
    this.configuration.data.sinks = sinks.toArray();
    this.sendConfigurationChangedEvent();
  }

  private getConfigurationSinks(): Collections.Set<Sink> {
    const sinks = new Collections.Set<Sink>(ActionBarService.compareFn);
    this.configuration.data.sinks.forEach((configurationSink: Sink) => {
      sinks.add(configurationSink);
    });
    return sinks;
  }

  public setAnchor(anchor: Anchor): void {
    const anchors: Collections.Set<Anchor> = this.getConfigurationAnchors();
    const anchorCopy = {...anchor};
    if (anchors.contains(anchorCopy)) {
      anchors.remove(anchorCopy);
    }
    anchors.add(anchorCopy);
    this.configuration.data.anchors = anchors.toArray();
    this.sendConfigurationChangedEvent();
  }

  public removeAnchor(anchor: Anchor): void {
    const anchors: Collections.Set<Anchor> = this.getConfigurationAnchors();
    const anchorCopy = {...anchor};
    if (anchors.contains(anchorCopy)) {
      anchors.remove(anchorCopy);
    }
    this.configuration.data.anchors = anchors.toArray();
    this.sendConfigurationChangedEvent();
  }

  private getConfigurationAnchors(): Collections.Set<Anchor> {
    const anchors = new Collections.Set<Anchor>(ActionBarService.compareFn);
    this.configuration.data.anchors.forEach((configurationAnchor: Anchor) => {
      anchors.add(configurationAnchor);
    });
    return anchors;
  }

  private hashConfiguration(): string | Int32Array {
    return Md5.hashStr(JSON.stringify(this.configuration));
  }

  private sendConfigurationChangedEvent(): void {
    if (this.hashConfiguration() !== this.configurationHash) {
      this.configurationChangedEmitter.next();
    }
  }

  private sendConfigurationResetEvent(): void {
    this.configurationResetEmitter.next(this.configuration);
  }

}
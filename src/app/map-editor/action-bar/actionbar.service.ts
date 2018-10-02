import {Injectable} from '@angular/core';
import {HttpService} from '../../shared/services/http/http.service';
import {Configuration, ConfigurationData} from './actionbar.type';
import {Observable} from 'rxjs/Rx';
import {Scale} from '../tool-bar/tools/scale/scale.type';
import {Floor} from '../../floor/floor.type';
import {Subject} from 'rxjs/Subject';
import {Md5} from 'ts-md5/dist/md5';
import {Helper} from '../../shared/utils/helper/helper';
import {Area} from '../tool-bar/tools/area/area.type';
import {Anchor, Sink} from '../../device/device.type';
import {Line} from '../map.type';

@Injectable()
export class ActionBarService {
  private static URL: string = 'configurations/';
  private configuration: Configuration = null;
  private latestPublishedConfiguration: Configuration;
  private latestConfiguration: Configuration;
  private configurationLoadedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private configurationChangedEmitter: Subject<Configuration> = new Subject<Configuration>();
  private configurationResetEmitter: Subject<Configuration> = new Subject<Configuration>();
  private loaded = this.configurationLoadedEmitter.asObservable();
  private changed = this.configurationChangedEmitter.asObservable();
  private reset = this.configurationResetEmitter.asObservable();
  private configurationHashes: (string | Int32Array)[] = [];

  private static findLatestConfiguration(configurations: Configuration[]): Configuration {
    return configurations.sort((a, b): number => {
      return b.savedDraftDate.getTime() - a.savedDraftDate.getTime();
    }).find((configuration: Configuration): boolean => {
      return !!configuration.publishedDate;
    });
  }

  constructor(private httpService: HttpService) {
  }

  configurationLoaded(): Observable<Configuration> {
    return this.loaded;
  }

  configurationChanged(): Observable<Configuration> {
    return this.changed;
  }

  configurationReset(): Observable<Configuration> {
    return this.reset;
  }

  getLatestPublishedConfiguration(): Configuration {
    return this.latestPublishedConfiguration;
  }

  publish(): Observable<ConfigurationData> {
    return this.httpService.doPost(ActionBarService.URL + this.configuration.floorId, {});
  }

  clear(): void {
    this.configurationHashes.length = 0;
  }

  loadConfiguration(floor: Floor): void {
    this.httpService.doGet(ActionBarService.URL + floor.id).subscribe((configurations: Configuration[]): void => {
      if (configurations.length === 0) {
        this.configuration = (<Configuration>{
          id: null,
          floorId: floor.id,
          version: 0,
          savedDraftDate: null,
          publishedDate: null,
          data: <ConfigurationData>{
            sinks: [],
            scale: null,
            areas: []
          }
        });
        this.latestPublishedConfiguration = null;
        this.latestConfiguration = this.configuration;
      } else {
        this.configuration = configurations[0];
        if (configurations.length > 1) {
          this.latestPublishedConfiguration = ActionBarService.findLatestConfiguration(configurations);
        } else {
          this.latestPublishedConfiguration = null;
        }
        this.latestConfiguration = configurations[configurations.length - 1];
      }
      this.configurationHashes.push(this.hashConfiguration());
      this.configurationLoadedEmitter.next(this.configuration);
    });
  }

  saveDraft(): Promise<void> {
    return new Promise<void>((resolve: Function): void => {
      if (!this.isCurrentConfigurationEqualToPreviousOne()) {
        this.httpService.doPut(ActionBarService.URL, this.configuration).subscribe((): void => {
          this.configurationHashes.push(this.hashConfiguration());
          resolve();
        });
      }
    });
  }

  undo(): Promise<Configuration> {
    return new Promise<Configuration>((resolve: Function): void => {
      this.httpService.doDelete(ActionBarService.URL + this.configuration.floorId).subscribe((configuration: Configuration): void => {
        this.configuration = configuration;
        this.clear();
        this.configurationHashes.push(this.hashConfiguration());
        this.sendConfigurationResetEvent();
        resolve(configuration);
      });
    });
  }

  setScale(scale: Scale): void {
    this.configuration.data.scale = Helper.deepCopy(scale);
    this.sendConfigurationChangedEvent();
  }

  addSink(sink: Sink): void {
    this.configuration.data.sinks.push(sink);
    this.sendConfigurationChangedEvent();
  }

  updateSink(sink: Sink): void {
    const i = this.configuration.data.sinks.findIndex((s: Sink) => {
      return s.shortId === sink.shortId;
    });
    this.configuration.data.sinks[i] = sink;
    this.sendConfigurationChangedEvent();
  }

  addAnchor(sink: Sink, anchor: Anchor): void {
    const i = this.configuration.data.sinks.findIndex((s: Sink) => {
      return s.shortId === sink.shortId;
    });
    this.configuration.data.sinks[i].anchors.push(anchor);
    this.sendConfigurationChangedEvent();
  }

  updateAnchor(anchor: Anchor): void {
    const indexes = this.findAnchorAndSinkIndexes(anchor);
    this.configuration.data.sinks[indexes.sinkIndex].anchors[indexes.anchorIndex] = anchor;
    this.sendConfigurationChangedEvent();
  }

  removeSink(sink: Sink): void {
    const i = this.configuration.data.sinks.findIndex((s: Sink) => {
      return s.shortId === sink.shortId;
    });
    this.configuration.data.sinks.splice(i, 1);
    this.sendConfigurationChangedEvent();
  }

  removeAnchor(anchor: Anchor): void {
    const indexes = this.findAnchorAndSinkIndexes(anchor);

    this.configuration.data.sinks[indexes.sinkIndex].anchors.splice(indexes.anchorIndex, 1);
    this.sendConfigurationChangedEvent();
  }

  setAreas(areas: Area[]): void {
    this.configuration.data.areas = areas;
    this.sendConfigurationChangedEvent();
  }

  addPath(path: Line[]): void {
    this.configuration.data.paths = path;
    this.sendConfigurationChangedEvent();
  }

  clearPath(): void {
    this.configuration.data.paths = [];
    this.sendConfigurationChangedEvent();
  }

  private findAnchorAndSinkIndexes(anchor: Anchor): { sinkIndex: number, anchorIndex: number } {
    const sinkIndex = this.configuration.data.sinks.findIndex((s: Sink) => {
      return s.anchors.findIndex((a: Anchor) => {
        return a.shortId === anchor.shortId;
      }) >= 0;
    });
    const anchorIndex = this.configuration.data.sinks[sinkIndex].anchors.findIndex((a: Anchor) => {
      return a.shortId === anchor.shortId;
    });
    return {
      sinkIndex: sinkIndex,
      anchorIndex: anchorIndex
    }
  }

  private hashConfiguration(): string | Int32Array {
    return Md5.hashStr(JSON.stringify(this.configuration));
  }

  private sendConfigurationChangedEvent(): void {
    this.configurationHashes.push(this.hashConfiguration());

    if (!this.isCurrentConfigurationEqualToPreviousOne()) {
      this.configurationChangedEmitter.next(this.configuration);
    }
  }

  private isCurrentConfigurationEqualToPreviousOne(): boolean {
    const current: string | Int32Array = this.hashConfiguration();
    let previous: string | Int32Array;
    if (this.configurationHashes.length > 1) {
      previous = this.configurationHashes[this.configurationHashes.length - 2];
    }
    if (!previous) {
      return true;
    }
    if (this.configurationHashes.length > 3) {
      this.configurationHashes.shift();
    }
    return current === previous;
  }

  private sendConfigurationResetEvent(): void {
    this.configurationResetEmitter.next(this.configuration);
  }

}

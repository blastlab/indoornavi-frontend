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
import {Area} from '../tool-bar/tools/area/areas.type';
import {Anchor, Sink} from '../../device/device.type';

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
  private configurationHash: string | Int32Array;

  private static findLatestConfiguration(configurations: Configuration[]): Configuration {
    return configurations.sort((a, b): number => {
      return b.savedDraftDate.getTime() - a.savedDraftDate.getTime();
    }).find((configuration: Configuration): boolean => {
      return !!configuration.publishedDate;
    });
  }

  private static parseCoordinatesToIntegers(device: Anchor | Sink): void {
    device.x = Math.round(device.x);
    device.y = Math.round(device.y);
  }

  private static compareDeviceFn(sink: Sink): string {
    return `${sink.shortId}`;
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
            anchors: [],
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
      this.configurationHash = this.hashConfiguration();
      this.configurationLoadedEmitter.next(this.configuration);
    });
  }

  saveDraft(): Promise<void> {
    return new Promise<void>((resolve: Function): void => {
      if (this.hashConfiguration() !== this.configurationHash) {
        this.httpService.doPut(ActionBarService.URL, this.configuration).subscribe((): void => {
          this.configurationHash = this.hashConfiguration();
          resolve();
        });
      }
    });
  }

  undo(): Promise<Configuration> {
    return new Promise<Configuration>((resolve: Function): void => {
      this.httpService.doDelete(ActionBarService.URL + this.configuration.floorId).subscribe((configuration: Configuration): void => {
        this.configuration = configuration;
        this.configurationHash = this.hashConfiguration();
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
    this.configuration.data.sinks.push(Helper.deepCopy(sink));
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
    const indexes = this.findIndexes(anchor);
    console.log(indexes);
    this.configuration.data.sinks[indexes.sinkIndex].anchors[indexes.anchorIndex] = anchor;
    this.sendConfigurationChangedEvent();
  }

  removeSink2(sink: Sink): void {
    const i = this.configuration.data.sinks.findIndex((s: Sink) => {
      return s.shortId === sink.shortId;
    });
    this.configuration.data.sinks.splice(i, 1);
    this.sendConfigurationChangedEvent();
  }

  removeAnchor2(anchor: Anchor): void {
    const indexes = this.findIndexes(anchor);

    this.configuration.data.sinks[indexes.sinkIndex].anchors.splice(indexes.anchorIndex, 1);
    this.sendConfigurationChangedEvent();
  }

  private findIndexes(anchor: Anchor): { sinkIndex: number, anchorIndex: number } {
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

  setSink(sink: Sink): void {
    const sinks: Collections.Set<Sink> = this.getConfigurationSinks();
    const sinkCopy: Sink = {...sink};
    if (sinks.contains(sinkCopy)) {
      sinks.remove(sinkCopy);
    }
    ActionBarService.parseCoordinatesToIntegers(sinkCopy);
    sinkCopy.anchors.forEach((anchor) => {
      ActionBarService.parseCoordinatesToIntegers(anchor);
    });
    sinks.add(sinkCopy);
    this.configuration.data.sinks = Helper.deepCopy(sinks.toArray());
    this.sendConfigurationChangedEvent();
  }

  setAreas(areas: Area[]): void {
    this.configuration.data.areas = areas;
    this.sendConfigurationChangedEvent();
  }

  removeSink(sink: Sink): void {
    const sinks: Collections.Set<Sink> = this.getConfigurationSinks();
    const sinkCopy: Sink = {...sink};
    if (sinks.contains(sinkCopy)) {
      sinks.remove(sinkCopy);
    }
    this.configuration.data.sinks = Helper.deepCopy(sinks.toArray());
    this.sendConfigurationChangedEvent();
  }

  setAnchorInSink(anchor: Anchor, sink: Sink): void {
    const configuredSink: Sink = this.getConfiguredSink(sink);
    const sinkAnchors: Collections.Set<Anchor> = this.getAnchorsInSink(configuredSink);
    const anchorCopy: Anchor = {...anchor};
    if (sinkAnchors.contains(anchorCopy)) {
      sinkAnchors.remove(anchorCopy);
    }
    sinkAnchors.add(anchorCopy);
    configuredSink.anchors = Helper.deepCopy(sinkAnchors.toArray());
    this.setSink(configuredSink);
  }

  removeAnchorFromSink(anchor: Anchor, sink: Sink): void {
    const configuredSink: Sink = this.getConfiguredSink(sink);
    const sinkAnchors: Collections.Set<Anchor> = this.getAnchorsInSink(configuredSink);
    const anchorCopy: Anchor = {...anchor};
    if (sinkAnchors.contains(anchorCopy)) {
      sinkAnchors.remove(anchorCopy);
    }
    configuredSink.anchors = Helper.deepCopy(sinkAnchors.toArray());
    this.setSink(configuredSink);
  }

  setAnchor(anchor: Anchor): void {
    const anchors: Collections.Set<Anchor> = this.getConfigurationAnchors();
    const anchorCopy: Anchor = {...anchor};
    if (anchors.contains(anchorCopy)) {
      anchors.remove(anchorCopy);
    }
    ActionBarService.parseCoordinatesToIntegers(anchorCopy);
    anchors.add(anchorCopy);
    this.configuration.data.anchors = Helper.deepCopy(anchors.toArray());
    this.sendConfigurationChangedEvent();
  }

  removeAnchor(anchor: Anchor): void {
    const anchors: Collections.Set<Anchor> = this.getConfigurationAnchors();
    const anchorCopy: Anchor = {...anchor};
    if (anchors.contains(anchorCopy)) {
      anchors.remove(anchorCopy);
    }
    this.configuration.data.anchors = Helper.deepCopy(anchors.toArray());
    this.sendConfigurationChangedEvent();
  }

  private getConfigurationAnchors(): Collections.Set<Anchor> {
    const anchors: Collections.Set<Anchor> = new Collections.Set<Anchor>(ActionBarService.compareDeviceFn);
    this.configuration.data.anchors.forEach((configurationAnchor: Anchor) => {
      anchors.add(configurationAnchor);
    });
    return anchors;
  }

  private getConfigurationSinks(): Collections.Set<Sink> {
    const sinks: Collections.Set<Sink> = new Collections.Set<Sink>(ActionBarService.compareDeviceFn);
    this.configuration.data.sinks.forEach((configurationSink: Sink): void => {
      sinks.add(configurationSink);
    });
    return sinks;
  }

  private getAnchorsInSink(sink: Sink): Collections.Set<Anchor> {
    const anchorsInSink: Collections.Set<Anchor> = new Collections.Set<Anchor>(ActionBarService.compareDeviceFn);
    sink.anchors.forEach((anchorInSink: Anchor): void => {
      anchorsInSink.add(anchorInSink);
    });
    return anchorsInSink;
  }

  private getConfiguredSink(sink: Sink): Sink {
    return this.getConfigurationSinks().toArray().find((s: Sink) => {
      return s.shortId === sink.shortId;
    });
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

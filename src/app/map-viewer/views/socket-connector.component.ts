import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {
  AreaEventMode,
  CommandType,
  CoordinatesSocketData,
  EventSocketData,
  MeasureSocketData,
  MeasureSocketDataType,
  PublishedMap
} from '../published.type';
import {Subject} from 'rxjs/Subject';
import {PublishedService} from '../published.service';
import {MapViewerService} from '../../map-editor/map.editor.service';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import * as d3 from 'd3';
import {SocketService} from '../../shared/services/socket/socket.service';
import {ActivatedRoute, Params} from '@angular/router';
import {AreaService} from '../../shared/services/area/area.service';
import {IconService, NaviIcons} from '../../shared/services/drawing/icon.service';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {Observable} from 'rxjs/Observable';
import {Tag} from 'app/device/tag.type';
import {Point} from 'app/map-editor/map.type';
import {TranslateService} from '@ngx-translate/core';
import {Config} from '../../../config';
import {ZoomService} from '../../shared/services/zoom/zoom.service';
import {MapLoaderInformerService} from '../../shared/services/map-loader-informer/map-loader-informer.service';
import {MapSvg} from '../../map/map.type';
import {Area} from '../../map-editor/tool-bar/tools/area/area.type';
import {Movable} from '../../shared/wrappers/movable/movable';
import {Scale} from '../../map-editor/tool-bar/tools/scale/scale.type';

@Component({
  templateUrl: './socket-connector.component.html',
  styleUrls: ['./socket-connector.component.css']
})
export class SocketConnectorComponent implements OnInit, AfterViewInit {
  protected socketSubscription: Subscription;
  protected activeMap: PublishedMap;
  protected d3map: d3.selection = null;
  protected pixelsToCentimeters: number;
  private dataReceived = new Subject<CoordinatesSocketData>();
  private transitionEnded = new Subject<number>();
  private tagsOnMap: Dictionary<number, Movable> = new Dictionary<number, Movable>();
  private areasOnMap: Dictionary<number, SvgGroupWrapper> = new Dictionary<number, SvgGroupWrapper>();
  private originListeningOnEvent: Dictionary<string, MessageEvent[]> = new Dictionary<string, MessageEvent[]>();
  private scale: Scale;

  constructor(protected ngZone: NgZone,
              protected socketService: SocketService,
              protected route: ActivatedRoute,
              protected publishedService: PublishedService,
              protected mapLoaderInformer: MapLoaderInformerService,
              private areaService: AreaService,
              private translateService: TranslateService,
              private iconService: IconService,
              private zoomService: ZoomService
              ) {
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');
    this.route.params.subscribe((params: Params) => {
      const mapId = +params['id'];
      this.publishedService.get(mapId).subscribe((map: PublishedMap) => {
        this.activeMap = map;
        if (this.activeMap.floor.imageId != null) {
          this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg) => {
            if (!!this.activeMap.floor.scale) {
              this.scale = new Scale(this.activeMap.floor.scale);
              this.d3map = mapSvg.container;
              this.drawAreas(map.floor.id);
              const realDistanceInCentimeters = this.scale.getRealDistanceInCentimeters();
              const scaleLengthInPixels = Geometry.getDistanceBetweenTwoPoints(map.floor.scale.start, map.floor.scale.stop);
              this.pixelsToCentimeters = realDistanceInCentimeters / scaleLengthInPixels;
              this.initializeSocketConnection();
            }
          });
        }
      });
    });
    this.init();
  }

  ngAfterViewInit(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      this.route.queryParams.subscribe((params: Params) => {
        if (event.origin === window.location.origin) {
          return;
        }
        this.publishedService.checkOrigin(params['api_key'], event.origin).subscribe((verified: boolean) => {
          if (verified) {
            this.handleCommands(event);
          }
        });
      });
    }, false);
  }

  protected init() {
    this.whenDataArrived().subscribe((data: CoordinatesSocketData) => {
      this.handleCoordinatesData(data);
    });
  }

  protected whenDataArrived(): Observable<CoordinatesSocketData> {
    return this.dataReceived.asObservable();
  }

  protected handleCoordinatesData(data: CoordinatesSocketData) {
    const map = d3.select(`#${MapViewerService.MAP_LAYER_SELECTOR_ID}`);
    const coordinates: Point = this.scaleCoordinates(data.coordinates.point),
      deviceId: number = data.coordinates.tagShortId;
    if (!this.isOnMap(deviceId)) {
      const drawBuilder = new DrawBuilder(map, {id: `tag-${deviceId}`, clazz: 'tag'}, this.zoomService);
      const tagOnMap: Movable = (<Movable>drawBuilder
        .createGroup()
        .addIcon({x: 0, y: 0}, this.iconService.getIcon(NaviIcons.TAG))
        .addText({x: 0, y: 36}, `${deviceId}`)
        .place({x: coordinates.x, y: coordinates.y}))
        .setShortId(deviceId);
      this.tagsOnMap.setValue(deviceId, tagOnMap);
    } else {
      this.moveTagOnMap(data);
    }
    if (this.originListeningOnEvent.containsKey('coordinates')) {
      this.originListeningOnEvent.getValue('coordinates').forEach((event: MessageEvent) => {
        event.source.postMessage({type: 'coordinates', coordinates: data}, event.origin);
      })
    }
  }

  protected whenTransitionEnded(): Observable<number> {
    return this.transitionEnded.asObservable();
  }

  protected scaleCoordinates(point: Point): Point {
    return {
      x: point.x / this.pixelsToCentimeters,
      y: point.y / this.pixelsToCentimeters
    };
  }

  private isCoordinatesData(data: MeasureSocketData): boolean {
    return !!this.d3map
      && MeasureSocketDataType[MeasureSocketDataType.COORDINATES] === data.type.toString();
  }

  private isEventData(data: MeasureSocketData): boolean {
    return !!this.d3map
      && MeasureSocketDataType[MeasureSocketDataType.EVENT] === data.type.toString();
  }

  private isOnMap(deviceId: number): boolean {
    return this.tagsOnMap.containsKey(deviceId);
  }

  private extractTagsShortIds() {
    return this.activeMap.tags.map((tag: Tag) => {
      return tag.shortId;
    });
  }

  private moveTagOnMap(data: CoordinatesSocketData) {
    const tag: Movable = this.tagsOnMap.getValue(data.coordinates.tagShortId);
    // !document.hidden is here to avoid queueing transitions and therefore browser freezes
    if (tag.transitionEnded && !document.hidden) {
      tag.move(data.coordinates.point).then(() => {
        this.transitionEnded.next();
      });
    }
  }

  private setSocketConfiguration() {
    this.socketService.send({type: CommandType[CommandType.SET_FLOOR], args: `${this.activeMap.floor.id}`});
    this.socketService.send({type: CommandType[CommandType.SET_TAGS], args: `[${this.extractTagsShortIds()}]`});
  }

  private initializeSocketConnection() {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}measures?client`);
      this.setSocketConfiguration();
      this.socketSubscription = stream.subscribe((data: MeasureSocketData) => {
        this.ngZone.run(() => {
          if (this.isCoordinatesData(data)) {
            this.dataReceived.next(<CoordinatesSocketData> data);
          } else if (this.isEventData(data)) {
            this.handleEventData(<EventSocketData> data);
          }
        });
      });
    });
  };

  private drawAreas(floorId: number): void {
    this.areaService.getAllByFloor(floorId).first().subscribe((areas: Area[]) => {
      areas.forEach((area: Area) => {
        const drawBuilder = new DrawBuilder(this.d3map, {id: `area-${area.id}`, clazz: 'area'}, this.zoomService);
        const areaOnMap = drawBuilder
          .createGroup()
          .addPolygon(area.points);
        areaOnMap.getLastElement(ElementType.POLYGON)
          .style('opacity', Area.getCustomSettings().opacity)
          .style('fill', Area.getCustomSettings().fill);
        this.areasOnMap.setValue(area.id, areaOnMap);
      });
    });
  }

  private handleEventData(data: EventSocketData) {
    const areaOnMap: SvgGroupWrapper = this.areasOnMap.getValue(data.event.areaId);
    if (!!areaOnMap) {
      if (data.event.mode.toString() === AreaEventMode[AreaEventMode.ON_ENTER]) {
        areaOnMap.getGroup().select('polygon').transition().attr('fill', 'red').delay(Movable.TRANSITION_DURATION);
      } else {
        areaOnMap.getGroup().select('polygon').transition().attr('fill', 'grey').delay(Movable.TRANSITION_DURATION);
      }
    }

    if (this.originListeningOnEvent.containsKey('area')) {
      this.originListeningOnEvent.getValue('area').forEach((event: MessageEvent) => {
        setTimeout(() => {
          event.source.postMessage({type: 'area', area: data.event}, event.origin);
        }, Movable.TRANSITION_DURATION);
      });
    }
  }

  private handleCommands(event: MessageEvent) {
    const data = event.data;
    if ('command' in data) {

      switch (data['command']) {

        case 'toggleTagVisibility':
          const tagId = parseInt(data['args'], 10);
          this.socketService.send({type: CommandType[CommandType.TOGGLE_TAG], args: tagId});
          if (this.isOnMap(tagId)) {
            this.tagsOnMap.getValue(tagId).remove();
            this.tagsOnMap.remove(tagId);
          }
          break;
        case 'addEventListener':
          if (this.originListeningOnEvent.containsKey(data['args'])) {
            this.originListeningOnEvent.getValue(data['args']).push(event);
          } else {
            this.originListeningOnEvent.setValue(data['args'], [event]);
          }
          break;
      }
    }
  }
}

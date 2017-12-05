import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';
import {Config} from '../../config';
import {SocketService} from '../shared/services/socket/socket.service';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Params} from '@angular/router';
import {
  AreaEventMode,
  CommandType,
  CoordinatesSocketData,
  EventSocketData,
  MeasureSocketData,
  MeasureSocketDataType,
  PublishedMap
} from './published.type';
import {PublishedService} from './published.service';
import {MapViewerService} from '../map-editor/map.editor.service';
import {IconService, NaviIcons} from 'app/shared/services/drawing/icon.service';
import {DrawBuilder, GroupCreated} from './published.builder';
import * as d3 from 'd3';
import {Point} from '../map-editor/map.type';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {getRealDistanceInCentimeters} from '../map-editor/tool-bar/tools/scale/scale.type';
import {Geometry} from '../shared/utils/helper/geometry';
import {Tag} from '../device/tag.type';
import {AreaService} from '../shared/services/area/area.service';
import {Area} from '../shared/services/area/area.type';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: './published.html',
  styleUrls: ['./published.css']
})
export class PublishedComponent implements OnInit, AfterViewInit {
  private socketSubscription: Subscription;
  private activeMap: PublishedMap;
  private d3map: d3.selection = null;
  private tagsOnMap: Dictionary<number, GroupCreated> = new Dictionary<number, GroupCreated>();
  private areasOnMap: Dictionary<number, GroupCreated> = new Dictionary<number, GroupCreated>();
  private originListeningOnEvent: Dictionary<string, MessageEvent[]> = new Dictionary<string, MessageEvent[]>();
  private pixelsToCentimeters: number;

  constructor(private ngZone: NgZone,
              private socketService: SocketService,
              private route: ActivatedRoute,
              private publishedService: PublishedService,
              private mapViewerService: MapViewerService,
              private iconService: IconService,
              private areaService: AreaService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');
    this.route.params.subscribe((params: Params) => {
      const mapId = +params['id'];
      this.publishedService.get(mapId).subscribe((map: PublishedMap) => {
        this.activeMap = map;
        if (this.activeMap.floor.imageId != null) {
          this.mapViewerService.drawMap(this.activeMap.floor).then((d3map: d3.selection) => {
            this.d3map = d3map;
            this.drawAreas(map.floor.id);
            const realDistanceInCentimeters = getRealDistanceInCentimeters(this.activeMap.floor.scale);
            const pixels = Geometry.getDistanceBetweenTwoPoints(map.floor.scale.start, map.floor.scale.stop);
            this.pixelsToCentimeters = realDistanceInCentimeters / pixels;
            this.initializeSocketConnection();
          });
        }
      });
    });
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

  private handleCoordinatesData(data: CoordinatesSocketData) {
    const coordinates: Point = this.scaleCoordinates(data.coordinates.point),
      deviceId: number = data.coordinates.tagShortId;
    if (!this.isOnMap(deviceId)) {
      const drawBuilder = new DrawBuilder(this.d3map, {id: `tag-${deviceId}`, clazz: 'tag'});
      const tagOnMap = drawBuilder
        .createGroup()
        .addIcon({x: 0, y: 0}, this.iconService.getIcon(NaviIcons.TAG))
        .addText({x: 0, y: 36}, `${deviceId}`)
        .place({x: coordinates.x, y: coordinates.y});
      this.tagsOnMap.setValue(deviceId, tagOnMap);
    } else {
      this.tagsOnMap.getValue(deviceId).move(coordinates);
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
            this.handleCoordinatesData(<CoordinatesSocketData> data);
          } else if (this.isEventData(data)) {
            this.handleEventData(<EventSocketData> data);
          }
        });
      });
    });
  };

  private scaleCoordinates(point: Point): Point {
    return {
      x: point.x / this.pixelsToCentimeters,
      y: point.y / this.pixelsToCentimeters
    };
  }

  private drawAreas(floorId: number): void {
    const settings = new Map<string, string>();
    settings.set('opacity', '0.3');
    settings.set('fill', 'grey');
    this.areaService.getAllByFloor(floorId).subscribe((areas: Area[]) => {
      areas.forEach((area: Area) => {
        const drawBuilder = new DrawBuilder(this.d3map, {id: `area-${area.id}`, clazz: 'area'});
        const scaledPoints = area.buffer.map((point: Point) => {
          return this.scaleCoordinates(point);
        });
        const areaOnMap = drawBuilder
          .createGroup()
          .addPolygon(scaledPoints, settings);
        this.areasOnMap.setValue(area.id, areaOnMap);
      });
    });
  }

  private handleEventData(data: EventSocketData) {
    const areaOnMap: GroupCreated = this.areasOnMap.getValue(data.event.areaId);
    if (!!areaOnMap) {
      if (data.event.mode.toString() === AreaEventMode[AreaEventMode.ON_ENTER]) {
        areaOnMap.group.select('polygon').transition().attr('fill', 'red').delay(1000);
      } else {
        areaOnMap.group.select('polygon').transition().attr('fill', 'grey').delay(1000);
      }
    }

    if (this.originListeningOnEvent.containsKey('area')) {
      this.originListeningOnEvent.getValue('area').forEach((event: MessageEvent) => {
        setTimeout(() => {
          event.source.postMessage({type: 'area', area: data.event}, event.origin);
        }, 1000);
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

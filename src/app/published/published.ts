import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';
import {Config} from '../../config';
import {SocketService} from '../utils/socket/socket.service';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Params} from '@angular/router';
import {CommandType, MeasureSocketData, MeasureSocketDataType, PublishedMap} from './published.type';
import {PublishedService} from './published.service';
import {MapViewerService} from '../map/map.viewer.service';
import {IconService, NaviIcons} from 'app/utils/drawing/icon.service';
import {DrawBuilder, GroupCreated} from '../utils/builder/draw.builder';
import * as d3 from 'd3';
import {Point} from '../map/map.type';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {Measure} from '../map/toolbar/tools/scale/scale.type';
import {Geometry} from '../map/utils/geometry';
import {Tag} from '../device/tag.type';

@Component({
  templateUrl: './published.html',
  styleUrls: ['./published.css']
})
export class PublishedComponent implements OnInit, AfterViewInit {
  private socketSubscription: Subscription;
  private activeMap: PublishedMap;
  private d3map: d3.selection = null;
  private tagsOnMap: Dictionary<number, GroupCreated> = new Dictionary<number, GroupCreated>();
  private pixelsToCentimeters: number;

  constructor(private ngZone: NgZone,
              private socketService: SocketService,
              private route: ActivatedRoute,
              private publishedService: PublishedService,
              private mapViewerService: MapViewerService,
              private iconService: IconService) {
  }

  ngOnInit() {
    this.route.params.subscribe((params: Params) => {
      const mapId = +params['id'];
      this.publishedService.get(mapId).subscribe((map: PublishedMap) => {
        this.activeMap = map;
        if (this.activeMap.floor.imageId != null) {
          this.mapViewerService.drawMap(this.activeMap.floor).then((d3map: d3.selection) => {
            this.d3map = d3map;
            const realDistanceInCentimeters = map.floor.scale.realDistance * (map.floor.scale.measure.toString() === Measure[Measure.METERS] ? 100 : 1);
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
            if ('command' in event.data && event.data['command'] === 'toggleTagVisibility') {
              const tagId = parseInt(event.data['args'], 10);
              this.socketService.send({type: CommandType[CommandType.TOGGLE_TAG], args: tagId});
              if (this.isOnMap(tagId)) {
                this.tagsOnMap.getValue(tagId).remove();
                this.tagsOnMap.remove(tagId);
              }
            }
          }
        });
      });
    }, false);
  }

  private isCoordinatesData(data: MeasureSocketData): boolean {
    return this.d3map !== null
      && MeasureSocketDataType[MeasureSocketDataType.COORDINATES] === data.type.toString();
  }

  private isOnMap(deviceId: number): boolean {
    return this.tagsOnMap.containsKey(deviceId);
  }

  private extractTagsShortIds() {
    return this.activeMap.tags.map((tag: Tag) => {
      return tag.shortId;
    });
  }

  private handleCoordinatesData(data: MeasureSocketData) {
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
            this.handleCoordinatesData(data);
          }
        });
      });
    });
  };

  private scaleCoordinates(point: Point): Point {
    return {
      x: point.x * this.pixelsToCentimeters,
      y: point.y * this.pixelsToCentimeters
    };
  }
}

import {Component, NgZone, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {ActivatedRoute, Params} from '@angular/router';
import * as d3 from 'd3';
import {CommandType, MeasureSocketData, MeasureSocketDataType, PublishedMap} from './public/published.type';
import {SocketService} from '../utils/socket/socket.service';
import {PublishedService} from 'app/published/public/published.service';
import {MapViewerService} from '../map/map.viewer.service';
import {Geometry} from '../map/utils/geometry';
import {Measure, scaleCoordinates} from '../map/toolbar/tools/scale/scale.type';
import {Tag} from '../device/tag.type';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {Subject} from 'rxjs/Subject';
import {Observable} from 'rxjs/Observable';
import {IconService, NaviIcons} from '../utils/drawing/icon.service';
import {DrawBuilder, GroupCreated} from './public/published.builder';
import {Point} from '../map/map.type';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';


@Component({
  templateUrl: './socket-connector.component.html',
  styleUrls: ['./socket-connector.component.css']
})
export class SocketConnectorComponent implements OnInit{
  protected socketSubscription: Subscription;
  protected activeMap: PublishedMap;
  protected d3map: d3.selection = null;
  protected pixelsToCentimeters: number;
  private dataReceived = new Subject<MeasureSocketData>();
  private tagsOnMap: Dictionary<number, GroupCreated> = new Dictionary<number, GroupCreated>();

  constructor(private ngZone: NgZone,
              protected socketService: SocketService,
              protected route: ActivatedRoute,
              protected publishedService: PublishedService,
              private mapViewerService: MapViewerService,
              private translateService: TranslateService,
              private iconService: IconService) {
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
            const realDistanceInCentimeters = map.floor.scale.realDistance * (map.floor.scale.measure.toString() === Measure[Measure.METERS] ? 100 : 1);
            const pixels = Geometry.getDistanceBetweenTwoPoints(map.floor.scale.start, map.floor.scale.stop);
            this.pixelsToCentimeters = realDistanceInCentimeters / pixels;
            this.initializeSocketConnection();
          });
        }
      });
    });
    this.init();
  }
  protected init() {
    this.whenDataArrived().subscribe((data: MeasureSocketData) => {
      this.handleCoordinatesData(data, this.d3map);
    });
  }

  protected whenDataArrived(): Observable<MeasureSocketData> {
    return this.dataReceived.asObservable();
  }

  private isCoordinatesData(data: MeasureSocketData): boolean {
    return this.d3map !== null
      && MeasureSocketDataType[MeasureSocketDataType.COORDINATES] === data.type.toString();
  }

  private extractTagsShortIds() {
    return this.activeMap.tags.map((tag: Tag) => {
      return tag.shortId;
    });
  }

  private setSocketConfiguration() {
    this.socketService.send({type: CommandType[CommandType.SET_FLOOR], args: `${this.activeMap.floor.id}`});
    this.socketService.send({type: CommandType[CommandType.SET_TAGS], args: `[${this.extractTagsShortIds()}]`});
  }

  public initializeSocketConnection() {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}measures?client`);
      this.setSocketConfiguration();
      this.socketSubscription = stream.subscribe((data: MeasureSocketData) => {
        this.ngZone.run(() => {
          if (this.isCoordinatesData(data)) {
            this.dataReceived.next(data);
          }
        });
      });
    });
  }

  protected handleCoordinatesData(data: MeasureSocketData, d3map: d3.selection) {
    const coordinates: Point = scaleCoordinates(data.coordinates.point, this.pixelsToCentimeters),
      deviceId: number = data.coordinates.tagShortId;
    if (!this.isOnMap(deviceId)) {
      const drawBuilder = new DrawBuilder(d3map, {id: `tag-${deviceId}`, clazz: 'tag'});
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

  protected isOnMap(deviceId: number): boolean {
    return this.tagsOnMap.containsKey(deviceId);
  }

  removeTagFromMap(tagId: number) {
    this.tagsOnMap.getValue(tagId).remove();
    this.tagsOnMap.remove(tagId);
  }
}

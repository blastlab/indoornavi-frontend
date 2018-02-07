import {AfterViewInit, Component, NgZone, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {AreaEventMode, CommandType, CoordinatesSocketData, EventSocketData, MeasureSocketData, MeasureSocketDataType} from '../published.type';
import {Subject} from 'rxjs/Subject';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import {SocketService} from '../../shared/services/socket/socket.service';
import {ActivatedRoute, Params} from '@angular/router';
import {PublishedService} from '../published.service';
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
import {FloorService} from '../../floor/floor.service';
import {Floor} from '../../floor/floor.type';
import {TagVisibilityTogglerService} from '../../shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {TagToggle} from '../../shared/components/tag-visibility-toggler/tag-toggle.type';

@Component({
  templateUrl: './socket-connector.component.html',
  styleUrls: ['./socket-connector.component.css']
})
export class SocketConnectorComponent implements OnInit, AfterViewInit {
  protected socketSubscription: Subscription;
  protected d3map: MapSvg = null;
  protected scale: Scale;
  private dataReceived = new Subject<CoordinatesSocketData>();
  private transitionEnded = new Subject<number>();
  private tagsOnMap: Dictionary<number, Movable> = new Dictionary<number, Movable>();
  private areasOnMap: Dictionary<number, SvgGroupWrapper> = new Dictionary<number, SvgGroupWrapper>();
  private originListeningOnEvent: Dictionary<string, MessageEvent[]> = new Dictionary<string, MessageEvent[]>();
  private floor: Floor;
  private tags: Tag[] = [];

  constructor(protected ngZone: NgZone,
              protected socketService: SocketService,
              protected route: ActivatedRoute,
              protected publishedService: PublishedService,
              protected mapLoaderInformer: MapLoaderInformerService,
              private areaService: AreaService,
              private translateService: TranslateService,
              private iconService: IconService,
              private zoomService: ZoomService,
              private floorService: FloorService,
              private tagTogglerService: TagVisibilityTogglerService) {
  }

  ngOnInit(): void {
    this.translateService.setDefaultLang('en');
    this.route.params.subscribe((params: Params) => {
      const floorId = +params['id'];
      this.floorService.getFloor(floorId).subscribe((floor: Floor) => {
        this.floor = floor;
        if (floor.imageId != null) {
          this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg) => {
            this.d3map = mapSvg;
            this.publishedService.getTagsAvailableForUser(floor.id).subscribe((tags: Tag[]) => {
              this.tags = tags;
              this.tagTogglerService.setTags(tags);
              if (!!floor.scale) {
                this.scale = new Scale(this.floor.scale);
                this.drawAreas(floor.id);
                this.initializeSocketConnection();
              }
            });
          });
        }
      });
    });
    this.init();
  }

  ngAfterViewInit(): void {
    window.addEventListener('message', (event: MessageEvent): void => {
      this.route.queryParams.subscribe((params: Params) => {
        if (event.origin === window.location.origin) {
          return;
        }
        this.publishedService.checkOrigin(params['api_key'], event.origin).subscribe((verified: boolean): void => {
          if (verified) {
            this.handleCommands(event);
          }
        });
      });
    }, false);
  }

  protected init(): void {
    this.whenDataArrived().subscribe((data: CoordinatesSocketData): void => {
      this.handleCoordinatesData(data);
    });
  }

  protected whenDataArrived(): Observable<CoordinatesSocketData> {
    return this.dataReceived.asObservable();
  }

  protected handleCoordinatesData(data: CoordinatesSocketData): void {
    const deviceId: number = data.coordinates.tagShortId;
    if (!this.isOnMap(deviceId)) {
      const drawBuilder = new DrawBuilder(this.d3map.container, {id: `tag-${deviceId}`, clazz: 'tag'}, this.zoomService);
      const tagOnMap: SvgGroupWrapper = drawBuilder
        .createGroup()
        .addIcon({x: 0, y: 0}, this.iconService.getIcon(NaviIcons.TAG))
        .addText({x: 0, y: 36}, `${deviceId}`)
        .place({x: data.coordinates.point.x, y: data.coordinates.point.y});
      this.tagsOnMap.setValue(deviceId, new Movable(tagOnMap).setShortId(deviceId));
    } else {
      this.moveTagOnMap(data.coordinates.point, deviceId);
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

  private extractTagsShortIds(): number[] {
    return this.tags.map((tag: Tag): number => {
      return tag.shortId;
    });
  }

  private moveTagOnMap(coordinates: Point, deviceId: number): void {
    const tag: Movable = this.tagsOnMap.getValue(deviceId);
    // !document.hidden is here to avoid queueing transitions and therefore browser freezes
    if (tag.transitionEnded && !document.hidden) {
      tag.move(coordinates).then(() => {
        this.transitionEnded.next(deviceId);
      });
    }
  }

  private setSocketConfiguration(): void {
    this.socketService.send({type: CommandType[CommandType.SET_FLOOR], args: `${this.floor.id}`});
    this.socketService.send({type: CommandType[CommandType.SET_TAGS], args: `[${this.extractTagsShortIds()}]`});
  }

  private initializeSocketConnection(): void {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}measures?client`);
      this.setSocketConfiguration();
      this.tagTogglerService.onToggleTag().subscribe((tagToggle: TagToggle) => {
        this.socketService.send({type: CommandType[CommandType.TOGGLE_TAG], args: tagToggle.tag.shortId});
      });

      this.socketSubscription = stream.subscribe((data: MeasureSocketData) => {
        this.ngZone.run(() => {
          if (this.isCoordinatesData(data)) {
            const coordinateSocketData: CoordinatesSocketData = (<CoordinatesSocketData>data);
            coordinateSocketData.coordinates.point = Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
              this.scale.getRealDistanceInCentimeters(),
              coordinateSocketData.coordinates.point);
            this.dataReceived.next(coordinateSocketData);
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
        const drawBuilder = new DrawBuilder(this.d3map.container, {id: `area-${area.id}`, clazz: 'area'}, this.zoomService);
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

  private handleEventData(data: EventSocketData): void {
    const areaOnMap: SvgGroupWrapper = this.areasOnMap.getValue(data.event.areaId);
    if (!!areaOnMap) {
      if (data.event.mode.toString() === AreaEventMode[AreaEventMode.ON_ENTER]) {
        console.log(areaOnMap.getGroup().select('polygon'));
        areaOnMap.getGroup().select('polygon').transition().style('fill', 'red').delay(Movable.TRANSITION_DURATION);
      } else {
        console.log(areaOnMap.getGroup().select('polygon'));
        areaOnMap.getGroup().select('polygon').transition().style('fill', 'grey').delay(Movable.TRANSITION_DURATION);
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

  private handleCommands(event: MessageEvent): void {
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

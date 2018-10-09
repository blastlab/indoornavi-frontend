import {AfterViewInit, Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {AreaEventMode, CommandType, CoordinatesSocketData, CustomMessageEvent, EventSocketData, MeasureSocketData, MeasureSocketDataType} from '../publication.type';
import {Subject} from 'rxjs/Subject';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {DrawBuilder, ElementType, SvgGroupWrapper} from '../../shared/utils/drawing/drawing.builder';
import {SocketService} from '../../shared/services/socket/socket.service';
import {ActivatedRoute, Params} from '@angular/router';
import {PublishedService} from '../publication.service';
import {AreaService} from '../services/area/area.service';
import {IconService} from '../../shared/services/drawing/icon.service';
import {Geometry} from 'app/shared/utils/helper/geometry';
import {Observable} from 'rxjs/Observable';
import {Line, Point, Point3d} from 'app/map-editor/map.type';
import {TranslateService} from '@ngx-translate/core';
import {Config} from '../../../config';
import {MapLoaderInformerService} from '../../shared/services/map-loader-informer/map-loader-informer.service';
import {MapSvg} from '../../map/map.type';
import {Area} from '../../map-editor/tool-bar/tools/area/area.type';
import {Scale, ScaleCalculations} from '../../map-editor/tool-bar/tools/scale/scale.type';
import {ApiService} from '../../shared/utils/drawing/api.service';
import {FloorService} from '../../floor/floor.service';
import {Floor} from '../../floor/floor.type';
import {TagVisibilityTogglerService} from '../../shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {TagToggle} from '../../shared/components/tag-visibility-toggler/tag-toggle.type';
import {Tag} from '../../device/device.type';
import {BreadcrumbService} from '../../shared/services/breadcrumbs/breadcrumb.service';
import {SvgAnimator} from '../../shared/utils/drawing/animator';
import {MapClickService} from '../../shared/services/map-click/map-click.service';
import {Deferred} from '../../shared/utils/helper/deferred';
import {TagOnMap} from '../../map/models/tag';
import {APIObject} from '../../shared/utils/drawing/api.types';
import {PathService} from '../services/path/path.service';
import {Complex} from '../../complex/complex.type';
import {ComplexService} from '../../complex/complex.service';
import {NavigationController} from '../../shared/utils/navigation/navigation.controller';
import Metadata = APIObject.Metadata;

@Component({
  templateUrl: './socket-connector.component.html'
})
export class SocketConnectorComponent implements OnInit, OnDestroy, AfterViewInit {
  public floor: Floor;
  protected socketSubscription: Subscription;
  protected d3map: MapSvg = null;
  protected scale: Scale;
  protected tagsOnMap: Dictionary<number, TagOnMap> = new Dictionary<number, TagOnMap>();
  private dataReceived = new Subject<CoordinatesSocketData>();
  private transitionEnded = new Subject<number>();
  private areasOnMap: Dictionary<number, SvgGroupWrapper> = new Dictionary<number, SvgGroupWrapper>();
  private originListeningOnEvent: Dictionary<string, MessageEvent[]> = new Dictionary<string, MessageEvent[]>();
  private originListeningOnClickMapEvent: Array<MessageEvent> = [];
  protected tags: Tag[] = [];
  protected visibleTags: Map<number, boolean> = new Map();
  protected scaleCalculations: ScaleCalculations;
  protected loadMapDeferred: Deferred<boolean>;
  protected subscriptionDestructor: Subject<void> = new Subject<void>();

  constructor(protected ngZone: NgZone,
              protected socketService: SocketService,
              protected route: ActivatedRoute,
              protected publishedService: PublishedService,
              protected mapLoaderInformer: MapLoaderInformerService,
              protected mapClick: MapClickService,
              private areaService: AreaService,
              private pathService: PathService,
              private translateService: TranslateService,
              private iconService: IconService,
              private mapObjectService: ApiService,
              private complexService: ComplexService,
              private navigationController: NavigationController,
              protected floorService: FloorService,
              protected tagToggleService: TagVisibilityTogglerService,
              protected breadcrumbService: BreadcrumbService) {

    this.loadMapDeferred = new Deferred<boolean>();
  }

  ngOnInit(): void {
    this.setCorrespondingFloorParams();
    this.translateService.setDefaultLang('en');
    this.subscribeToMapParametersChange();
    this.init();
  }

  ngOnDestroy(): void {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor.unsubscribe();
  }

  protected setCorrespondingFloorParams(): void {
    this.route.params.takeUntil(this.subscriptionDestructor)
      .subscribe((params: Params) => {
        const floorId = +params['id'];
        this.floorService.getFloor(floorId).takeUntil(this.subscriptionDestructor).subscribe((floor: Floor): void => {
          this.breadcrumbService.publishIsReady([
            {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
            {
              label: floor.building.complex.name,
              routerLink: `/complexes/${floor.building.complex.id}/buildings`,
              routerLinkActiveOptions: {exact: true}
            },
            {
              label: floor.building.name,
              routerLink: `/complexes/${floor.building.complex.id}/buildings/${floor.building.id}/floors`,
              routerLinkActiveOptions: {exact: true}
            },
            {label: `${(floor.name.length ? floor.name : floor.level)}`, disabled: true}
          ]);
        });
      });
  }

  protected subscribeToMapParametersChange() {
    this.route.params.takeUntil(this.subscriptionDestructor).subscribe((params: Params): void => {
      const floorId = +params['id'];
      this.floorService.getFloor(floorId).takeUntil(this.subscriptionDestructor).subscribe((floor: Floor): void => {
        this.floor = floor;
        if (!!floor.scale) {
          this.scale = new Scale(this.floor.scale);
          this.scaleCalculations = {
            scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
            scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
          };
        }
        if (!!floor.imageId) {
          this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg) => {
            this.d3map = mapSvg;
            this.loadMapDeferred.resolve();
            this.publishedService.getTagsAvailableForUser(floor.id).takeUntil(this.subscriptionDestructor).subscribe((tags: Tag[]): void => {
              this.tags = tags;
              this.tags.forEach((tag: Tag) => {
                this.visibleTags.set(tag.shortId, true);
              });
              this.tagToggleService.setTags(tags);
              if (!!floor.scale) {
                this.drawAreas(floor.id);
                this.initializeSocketConnection();
              }
            });
          });
        }
      });
    });
  }

  ngAfterViewInit(): void {
    window.addEventListener('message', (event: MessageEvent): void => {
      this.route.queryParams.takeUntil(this.subscriptionDestructor).subscribe((params: Params): void => {
        if (event.origin === window.location.origin) {
          return;
        }
        this.publishedService.checkOrigin(params['api_key'], event.origin).takeUntil(this.subscriptionDestructor)
          .subscribe((verified: boolean): void => {
          // if (verified && !!this.scale) {
          this.handleCommands(event);
          // } else {
          //   event.source.postMessage({type: 'error', message: 'Origin not verified. Make sure you use your own API KEY.'}, '*');
          // }
        });
      });
    }, false);
  }

  protected init(): void {
    this.whenDataArrived().takeUntil(this.subscriptionDestructor).subscribe((data: CoordinatesSocketData): void => {
      this.handleCoordinatesData(data);
    });
    this.subscribeToMapClick();
  }

  protected whenDataArrived(): Observable<CoordinatesSocketData> {
    return this.dataReceived.asObservable();
  }

  protected handleCoordinatesData(data: CoordinatesSocketData): void {
    const deviceId: number = data.coordinates.tagShortId;
    if (!this.isOnMap(deviceId) && this.visibleTags.get(deviceId)) {
      const tagOnMap: TagOnMap = new TagOnMap(data.coordinates.point, this.d3map.container, {
        id: `tag-${deviceId}`,
        clazz: 'tag',
        name: `${deviceId}`
      });
      SvgAnimator.startBlinking(tagOnMap.getIconElement());
      this.tagsOnMap.setValue(deviceId, tagOnMap.setShortId(deviceId));
    } else if (this.visibleTags.get(deviceId)) {
      this.moveTagOnMap(data.coordinates.point, deviceId);
    }
    if (this.originListeningOnEvent.containsKey('coordinates')) {
      this.originListeningOnEvent.getValue('coordinates').forEach((event: MessageEvent): void => {
        const point2d: Point = Geometry.calculatePointPositionInCentimeters(
          this.scaleCalculations.scaleLengthInPixels,
          this.scaleCalculations.scaleInCentimeters,
          data.coordinates.point
        );
        data.coordinates.point.x = point2d.x;
        data.coordinates.point.y = point2d.y;
        // @ts-ignore
        event.source.postMessage({type: 'coordinates', coordinates: data.coordinates}, '*');
      })
    }
    this.removeNotVisibleTags();
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

  private moveTagOnMap(coordinates: Point3d, deviceId: number): void {
    const tag: TagOnMap = this.tagsOnMap.getValue(deviceId);
    // !document.hidden is here to avoid queueing transitions and therefore browser freezes
    if (tag.hasTransitionEnded() && !document.hidden) {
      tag.move(coordinates).then(() => {
        this.transitionEnded.next(deviceId);
      });
    }
  }

  private setSocketConfiguration(): void {
    this.socketService.send({type: CommandType[CommandType.SET_FLOOR], args: `${this.floor.id}`});
    this.socketService.send({type: CommandType[CommandType.SET_TAGS], args: `[${this.extractTagsShortIds()}]`});
  }

  protected initializeSocketConnection(): void {
    this.ngZone.runOutsideAngular((): void => {
      const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}measures?client`);
      this.setSocketConfiguration();
      this.tagToggleService.onToggleTag().takeUntil(this.subscriptionDestructor).subscribe((tagToggle: TagToggle) => {
        this.socketService.send({type: CommandType[CommandType.TOGGLE_TAG], args: tagToggle.tag.shortId});
        this.visibleTags.set(tagToggle.tag.shortId, tagToggle.selected);
        if (!tagToggle.selected) {
          this.removeNotVisibleTags();
        }
      });
      this.socketSubscription = stream.takeUntil(this.subscriptionDestructor).subscribe((data: MeasureSocketData): void => {
        this.ngZone.run(() => {
          if (this.isCoordinatesData(data)) {
            const coordinateSocketData: CoordinatesSocketData = (<CoordinatesSocketData>data);
            const point2d: Point = Geometry.calculatePointPositionInPixels(Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
              this.scale.getRealDistanceInCentimeters(),
              coordinateSocketData.coordinates.point);
            coordinateSocketData.coordinates.point.x = point2d.x;
            coordinateSocketData.coordinates.point.y = point2d.y;
            this.dataReceived.next(coordinateSocketData);
          } else if (this.isEventData(data)) {
            this.handleEventData(<EventSocketData> data);
          }
        });
      });
    });
  };

  private removeNotVisibleTags(): void {
    this.visibleTags.forEach((value: boolean, key: number): void => {
      if (!value && this.isOnMap(key)) {
        this.tagsOnMap.getValue(key).remove();
        this.tagsOnMap.remove(key);
      }
    });
  }

  protected drawAreas(floorId: number): void {
    this.areaService.getAllByFloor(floorId).first().subscribe((areas: Area[]): void => {
      areas.forEach((area: Area) => {
        const drawBuilder: DrawBuilder = new DrawBuilder(this.d3map.container, {id: `area-${area.id}`, clazz: 'area'});
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

  private removeObjectFromMapObjectService(metadata: Metadata): void {
    if ('type' in metadata) {
      if (metadata.type === 'INFO_WINDOW') {
        this.mapObjectService.removeInfoWindow((metadata));
      } else {
        this.mapObjectService.removeObject(metadata);
      }
    }
  }

  protected subscribeToMapClick() {
    this.mapClick.clickInvoked().takeUntil(this.subscriptionDestructor).subscribe((point: Point): void => {
      if (this.originListeningOnClickMapEvent.length > 0) {
        this.originListeningOnClickMapEvent.forEach((event: MessageEvent): void => {
          // @ts-ignore
          event.source.postMessage({type: 'click', position: point}, '*');
        });
      }
    });
  }

  private handleEventData(data: EventSocketData): void {
    const areaOnMap: SvgGroupWrapper = this.areasOnMap.getValue(data.event.areaId);
    if (!!areaOnMap) {
      if (data.event.mode.toString() === AreaEventMode[AreaEventMode.ON_ENTER]) {
        areaOnMap.getGroup().select('polygon').transition().style('fill', 'red').delay(TagOnMap.TRANSITION_DURATION);
      } else {
        areaOnMap.getGroup().select('polygon').transition().style('fill', 'grey').delay(TagOnMap.TRANSITION_DURATION);
      }
    }

    if (this.originListeningOnEvent.containsKey('area')) {
      this.originListeningOnEvent.getValue('area').forEach((event: MessageEvent): void => {
        setTimeout((): void => {
          // @ts-ignore
          event.source.postMessage({type: 'area', area: data.event}, '*');
        }, TagOnMap.TRANSITION_DURATION);
      });
    }
  }

  private getMapDimensions(event: MessageEvent) {
    this.loadMapDeferred.promise.then(() => {
      const height = this.d3map.container.node().getBBox().height;
      const width = this.d3map.container.node().getBBox().width;
      // @ts-ignore
      event.source.postMessage({
        type: `getMapDimensions`,
        mapObjectId: 'map',
        height,
        width,
        scale: this.scale,
        tempId: event.data.tempId
      }, '*');
    });
  }

  private getPointOnPath(event: MessageEvent) {
    this.pathService.getPathByFloorId(this.floor.id).first().subscribe((pathFromConfiguration: Line[]): void => {
      let calculatedPosition: Point = null;
      if (!!pathFromConfiguration && pathFromConfiguration.length > 0) {
        calculatedPosition = Geometry.findPointOnPathInGivenRange(pathFromConfiguration, event.data['args'].point, event.data['args'].accurac);
      }
      // @ts-ignore
      event.source.postMessage({
        type: 'getPointOnPath',
        mapObjectId: 'map',
        calculatedPosition
      }, '*');
    });
  }


  private getComplexes(event: MessageEvent) {
    this.complexService.getComplexes().first().subscribe((complexes: Complex[]) => {
      // @ts-ignore
      event.source.postMessage({
        type: 'getComplexes',
        mapObjectId: 'map',
        complexes
      }, '*');
    });
  }

  private handleCommands(event: MessageEvent): void {
    const data = <CustomMessageEvent>event.data;
    if ('command' in data) {
      switch (data.command) {
        case 'navigation':
          this.navigationController.handleNavigation(event, this.floor.id, this.d3map.container, this.scale);
          break;
        case 'toggleTagVisibility':
          const tagId = parseInt(data.args, 10);
          this.socketService.send({type: CommandType[CommandType.TOGGLE_TAG], args: tagId});
          if (this.isOnMap(tagId)) {
            this.tagsOnMap.getValue(tagId).remove();
            this.tagsOnMap.remove(tagId);
          }
          break;
        case 'addEventListener':
          if (this.originListeningOnEvent.containsKey(data.args)) {
            this.originListeningOnEvent.getValue(data.args).push(event);
          } else {
            this.originListeningOnEvent.setValue(data.args, [event]);
          }
          break;
        case 'createObject':
          const mapObjectId: number = this.mapObjectService.create();
          // @ts-ignore
          event.source.postMessage({type: `createObject-${event.data.object}`, mapObjectId: mapObjectId, tempId: event.data.tempId}, '*');
          break;
        case 'drawObject':
          this.mapObjectService.draw(data.args, this.scale, event, this.d3map.container, 'solid');
          break;
        case 'removeObject':
          this.removeObjectFromMapObjectService(data.args);
          break;
        case 'getMapDimensions':
          this.getMapDimensions(event);
          break;
        case 'addClickEventListener':
          if (this.originListeningOnClickMapEvent.indexOf(event) < 0) {
            this.originListeningOnClickMapEvent.push(event);
          }
          break;
        case 'getPointOnPath':
          this.getPointOnPath(event);
          break;
        case 'getComplexes':
          this.getComplexes(event);
          break;
      }
    }
  }
}

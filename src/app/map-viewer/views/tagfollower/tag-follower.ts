import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TranslateService} from '@ngx-translate/core';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../publication.service';
import {AreaService} from '../../services/area/area.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {ApiService} from '../../../shared/utils/drawing/api.service';
import {FloorService} from '../../../floor/floor.service';
import {TagVisibilityTogglerService} from '../../../shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {BreadcrumbService} from '../../../shared/services/breadcrumbs/breadcrumb.service';
import {MapClickService} from '../../../shared/services/map-click/map-click.service';
import {PathService} from '../../services/path/path.service';
import {Floor} from '../../../floor/floor.type';
import {MeasureSocketDataTag} from '../../publication.type';
import {Config} from '../../../../config';
import {MessageServiceWrapper} from '../../../shared/services/message/message.service';
import {Scale} from '../../../map-editor/tool-bar/tools/scale/scale.type';
import {MapSvg} from '../../../map/map.type';
import {Geometry} from '../../../shared/utils/helper/geometry';
import {Tag} from '../../../device/device.type';
import {ComplexService} from '../../../complex/complex.service';


@Component({
  templateUrl: '../socket-connector.component.html'
})
export class TagFollowerComponent extends SocketConnectorComponent implements OnInit {

  private tagShortId: number;
  private tagFloorId: number;
  private breadcrumbsSet: boolean = false;

  constructor(
    ngZone: NgZone,
    socketService: SocketService,
    route: ActivatedRoute,
    publishedService: PublishedService,
    mapLoaderInformer: MapLoaderInformerService,
    mapClickService: MapClickService,
    areaService: AreaService,
    pathService: PathService,
    translateService: TranslateService,
    iconService: IconService,
    mapObjectService: ApiService,
    complexService: ComplexService,
    floorService: FloorService,
    tagToggler: TagVisibilityTogglerService,
    breadcrumbService: BreadcrumbService,
    private messageService: MessageServiceWrapper,
    private router: Router
  ) {

    super(
      ngZone,
      socketService,
      route,
      publishedService,
      mapLoaderInformer,
      mapClickService,
      areaService,
      pathService,
      translateService,
      iconService,
      mapObjectService,
      complexService,
      floorService,
      tagToggler,
      breadcrumbService
    );
  }

  protected setCorrespondingFloorParams(): void {
    this.route.params.takeUntil(this.subscriptionDestructor)
      .subscribe((params: Params) => {
        this.tagShortId = +params['id'];
      });
  }

  protected subscribeToMapParametersChange(): void {
    const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}tagTracer?client`);
    stream.takeUntil(this.subscriptionDestructor).subscribe((tagData: MeasureSocketDataTag): void => {
      // console.log(+tagData.tag.shortId, +tagData.floor.id);
      if (this.tagFloorId && this.tagShortId === +tagData.tag.shortId) {
        if (this.tagFloorId !== +tagData.floor.id) {
          console.log('switching view');
          this.tagFloorId = +tagData.floor.id;
          this.setCorrespondingFloor(true);
        }
      } else if (this.tagShortId === +tagData.tag.shortId) {
        this.tagFloorId = +tagData.floor.id;
        this.setCorrespondingFloor();
      }
    });
  }
  private setCorrespondingFloor(force: boolean = false): void {
    if (this.tagFloorId) {
      this.floorService.getFloor(this.tagFloorId).takeUntil(this.subscriptionDestructor).subscribe((floor: Floor): void => {
        this.floor = floor;
        if (!this.breadcrumbsSet || force) {
          this.setBreadcrumbs();
        }
        if (!!floor.scale || force) {
          this.setScale();
        }
        if (!!floor.imageId || force) {
          // this.subscribeToMapLoader(floor);
        }
      });
    }
  }

  private subscribeToMapLoader(floor: Floor): void {
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg) => {
      this.d3map = mapSvg;
      console.log(this.d3map);
      this.loadMapDeferred.resolve();
      this.publishedService.getTagsAvailableForUser(floor.id).first().subscribe((tags: Tag[]): void => {
        this.tags = tags;
        this.tags.forEach((tag: Tag) => {
          this.visibleTags.set(tag.shortId, true);
        });
        this.tagTogglerService.setTags(tags);
        if (!!floor.scale) {
          this.drawAreas(floor.id);
          this.initializeSocketConnection();
        }
      });
    });
  }

  private setBreadcrumbs(): void {
    this.breadcrumbService.publishIsReady([
      {
        label: 'Tagsfinder',
        routerLink: '/tagsfinder',
        routerLinkActiveOptions: {exact: true}
      },
      {
        label: 'Follower',
        routerLink: `/complexes/follower/${this.tagShortId}`,
        disabled: true
      }
    ]);
    this.breadcrumbsSet = true;
  }

  private setScale(): void {
    this.scale = new Scale(this.floor.scale);
    this.scaleCalculations = {
      scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
      scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
    };
  }

}

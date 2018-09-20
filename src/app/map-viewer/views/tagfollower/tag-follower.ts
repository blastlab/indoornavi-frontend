import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
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


@Component({
  templateUrl: '../socket-connector.component.html'
})
export class TagFollowerComponent extends SocketConnectorComponent implements OnInit {

  private tagShortId: number;
  private tagFloorId: number;

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
    floorService: FloorService,
    tagToggler: TagVisibilityTogglerService,
    breadcrumbService: BreadcrumbService
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
      floorService,
      tagToggler,
      breadcrumbService
    );
  }
  // protected setCorrespondingFloorParams(): void {
  //   this.listenForTags
  //   this.route.params.takeUntil(this.subscriptionDestructor)
  //     .subscribe((params: Params) => {
  //       console.log('TagFollowerComponent');
  //       console.log(params);
  //       this.tagFloorId =
  //       const floorId = +params['id'];
  //       this.floorService.getFloor(floorId).takeUntil(this.subscriptionDestructor).subscribe((floor: Floor): void => {
  //         this.breadcrumbService.publishIsReady([
  //           {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
  //           {
  //             label: floor.building.complex.name,
  //             routerLink: `/complexes/${floor.building.complex.id}/buildings`,
  //             routerLinkActiveOptions: {exact: true}
  //           },
  //           {
  //             label: floor.building.name,
  //             routerLink: `/complexes/${floor.building.complex.id}/buildings/${floor.building.id}/floors`,
  //             routerLinkActiveOptions: {exact: true}
  //           },
  //           {label: `${(floor.name.length ? floor.name : floor.level)}`, disabled: true}
  //         ]);
  //       });
  //     });
  // }
}

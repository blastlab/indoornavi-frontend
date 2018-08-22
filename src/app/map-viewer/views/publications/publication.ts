import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TranslateService} from '@ngx-translate/core';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../publication.service';
import {AreaService} from '../../../shared/services/area/area.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {ApiService} from '../../../shared/utils/drawing/api.service';
import {FloorService} from '../../../floor/floor.service';
import {TagVisibilityTogglerService} from '../../../shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {BreadcrumbService} from '../../../shared/services/breadcrumbs/breadcrumb.service';
import {MapClickService} from '../../../shared/services/map-click/map-click.service';


@Component({
  templateUrl: '../socket-connector.component.html'
})
export class PublishedComponent extends SocketConnectorComponent implements OnInit {

  constructor(
    ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapLoaderInformer: MapLoaderInformerService,
              mapClickService: MapClickService,
              areaService: AreaService,
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
      translateService,
      iconService,
      mapObjectService,
      floorService,
      tagToggler,
      breadcrumbService,
    );
  }

}

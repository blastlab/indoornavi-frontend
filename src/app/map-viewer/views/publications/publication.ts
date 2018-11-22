import {Component, NgZone, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TranslateService} from '@ngx-translate/core';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../publication.service';
import {AreaService} from '../../services/area/area.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {ApiService} from '../../../shared/utils/drawing/api.service';
import {FloorService} from '../../../floor/floor.service';
import {TagVisibilityTogglerService} from '../../../shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {BreadcrumbService} from '../../../shared/services/breadcrumbs/breadcrumb.service';
import {MapClickService} from '../../../shared/services/map-click/map-click.service';
import {PathService} from '../../services/path/path.service';
import {ComplexService} from '../../../complex/complex.service';
import {NavigationController} from '../../../shared/utils/navigation/navigation.controller';
import {ModelsConfig} from '../../../map/models/models.config';


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
              pathService: PathService,
              translateService: TranslateService,
              mapObjectService: ApiService,
              pathDisplayService: NavigationController,
              complexService: ComplexService,
              floorService: FloorService,
              tagToggler: TagVisibilityTogglerService,
              breadcrumbService: BreadcrumbService,
              models: ModelsConfig
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
      mapObjectService,
      complexService,
      pathDisplayService,
      floorService,
      tagToggler,
      breadcrumbService,
      models
    );
  }
}

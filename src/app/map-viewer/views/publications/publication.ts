import {OnInit, Component, NgZone} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TranslateService} from '@ngx-translate/core';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../published.service';
import {AreaService} from '../../../shared/services/area/area.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {MapObjectService} from '../../../shared/utils/drawing/map.object.service';


@Component({
  templateUrl: '../socket-connector.component.html',
  styleUrls: ['./publication.css']
})
export class PublishedComponent extends SocketConnectorComponent implements OnInit {

  constructor(ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapLoaderInformer: MapLoaderInformerService,
              areaService: AreaService,
              translateService: TranslateService,
              iconService: IconService,
              mapObjectService: MapObjectService
              ) {

    super(
      ngZone,
      socketService,
      route,
      publishedService,
      mapLoaderInformer,
      areaService,
      translateService,
      iconService,
      mapObjectService
    );
  }

}

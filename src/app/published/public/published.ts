import {OnInit, Component, NgZone} from '@angular/core';
import {SocketService} from '../../utils/socket/socket.service';
import {ActivatedRoute, Params} from '@angular/router';
import {CommandType, MeasureSocketData} from './published.type';
import {PublishedService} from './published.service';
import {MapViewerService} from '../../map/map.viewer.service';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TranslateService} from '@ngx-translate/core';
import {IconService} from '../../utils/drawing/icon.service';
import {AreaService} from '../../area/area.service';

@Component({
  templateUrl: '../socket-connector.component.html',
  styleUrls: ['./published.css']
})
export class PublishedComponent extends SocketConnectorComponent implements OnInit {

  constructor(ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapViewerService: MapViewerService,
              areaService: AreaService,
              translateService: TranslateService,
              iconService: IconService) {

    super(
      ngZone,
      socketService,
      route,
      publishedService,
      mapViewerService,
      areaService,
      translateService,
      iconService);
  }

  // ngOnInit(): void {
  //   window.addEventListener('message', (event: MessageEvent) => {
  //     this.route.queryParams.subscribe((params: Params) => {
  //       if (event.origin === window.location.origin) {
  //         return;
  //       }
  //       this.publishedService.checkOrigin(params['api_key'], event.origin).subscribe((verified: boolean) => {
  //         if (verified) {
  //           if ('command' in event.data && event.data['command'] === 'toggleTagVisibility') {
  //             const tagId = parseInt(event.data['args'], 10);
  //             this.socketService.send({type: CommandType[CommandType.TOGGLE_TAG], args: tagId});
  //             if (this.isOnMap(tagId)) {
  //               // this.removeTagFromMap(tagId);
  //             }
  //           }
  //         }
  //       });
  //     });
  //   }, false);
}

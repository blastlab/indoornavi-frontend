import {OnInit, Component, NgZone} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TranslateService} from '@ngx-translate/core';
import {SocketService} from '../../shared/services/socket/socket.service';
import {PublishedService} from '../../map-viewer/published.service';
import {MapViewerService} from '../../map-editor/map.editor.service';
import {AreaService} from '../../shared/services/area/area.service';
import {IconService} from '../../shared/services/drawing/icon.service';


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

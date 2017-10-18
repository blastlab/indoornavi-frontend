import {AfterViewInit, Component, NgZone} from '@angular/core';
import {SocketService} from '../../utils/socket/socket.service';
import {ActivatedRoute, Params} from '@angular/router';
import {CommandType} from './published.type';
import {PublishedService} from './published.service';
import {MapViewerService} from '../../map/map.viewer.service';
import {IconService} from 'app/utils/drawing/icon.service';
import {PublishedViewerComponent} from '../published-viewer.component';
import {TranslateService} from '@ngx-translate/core';

@Component({
  templateUrl: '../published-viewer.component.html',
  styleUrls: ['./published.css']
})
export class PublishedComponent extends PublishedViewerComponent implements AfterViewInit {

  constructor(ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapViewerService: MapViewerService,
              translateService: TranslateService,
              iconService: IconService) {
    super(ngZone,
      socketService,
      route,
      publishedService,
      mapViewerService,
      translateService,
      iconService);
  }

  ngAfterViewInit(): void {
    window.addEventListener('message', (event: MessageEvent) => {
      this.route.queryParams.subscribe((params: Params) => {
        if (event.origin === window.location.origin) {
          return;
        }
        this.publishedService.checkOrigin(params['api_key'], event.origin).subscribe((verified: boolean) => {
          if (verified) {
            if ('command' in event.data && event.data['command'] === 'toggleTagVisibility') {
              const tagId = parseInt(event.data['args'], 10);
              this.socketService.send({type: CommandType[CommandType.TOGGLE_TAG], args: tagId});
              if (this.isOnMap(tagId)) {
                this.tagsOnMap.getValue(tagId).remove();
                this.tagsOnMap.remove(tagId);
              }
            }
          }
        });
      });
    }, false);
  }
}

import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {SocketService} from '../shared/services/socket/socket.service';
import {Config} from '../../config';
import {BatteryMessage, ClientRequest, CommandType, DeviceShortId, UWB} from '../device/device.type';
import {DeviceService} from '../device/device.service';
import {Timer} from '../shared/utils/timer/timer';
import {EventComponent} from './event/event';
import {DashboardService} from './dashboard.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {Floor} from '../floor/floor.type';
import {FloorService} from '../floor/floor.service';
import {PublishedService} from '../map-viewer/publication.service';
import {Publication} from '../map-viewer/publication.type';

@Component({
  templateUrl: 'dashboard.html',
  styleUrls: ['dashboard.css'],
  providers: [SocketService],
  encapsulation: ViewEncapsulation.None
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptionDestroyer: Subject<void> = new Subject<void>();
  private devicesUrls = ['tags/', 'anchors/', 'sinks/'];
  @ViewChild('eventComponent') eventComponent: EventComponent;
  private timer: Timer;
  floor: Floor;
  floorsConfigured: Floor[] = [];

  constructor(
    private infoSocket: SocketService,
    private deviceService: DeviceService,
    private dashboardService: DashboardService,
    private breadcrumbService: BreadcrumbService,
    private floorService: FloorService,
    private publishedService: PublishedService) {
  }

  ngOnDestroy(): void {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
    if (!!this.timer) {
      this.timer.stop();
    }
  }

  ngOnInit(): void {
    this.handleBatteryStatusEvents();
    this.breadcrumbService.publishIsReady([
        {label: 'Dashboard', disabled: true}
      ]
    );
    this.publishedService.getAll().subscribe((publications: Publication[]) => {
      if (publications.length > 0) {
        publications.forEach((publication: Publication): void => {
          publication.floors.forEach((floor: Floor): void => {
            if (!!floor.scale) {
              this.floorsConfigured.push(floor);
            }
          });
        });
        if (this.floorsConfigured.length > 0) {
          // take first floor that can be displayed.
          // TODO: request from Product Owner how to select next available floor while in dashboard view
          this.floorService.getFloor(this.floorsConfigured[0].id).subscribe((floor: Floor) => {
            this.floor = floor;
          });
        }
      }
    });
  }

  private handleBatteryStatusEvents(): void {
    const stream = this.infoSocket.connect(`${Config.WEB_SOCKET_URL}info?client`);
    stream.takeUntil(this.subscriptionDestroyer).subscribe((message: BatteryMessage) => {
      if (message.hasOwnProperty('batteryLevelList')) {
        this.eventComponent.addBatteryStateEvent(message.batteryLevelList);
      }
    });

    this.timer = new Timer(() => {
      this.checkBatteryLevels();
    }, 30000);

    this.timer.start();
    this.checkBatteryLevels();
  }

  private checkBatteryLevels(): void {
    this.devicesUrls.forEach((url: string) => {
      const checkBatteryStatuses: DeviceShortId[] = [];
      this.deviceService.setUrl(url);
      this.deviceService.getAll().subscribe((devices: UWB[]) => {
        devices.forEach((device: UWB) => {
          this.dashboardService.set(device.shortId, device.name);
          checkBatteryStatuses.push({shortId: device.shortId});
        });

        const socketPayload: ClientRequest = {
          type: CommandType[CommandType.CHECK_BATTERY_LEVEL],
          args: checkBatteryStatuses
        };
        this.infoSocket.send(socketPayload);
      });
    });
  }
}

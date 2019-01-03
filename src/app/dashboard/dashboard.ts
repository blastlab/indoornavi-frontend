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
import {Router} from '@angular/router';

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

  constructor(
    private infoSocket: SocketService,
    private deviceService: DeviceService,
    private dashboardService: DashboardService,
    private breadcrumbService: BreadcrumbService,
    private router: Router) {
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
    )
  }

  goToMap(): void {
    this.router.navigate(['/publications', 1]);
  }

  goToHeatMap() {
    this.router.navigate(['/analytics', 1]);
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
          type: CommandType.BatteryUpdate,
          args: checkBatteryStatuses
        };
        this.infoSocket.send(socketPayload);
      });
    });
  }
}
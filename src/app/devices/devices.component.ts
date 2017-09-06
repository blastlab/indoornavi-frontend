import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {SocketService} from '../utils/socket/socket.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from '../utils/toast/toast.service';
import {DeviceDialogComponent} from '../device/device.dialog';
import {DeviceListComponent} from '../device/device.list';
import {ActivatedRoute} from '@angular/router';
import {Tag} from './tag.type';
import {Anchor} from './anchor.type';
import {Sink} from './sink.type';
import {DeviceService} from '../device/device.service';

@Component({
  templateUrl: './devices.component.html',
  styleUrls: ['../device/device.css']
})

export class DevicesComponent implements OnInit, OnDestroy {
  private socketSubscription: Subscription;
  @ViewChild('verified') private verifiedList: DeviceListComponent;
  @ViewChild('notVerified') private notVerifiedList: DeviceListComponent;

  private routeState: string;
  private device: object;

  dialogRef: MdDialogRef<DeviceDialogComponent>;

  constructor(private socketService: SocketService,
              private dialog: MdDialog,
              public translate: TranslateService,
              private toastService: ToastService,
              private ngZone: NgZone,
              private route: ActivatedRoute,
              private deviceService: DeviceService,) {
  }

  get verified(): Anchor[] | Tag[] | Sink[] {
    return this.verifiedList.getDevices();
  }

  get notVerified(): Anchor[] | Tag[] | Sink[] {
    return this.notVerifiedList.getDevices();
  }

  ngOnInit() {
    this.routeState = this.route.snapshot.routeConfig.path;
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?${this.routeState}`);

      this.socketSubscription = stream.subscribe((devices: Array<Anchor | Tag | Sink>) => {
        this.ngZone.run(() => {
          devices.forEach((device: Anchor | Tag | Sink) => {
            if (this.verifiedList.isLocked(device) || this.notVerifiedList.isLocked(device)) {
              return;
            }
            if (device.verified) {
              this.verifiedList.devices.setValue(device.id, device);
              this.notVerifiedList.devices.remove(device.id);
            } else {
              this.notVerifiedList.devices.setValue(device.id, device);
              this.verifiedList.devices.remove(device.id);
            }
          });
        });
      });

    });

    this.translate.setDefaultLang('en');
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
    }
  }
  // this method opens a component dialog and cannot be passed as service
  // in addition this method needs a path that is taken from
  // this.route.snapshot.path
  // similar method is used in DeviceListComponent and has the same name
  // this method opens dialog that adds device
  openDialog(): void {
    this.device = this.deviceService.getEmptyDeviceObject(this.routeState);
    this.dialogRef = this.dialog.open(DeviceDialogComponent, {
      data: {
        device: Object.assign({}, this.device),
        url: `${this.routeState}/`
      }
    });

    this.dialogRef.afterClosed().subscribe(savedDevice => {
      if (savedDevice !== undefined) {
        this.toastService.showSuccess('device.create.success');
      }
      this.dialogRef = null;
    });
  }
}

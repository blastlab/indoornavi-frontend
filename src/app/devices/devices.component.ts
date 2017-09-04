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

@Component({
  templateUrl: './devices.component.html',
  styleUrls: ['../device/device.css']
})

export class DevicesComponent implements OnInit, OnDestroy {
  private socketSubscription: Subscription;
  @ViewChild('verified')
  private verifiedList: DeviceListComponent;
  @ViewChild('notVerified')
  private notVerifiedList: DeviceListComponent;

  private routeState: string;

  dialogRef: MdDialogRef<DeviceDialogComponent>;

  constructor(private socketService: SocketService,
              private dialog: MdDialog,
              public translate: TranslateService,
              private toastService: ToastService,
              private ngZone: NgZone,
              private route: ActivatedRoute) {
  }

  get verified(): Anchor[]|Tag[]|Sink[]  {
    return this.verifiedList.getDevices();
  }

  get notVerified(): Anchor[]|Tag[]|Sink[] {
    return this.notVerifiedList.getDevices();
  }

  ngOnInit() {
    this.routeState = this.route.snapshot.routeConfig.path;
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?${this.routeState}`);

      this.socketSubscription = stream.subscribe((devices: Array<Anchor|Tag|Sink>) => {
        this.ngZone.run(() => {
          devices.forEach((device: Anchor|Tag|Sink) => {
            if (this.verifiedList.isLocked(device) || this.notVerifiedList.isLocked(device)) {
              return;
            }
            if (device.verified) {
              this.verifiedList.devices.setValue(device.id, device);
              this.notVerifiedList.devices.remove(device.id);
            } else {
              console.log(device);
              this.notVerifiedList.devices.setValue(device.id, device);
              console.log(this.notVerifiedList.devices);
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

  openDialog(): void {
    this.dialogRef = this.dialog.open(DeviceDialogComponent);
    this.dialogRef.componentInstance.url = `${this.routeState}/`;
    this.dialogRef.componentInstance.device = {
      id: null,
      shortId: null,
      longId: null,
      verified: false,
      name: ''
    };

    this.dialogRef.afterClosed().subscribe(device => {
      if (device !== undefined) {
        this.toastService.showSuccess('device.create.success');
      }
      this.dialogRef = null;
    });
  }

}

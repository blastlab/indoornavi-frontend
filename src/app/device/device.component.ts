import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {SocketService} from '../shared/services/socket/socket.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from '../shared/utils/toast/toast.service';
import {DeviceDialogComponent} from './dialog/device.dialog';
import {DeviceListComponent} from './list/device.list';
import {ActivatedRoute, Router} from '@angular/router';
import {Tag} from './tag.type';
import {Anchor} from './anchor.type';
import {Sink} from './sink.type';
import {DeviceService} from './device.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: './device.component.html',
  styleUrls: ['./device.css']
})
export class DeviceComponent implements OnInit, OnDestroy {

  private socketSubscription: Subscription;
  @ViewChild('verified') private verifiedList: DeviceListComponent;
  @ViewChild('notVerified') private notVerifiedList: DeviceListComponent;

  public routeState: string;
  public createPermission: string;
  private device: object;

  dialogRef: MdDialogRef<DeviceDialogComponent>;

  constructor(
              public translate: TranslateService,
              private socketService: SocketService,
              private dialog: MdDialog,
              private toastService: ToastService,
              private ngZone: NgZone,
              private route: ActivatedRoute,
              private translateService: TranslateService,
              private breadcrumbsService: BreadcrumbService
  ) {
  }

  get verified(): Anchor[] | Tag[] | Sink[] {
    return this.verifiedList.getDevices();
  }

  get notVerified(): Anchor[] | Tag[] | Sink[] {
    return this.notVerifiedList.getDevices();
  }

  ngOnInit() {
    this.routeState = this.route.snapshot.routeConfig.path;
    this.setPermissions();
    this.translateService.setDefaultLang('en');
    this.translateService.get(`${this.routeState}.header`).subscribe((value: string) => {
      this.breadcrumbsService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
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
      this.socketSubscription.unsubscribe();
    }
  }

  openDialog(): void {
    this.device = DeviceService.emptyDeviceObjectDependentOnPath(this.routeState);
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
  setPermissions() {
    const prefix: string = DeviceService.getDevicePermissionPrefix(this.routeState);
    this.createPermission = `${prefix}_CREATE`;
  }
}

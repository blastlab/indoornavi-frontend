import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {SocketService} from '../utils/socket/socket.service';
import {Anchor} from './anchor.type';
import {MdDialog, MdDialogRef} from '@angular/material';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from '../utils/toast/toast.service';
import {DeviceDialogComponent} from '../device/device.dialog';
import {DeviceListComponent} from '../device/device.list';

@Component({
  templateUrl: './anchor.html',
  styleUrls: ['../device/device.css']
})

export class AnchorComponent implements OnInit, OnDestroy {
  private socketSubscription: Subscription;
  @ViewChild('verified')
  private verifiedList: DeviceListComponent;
  @ViewChild('notVerified')
  private notVerifiedList: DeviceListComponent;

  dialogRef: MdDialogRef<DeviceDialogComponent>;

  constructor(private socketService: SocketService,
              private dialog: MdDialog,
              public translate: TranslateService,
              private toastService: ToastService,
              private ngZone: NgZone) {
  }

  get verified(): Anchor[] {
    return this.verifiedList.getDevices();
  }

  get notVerified(): Anchor[] {
    return this.notVerifiedList.getDevices();
  }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'devices/registration?anchor');

      this.socketSubscription = stream.subscribe((anchors: Array<Anchor>) => {
        this.ngZone.run(() => {
          anchors.forEach((anchor: Anchor) => {
            if (this.verifiedList.isLocked(anchor) || this.notVerifiedList.isLocked(anchor)) {
              return;
            }
            if (anchor.verified) {
              this.verifiedList.devices.setValue(anchor.id, anchor);
              this.notVerifiedList.devices.remove(anchor.id);
            } else {
              this.notVerifiedList.devices.setValue(anchor.id, anchor);
              this.verifiedList.devices.remove(anchor.id);
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
    this.dialogRef = this.dialog.open(DeviceDialogComponent);
    this.dialogRef.componentInstance.url = 'anchors/';
    this.dialogRef.componentInstance.device = {
      id: null,
      shortId: null,
      longId: null,
      verified: false,
      name: ''
    };

    this.dialogRef.afterClosed().subscribe(anchor => {
      if (anchor !== undefined) {
        this.toastService.showSuccess('device.create.success');
      }
      this.dialogRef = null;
    });
  }

}


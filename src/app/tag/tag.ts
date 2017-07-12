import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {SocketService} from '../utils/socket/socket.service';
import {Tag} from './tag.type';
import {DeviceListComponent} from '../device/device.list';
import {MdDialog, MdDialogRef} from '@angular/material';
import {DeviceDialogComponent} from '../device/device.dialog';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from '../utils/toast/toast.service';

@Component({
  templateUrl: './tag.html',
  styleUrls: ['../device/device.css']
})
export class TagComponent implements OnInit, OnDestroy {

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

  get verified(): Tag[] {
    return this.verifiedList.getDevices();
  }

  get notVerified(): Tag[] {
    return this.notVerifiedList.getDevices();
  }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'devices/registration?tag');

      this.socketSubscription = stream.subscribe((tags: Array<Tag>) => {
        this.ngZone.run(() => {
          tags.forEach((tag: Tag) => {
            if (this.verifiedList.isLocked(tag) || this.notVerifiedList.isLocked(tag)) {
              return;
            }
            if (tag.verified) {
              this.verifiedList.devices.setValue(tag.id, tag);
              this.notVerifiedList.devices.remove(tag.id);
            } else {
              this.notVerifiedList.devices.setValue(tag.id, tag);
              this.verifiedList.devices.remove(tag.id);
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
    this.dialogRef.componentInstance.url = 'tags/';
    this.dialogRef.componentInstance.device = {
      id: null,
      shortId: null,
      longId: null,
      verified: false,
      name: ''
    };

    this.dialogRef.afterClosed().subscribe(tag => {
      if (tag !== undefined) {
        this.toastService.showSuccess('device.create.success');
      }
      this.dialogRef = null;
    });
  }

}


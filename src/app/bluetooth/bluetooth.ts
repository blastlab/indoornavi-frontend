import {Component, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {BluetoothService} from './bluetooth.service';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {Bluetooth} from '../device/device.type';
import {NgForm} from '@angular/forms';
import {ConfirmationService, SelectItem} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {SocketService} from '../shared/services/socket/socket.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  templateUrl: './bluetooth.html',
  styleUrls: ['./bluetooth.css'],
  encapsulation: ViewEncapsulation.None
})
export class BluetoothComponent implements OnInit, OnDestroy, CrudComponent {
  public verified: Bluetooth[] = [];
  public notVerified: Bluetooth[] = [];
  public deviceType: string;
  public dialogTitle: string;
  public removeDialogTitle: string;
  public createPermission: string;
  public deletePermission: string;
  public editPermission: string;
  public displayDialog: boolean = false;
  public bluetooth: Bluetooth;
  public displayInfoDialog: boolean = false;
  public power: SelectItem[];

  @ViewChild('bluetoothForm') bluetoothForm: NgForm;

  private socketSubscription: Subscription;
  private translateUploadingFirmwareMessage: Subscription;
  private firmwareSocketSubscription: Subscription;
  private confirmBodyTranslate: Subscription;
  private uploadBodyTranslate: Subscription;
  private confirmBody: string;
  private deviceHash: string | Int32Array;

  constructor(public translate: TranslateService,
              private socketService: SocketService,
              private messageService: MessageServiceWrapper,
              private ngZone: NgZone,
              private route: ActivatedRoute,
              private bluetoothService: BluetoothService,
              private confirmationService: ConfirmationService,
              private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit() {
    this.deviceType = this.route.snapshot.routeConfig.path;
    this.setPermissions();
    this.translate.setDefaultLang('en');
    this.bluetoothService.setUrl(this.deviceType + '/');
    this.confirmBodyTranslate = this.translate.get('confirm.body').subscribe((value: string): void => {
      this.confirmBody = value;
    });
    this.translate.get(this.deviceType + '.header').subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.translate.get(`device.details.bluetooth.remove`).subscribe((value: string) => {
      this.removeDialogTitle = value;
    });
    this.ngZone.runOutsideAngular(() => {
      this.connectToRegistrationSocket();
    });
    this.power = this.getPower();
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    if (this.translateUploadingFirmwareMessage) {
      this.translateUploadingFirmwareMessage.unsubscribe();
    }
    if (this.uploadBodyTranslate) {
      this.uploadBodyTranslate.unsubscribe();
    }
    if (this.confirmBodyTranslate) {
      this.confirmBodyTranslate.unsubscribe();
    }
    if (this.firmwareSocketSubscription) {
      this.firmwareSocketSubscription.unsubscribe();
    }
  }

  save(isValid: boolean): void {
    if (isValid) {
      const isNew = !(!!this.bluetooth.id);
      if (!isNew && Md5.hashStr(JSON.stringify(this.bluetooth)) !== this.deviceHash) {
        // if it's an edit mode then we need to remove it from list first, so that updated version will show up on the list when it arrives through websocket
        // checking hash to ensure that any change has been done, otherwise backend will not send it through websocket (NAVI-196)
        this.removeFromList(this.bluetooth);
      }
      (!!this.bluetooth.id ?
          this.bluetoothService.update(this.bluetooth)
          :
          this.bluetoothService.create(this.bluetooth)
      ).subscribe(() => {
        if (isNew) {
          this.messageService.success('device.create.success');
        } else {
          this.messageService.success('device.save.success');
        }
      }, (err: string) => {
        this.messageService.failed(err);
      });
      this.cancel();
    } else {
      CrudHelper.validateAllFields(this.bluetoothForm);
    }
  }

  cancel(): void {
    this.displayDialog = false;
    this.bluetoothForm.resetForm();
  }

  openDialog(bluetooth?: Bluetooth): void {
    if (!!bluetooth) {
      this.bluetooth = {...bluetooth};
      this.dialogTitle = `device.details.bluetooth.edit`;
    } else {
      this.bluetooth = new Bluetooth(false, null, null);
      this.dialogTitle = `device.details.bluetooth.add`;
    }

    this.deviceHash = Md5.hashStr(JSON.stringify(this.bluetooth));
    this.displayDialog = true;
  }

  remove(bluetooth: Bluetooth): void {
    this.confirmationService.confirm({
      header: this.removeDialogTitle,
      message: this.confirmBody,
      accept: () => {
        this.bluetoothService.remove(bluetooth.id).subscribe(() => {
          this.removeFromList(bluetooth);
          this.messageService.success('bluetooth.remove.success');
        }, (msg: string) => {
          this.messageService.failed(msg);
        });
      }
    });
  }

  onItemMoved(movedBluetoothList: Bluetooth[]): void {
    movedBluetoothList.forEach((bluetooth: Bluetooth) => {
      bluetooth.verified = !bluetooth.verified;
      this.bluetoothService.update(bluetooth).subscribe(() => {
        this.messageService.success('bluetooth.save.success');
      });
    });
  }

  private setPermissions(): void {
    this.createPermission = `BLUETOOTH_CREATE`;
    this.editPermission = `BLUETOOTH_UPDATE`;
    this.deletePermission = `BLUETOOTH_DELETE`;
  }

  private isAlreadyOnAnyList(bluetooth: Bluetooth): boolean {
    return this.verified.findIndex((b: Bluetooth) => {
        return b.id === bluetooth.id;
      }) >= 0 ||
      this.notVerified.findIndex((b: Bluetooth) => {
        return b.id === bluetooth.id;
      }) >= 0;
  }

  private removeFromList(bluetooth: Bluetooth): void {
    const bluetoothList = (this.verified.findIndex((b: Bluetooth) => {
      return b.id === bluetooth.id;
    }) >= 0) ? this.verified : this.notVerified;
    const bluetoothIndex = bluetoothList.findIndex((b: Bluetooth) => {
      return b.id === bluetooth.id;
    });
    CrudHelper.remove(bluetoothIndex, bluetoothList);
  }

  private connectToRegistrationSocket() {
    const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?${this.deviceType}`);
    const bluetoothList = [
      { id: 121, major: 88, minor: 20, macAddress: 'f1:09:d2:b6:05:d4', powerTransmition: -10, verified: false, name: 'Bluetooth 1' },
      { id: 140, major: 54, minor: 30, macAddress: '130.212.123.120', powerTransmition: 0, verified: true, name: 'Bluetooth 2'  },
      { id: 122, major: 87, minor: 40, macAddress: '130.212.123.122', powerTransmition: -20, verified: false, name: 'Bluetooth 3'  }
    ];

    bluetoothList.forEach((bluetooth: Bluetooth) => {
      if (this.isAlreadyOnAnyList(bluetooth)) {
        return;
      }
      if (bluetooth.verified) {
        this.verified.push(bluetooth);
      } else {
        this.notVerified.push(bluetooth);
      }
    });

    this.socketSubscription = stream.subscribe((devices: Array<Bluetooth>): void => {
      this.ngZone.run((): void => {
        // devices.forEach((device: Device) => {
        //   if (this.isAlreadyOnAnyList(device)) {
        //     return;
        //   }
        //   if (device.verified) {
        //     this.verified.push(device);
        //   } else {
        //     this.notVerified.push(device);
        //   }
        // });
      });
    });
  }

  private getPower(): SelectItem[] {
    return [
      { label: '-40', value: -40 },
      { label: '-20', value: -20 },
      { label: '-16', value: -16 },
      { label: '-12', value: -12 },
      { label: '-8', value: -8 },
      { label: '-4', value: -4 },
      { label: '0', value: 0 },
      { label: '3', value: 3 },
      { label: '4', value: 4 }
    ];
  }
}

import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DeviceService} from './device.service';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {Device, DeviceStatus, Status, UpdateRequest} from './device.type';
import {NgForm} from '@angular/forms';
import {Checkbox, ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {SocketService} from '../shared/services/socket/socket.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {Md5} from 'ts-md5/dist/md5';

@Component({
  templateUrl: './device.html',
  styleUrls: ['./device.css'],
  encapsulation: ViewEncapsulation.None
})
export class DeviceComponent implements OnInit, OnDestroy, CrudComponent {
  public verified: Device[] = [];
  public notVerified: Device[] = [];
  public deviceType: string;
  public dialogTitle: string;
  public removeDialogTitle: string;
  public createPermission: string;
  public deletePermission: string;
  public editPermission: string;
  public displayDialog: boolean = false;
  public device: Device;
  public updateMode: boolean = false;
  public devicesToUpdate: Device[] = [];
  public devicesUpdating: Device[] = [];
  public allSelected: boolean = false;
  public displayInfoDialog: boolean = false;
  public sourceFilterPlaceholder: string;
  @ViewChildren('updateCheckbox') public deviceCheckboxes: Checkbox[];
  @ViewChild('firmwareInput') public firmwareInput: ElementRef;
  @ViewChild('firmwareButton') public firmwareButton: ElementRef;

  @ViewChild('deviceForm') deviceForm: NgForm;

  private socketSubscription: Subscription;
  private translateUploadingFirmwareMessage: Subscription;
  private firmwareSocketSubscription: Subscription;
  private confirmBodyTranslate: Subscription;
  private uploadBodyTranslate: Subscription;
  private confirmBody: string;
  private devicesWaitingForNewFirmwareVersion: DeviceStatus[] = [];
  private deviceHash: string | Int32Array;

  constructor(public translate: TranslateService,
              private socketService: SocketService,
              private messageService: MessageServiceWrapper,
              private ngZone: NgZone,
              private route: ActivatedRoute,
              private deviceService: DeviceService,
              private confirmationService: ConfirmationService,
              private breadcrumbService: BreadcrumbService) {
  }

  ngOnInit() {
    this.deviceType = this.route.snapshot.routeConfig.path;
    this.setPermissions();
    this.translate.setDefaultLang('en');
    this.deviceService.setUrl(this.deviceType + '/');
    this.confirmBodyTranslate = this.translate.get('confirm.body').subscribe((value: string): void => {
      this.confirmBody = value;
    });
    this.translate.get(this.deviceType + '.header').subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });
    this.translate.get(`device.details.${this.deviceType}.remove`).subscribe((value: string) => {
      this.removeDialogTitle = value;
    });
    this.ngZone.runOutsideAngular(() => {
      this.connectToRegistrationSocket();
    });
    this.translateSearchPlaceholder();
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
      const isNew = !(!!this.device.id);
      if (!isNew && Md5.hashStr(JSON.stringify(this.device)) !== this.deviceHash) {
        // if it's an edit mode then we need to remove it from list first, so that updated version will show up on the list when it arrives through websocket
        // checking hash to ensure that any change has been done, otherwise backend will not send it through websocket (NAVI-196)
        this.removeFromList(this.device);
      }
      (!!this.device.id ?
          this.deviceService.update(this.device)
          :
          this.deviceService.create(this.device)
      ).subscribe(() => {
        if (isNew) {
          this.messageService.success('device.create.success');
        } else {
          this.messageService.success('device.save.success');
        }
      }, (err: string) => {
        this.messageService.failed(err);
      });
      this.displayDialog = false;
      this.deviceForm.resetForm();
    } else {
      CrudHelper.validateAllFields(this.deviceForm);
    }
  }

  cancel(): void {
    this.displayDialog = false;
    this.deviceForm.resetForm();
  }

  openDialog(device?: Device): void {
    if (!!device) {
      this.device = {...device};
      this.dialogTitle = `device.details.${this.deviceType}.edit`;
    } else {
      this.device = new Device(null, null, false);
      this.dialogTitle = `device.details.${this.deviceType}.add`;
    }

    this.deviceHash = Md5.hashStr(JSON.stringify(this.device));
    this.displayDialog = true;
  }

  remove(device: Device): void {
    this.confirmationService.confirm({
      header: this.removeDialogTitle,
      message: this.confirmBody,
      accept: () => {
        this.deviceService.remove(device.id).subscribe(() => {
          this.removeFromList(device);
          this.messageService.success('device.remove.success');
        }, (msg: string) => {
          this.messageService.failed(msg);
        });
      }
    });
  }

  onItemMoved(movedDevices: Device[]): void {
    movedDevices.forEach((device: Device) => {
      device.verified = !device.verified;
      this.deviceService.update(device).subscribe(() => {
        this.messageService.success('device.save.success');
      });
    });
  }

  selectAllToUpload(): void {
    this.devicesToUpdate = [];
    if (this.allSelected) {
      this.verified.forEach((device: Device) => {
        if (!this.getCheckboxById(device.shortId).disabled) {
          this.devicesToUpdate.push(device);
        }
      });
      this.notVerified.forEach((device: Device) => {
        if (!this.getCheckboxById(device.shortId).disabled) {
          this.devicesToUpdate.push(device);
        }
      });
    }
  }

  checkAllSelected(): void {
    if (this.allSelected) {
      this.allSelected = !this.allSelected
    } else if (this.devicesToUpdate.length === (this.verified.length + this.notVerified.length)) {
      this.allSelected = true;
    }
  }

  fileSelected() {
    const file = this.firmwareInput.nativeElement.files[0];
    this.firmwareButton.nativeElement.querySelector('.ui-button-text').innerText = file.name;
  }

  upload(): void {
    const files = this.firmwareInput.nativeElement.files;

    if (this.devicesToUpdate.length === 0 || files.length === 0) {
      this.displayInfoDialog = true;
      return;
    }

    this.devicesUpdating = this.devicesToUpdate;

    this.getBase64(files[0]).then((base64: string): void => {
      this.socketService.send(new UpdateRequest(this.devicesToUpdate.map((device: Device): number => device.shortId), base64));
      this.messageService.success('uploading.firmware.message');
    });
  }

  toggleUpdateMode(): void {
    this.updateMode = !this.updateMode;
    if (this.updateMode) {
      this.socketSubscription.unsubscribe();
      const stream = this.socketService.connect(`${Config.WEB_SOCKET_URL}info?client&${this.deviceType}`);
      this.firmwareSocketSubscription = stream.subscribe((message) => {
        if (message.type === 'INFO') {
          (<DeviceStatus[]>message.devices).forEach((deviceStatus: DeviceStatus) => {
            if (deviceStatus.status.toString() === Status[Status.ONLINE] || deviceStatus.status.toString() === Status[Status.OFFLINE]) {
              const checkbox: Checkbox = this.getCheckboxById(deviceStatus.device.shortId);
              if (!!checkbox) {
                checkbox.setDisabledState(deviceStatus.status.toString() === Status[Status.OFFLINE]);
              }
              this.updateFirmwareVersion(deviceStatus);
            } else if (deviceStatus.status.toString() === Status[Status.UPDATING]) {
              this.devicesUpdating.push(deviceStatus.device);
            } else if (deviceStatus.status.toString() === Status[Status.UPDATED]) {
              this.devicesWaitingForNewFirmwareVersion.push(deviceStatus)
            }
          });
        } else if (message.type === 'INFO_ERROR') {
          const deviceStatus: DeviceStatus = message.deviceStatus;
          if (!!deviceStatus) {
            this.removeFromUpdating(deviceStatus);
            this.removeFromToUpdate(deviceStatus);
          } else {
            this.devicesToUpdate.length = 0;
            this.devicesUpdating.length = 0;
          }
          this.messageService.failed(message.code);
        }
      });
    } else {
      this.firmwareSocketSubscription.unsubscribe();
      this.connectToRegistrationSocket();
    }
  }

  isDeviceBluetooth(): boolean {
    return this.deviceType === 'bluetooth';
  }

  filterByData() {
    switch (this.deviceType) {
      case 'bluetooth':
          return 'id';
      case 'sinks':
      case 'anchors':
      case 'tags':
        return 'shortId';
      default:
        return 'shortId';
    }
  }

  private translateSearchPlaceholder(): void {
    if (this.isDeviceBluetooth()) {
      this.translate.get(`device.searchById`).subscribe((value: string) => {
        this.sourceFilterPlaceholder = value;
      });
    } else {
      this.translate.get(`device.searchByShortId`).subscribe((value: string) => {
        this.sourceFilterPlaceholder = value;
      });
    }
  }

  private updateFirmwareVersion(deviceStatus: DeviceStatus) {
    let deviceToChangeFirmware: Device;
    const index = this.devicesWaitingForNewFirmwareVersion.findIndex((ds: DeviceStatus) => {
      return ds.device.shortId === deviceStatus.device.shortId;
    });
    if (index >= 0) {
      this.removeFromUpdating(deviceStatus);
      this.removeFromToUpdate(deviceStatus);
      this.checkAllSelected();

      deviceToChangeFirmware = this.verified.find((device: Device) => {
        return device.shortId === deviceStatus.device.shortId;
      });
      if (!!deviceToChangeFirmware) {
        deviceToChangeFirmware.firmwareVersion = deviceStatus.device.firmwareVersion;
        this.devicesWaitingForNewFirmwareVersion.splice(index, 1);
        return;
      }
      deviceToChangeFirmware = this.notVerified.find((device: Device) => {
        return device.shortId === deviceStatus.device.shortId;
      });
      if (!!deviceToChangeFirmware) {
        deviceToChangeFirmware.firmwareVersion = deviceStatus.device.firmwareVersion;
        this.devicesWaitingForNewFirmwareVersion.splice(index, 1);
        return;
      }
    }
  }

  private removeFromUpdating(deviceStatus: DeviceStatus) {
    this.devicesUpdating = this.devicesUpdating.filter((device: Device) => {
      return device.shortId !== deviceStatus.device.shortId;
    });
  }

  private removeFromToUpdate(deviceStatus: DeviceStatus) {
    this.devicesToUpdate = this.devicesToUpdate.filter((device: Device) => {
      return device.shortId !== deviceStatus.device.shortId;
    });
  }

  private getCheckboxById(shortId: number): Checkbox {
    return this.deviceCheckboxes.find((checkbox: Checkbox) => {
      return checkbox.value.shortId === shortId;
    });
  }

  private getBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', () => resolve(reader.result));
      reader.addEventListener('error', () => error => reject(error));
    });
  }

  private setPermissions(): void {
    const prefix: string = DeviceService.getDevicePermissionPrefix(this.deviceType);
    this.createPermission = `${prefix}_CREATE`;
    this.editPermission = `${prefix}_UPDATE`;
    this.deletePermission = `${prefix}_DELETE`;
  }

  private isAlreadyOnAnyList(device: Device): boolean {
    return this.verified.findIndex((d: Device) => {
        return d.id === device.id;
      }) >= 0 ||
      this.notVerified.findIndex((d: Device) => {
        return d.id === device.id;
      }) >= 0;
  }

  private removeFromList(device: Device): void {
    const deviceList = (this.verified.findIndex((d: Device) => {
      return d.id === device.id;
    }) >= 0) ? this.verified : this.notVerified;
    const deviceIndex = deviceList.findIndex((d: Device) => {
      return d.id === device.id;
    });
    CrudHelper.remove(deviceIndex, deviceList);
  }

  private connectToRegistrationSocket() {
    const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?${this.deviceType}`);
    let test = [
      { id: 121, major: 20, macAddress: '123.212.123.121', powerTransmition: 48483, verified: false, shortId: 7457, name: 'Bluetooth 1' },
      { id: 140, major: 30, macAddress: '130.212.123.120', powerTransmition: 53452, verified: false, shortId: 5675, name: 'Bluetooth 2'  },
      { id: 122, major: 40, macAddress: '130.212.123.122', powerTransmition: 34544, verified: false, shortId: 4756, name: 'Bluetooth 3'  }
    ];
    test.forEach((device: Device) => {
      if (this.isAlreadyOnAnyList(device)) {
        return;
      }
      if (device.verified) {
        this.verified.push(device);
      } else {
        this.notVerified.push(device);
      }
    });
    this.socketSubscription = stream.subscribe((devices: Array<Device>): void => {
      this.ngZone.run((): void => {
        devices.forEach((device: Device) => {
          if (this.isAlreadyOnAnyList(device)) {
            return;
          }
          if (device.verified) {
            this.verified.push(device);
          } else {
            this.notVerified.push(device);
          }
        });
      });
    });
  }

}

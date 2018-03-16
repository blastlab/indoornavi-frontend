import {Component, NgZone, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DeviceService} from './device.service';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {Device, UpdateRequest} from './device.type';
import {NgForm} from '@angular/forms';
import {ConfirmationService, Message} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {SocketService} from '../shared/services/socket/socket.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: './device.html',
  styleUrls: ['./device.css'],
  encapsulation: ViewEncapsulation.None
})
export class DeviceComponent implements OnInit, OnDestroy, CrudComponent {
  public verified: Device[] = [];
  public notVerified: Device[] = [];
  public deviceType: string;
  public createPermission: string;
  public deletePermission: string;
  public editPermission: string;
  public displayDialog: boolean = false;
  public device: Device;
  public updateMode: boolean = false;
  public devicesToUpdate: Device[] = [];
  public devicesUpdating: Device[] = [];
  public allSelected: boolean = false;
  public uploadingMessage: Message[] = [];
  public displayInfoDialog: boolean = false;

  @ViewChild('deviceForm') deviceForm: NgForm;

  private socketSubscription: Subscription;
  private translateUploadingFirmwareMessage: Subscription;
  private firmwareSocketSubscription: Subscription;
  private confirmBodyTranslate: Subscription;
  private uploadBodyTranslate: Subscription;
  private confirmBody: string;
  private uploadBody: string;


  constructor(
              public translate: TranslateService,
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
    this.uploadBodyTranslate = this.translate.get('upload.body.info').subscribe((value: string): void => {
      this.uploadBody = value;
    });
    this.translate.get(this.deviceType + '.header').subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });

    this.ngZone.runOutsideAngular(() => {
      // const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?${this.deviceType}`);
      // todo: delete below code as this is mocked only for testing purposes
      const stream = this.socketService.connect(`ws://localhost:8888`);

      this.socketSubscription = stream.subscribe((devices: Array<Device>): void => {
        this.ngZone.run((): void => {
          console.log(devices);
          devices.forEach((device: Device) => {
            this.removeDeviceFromUpdating(device);
            // todo: delete after setting device firmware property on server
            // this is only a mocked value
            device.firmware = 'Beta 0.0.4';
            // delete till there ----------------------
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
    });
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
      if (!isNew) { // if it's an update then we need to remove it first so updated version will show up on the list when websocket get it
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
    } else {
      this.device = new Device(null, null, false);
    }
    this.displayDialog = true;
  }

  remove(device: Device): void {
    this.confirmationService.confirm({
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
      this.deviceService.update(device).subscribe((savedDevice: Device) => {
        this.messageService.success('device.save.success');
      });
    });
  }

  selectALLToUpload (): void {
    this.devicesToUpdate = [];
    if (this.allSelected) {
      this.notVerified.forEach((device: Device) => this.devicesToUpdate.push(device));
      this.verified.forEach((device: Device) => this.devicesToUpdate.push(device));
    }
  }

  checkAllSelected(): void {
    if (this.allSelected) {
      this.allSelected = !this.allSelected
    } else if (this.devicesToUpdate.length === this.verified.length + this.notVerified.length) {
      this.allSelected = true;
    }
  }

  upload(data: { files: File[] }): void {
    this.devicesUpdating = this.devicesToUpdate;
    if (this.devicesToUpdate.length === 0) {
      this.displayInfoDialog = true;
      return;
    }

    if (data.files.length === 1) {
      this.getBase64(data.files[0]).then((base64: string): void => {

        this.socketService.send(new UpdateRequest(this.devicesToUpdate.map((device: Device): number => device.shortId), base64));
        this.translateUploadingFirmwareMessage =  this.translate.get('uploading.firmware.message').subscribe((value: string) => {
          this.uploadingMessage = [];
          this.uploadingMessage.push({severity: 'info', detail: value});
        });
      });
    }
  }

  toggleUpdateMode(): void {
    this.updateMode = !this.updateMode;
    if (this.updateMode) {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `info?client`);
      this.firmwareSocketSubscription = stream.subscribe((message) => {
        console.log(message);
      });
    } else {
      this.firmwareSocketSubscription.unsubscribe();
    }
  }

  private removeDeviceFromUpdating(deviceUpdated: Device): void {
    const index = this.devicesUpdating.findIndex((deviceUpdating: Device): boolean => deviceUpdating.shortId === deviceUpdated.shortId);
    this.devicesUpdating.splice(index, 1);
    this.checkAllSelected();
  }

  private getBase64(file: File): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('onload', () => resolve(reader.result));
      reader.addEventListener('onerror', () => error => reject(error));
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
}

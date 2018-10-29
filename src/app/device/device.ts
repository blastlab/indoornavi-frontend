import {Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild, ViewChildren, ViewEncapsulation} from '@angular/core';
import {Subject, Subscription} from 'rxjs/Rx';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {DeviceService} from './device.service';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {Anchor, Device, DeviceStatus, Status, UpdateRequest, UWB} from './device.type';
import {NgForm} from '@angular/forms';
import {Checkbox, ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {SocketService} from '../shared/services/socket/socket.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {Md5} from 'ts-md5/dist/md5';
import {TerminalService} from 'primeng/components/terminal/terminalservice';

@Component({
  templateUrl: './device.html',
  styleUrls: ['./device.css'],
  encapsulation: ViewEncapsulation.None
})
export class DeviceComponent implements OnInit, OnDestroy, CrudComponent {
  public verified: Anchor[] = [];
  public notVerified: Anchor[] = [];
  public deviceType: string;
  public dialogTitle: string;
  public removeDialogTitle: string;
  public createPermission: string;
  public deletePermission: string;
  public editPermission: string;
  public displayDialog: boolean = false;
  public displayTerminalWindow = false;
  public terminalWelcomeMessage: string;
  public terminalResponseMessage: string = '';
  public terminalActiveDeviceId: number = 0;
  public device: UWB;
  public updateMode: boolean = false;
  public devicesToUpdate: UWB[] = [];
  public devicesUpdating: UWB[] = [];
  public allSelected: boolean = false;
  public displayInfoDialog: boolean = false;
  @ViewChildren('updateCheckbox') public deviceCheckboxes: Checkbox[];
  @ViewChild('firmwareInput') public firmwareInput: ElementRef;
  @ViewChild('firmwareButton') public firmwareButton: ElementRef;

  @ViewChild('deviceForm') deviceForm: NgForm;

  private socketSubscription: Subscription;
  private translateUploadingFirmwareMessage: Subscription;
  private firmwareSocketSubscription: Subscription;
  private confirmBodyTranslate: Subscription;
  private uploadBodyTranslate: Subscription;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private confirmBody: string;
  private terminalSuperUser: boolean = false;
  private devicesWaitingForNewFirmwareVersion: DeviceStatus[] = [];
  private deviceHash: string | Int32Array;

  constructor(public translate: TranslateService,
              private socketService: SocketService,
              private messageService: MessageServiceWrapper,
              private ngZone: NgZone,
              private route: ActivatedRoute,
              private deviceService: DeviceService,
              private confirmationService: ConfirmationService,
              private breadcrumbService: BreadcrumbService,
              private terminalService: TerminalService
  ) {
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
    this.translate.get('device.terminal.welcome').first().subscribe((value: string) => {
      this.terminalWelcomeMessage = value;
    });
    this.ngZone.runOutsideAngular(() => {
      this.connectToRegistrationSocket();
    });
    this.setTerminalCommandHandler();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
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
      // if user clicks mac address field it fills up with empty string, but db unique constraint doesn't allow empty strings
      if (this.device.macAddress !== undefined && this.device.macAddress.length === 0) {
        this.device.macAddress = null;
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

  openDialog(device?: UWB): void {
    if (!!device) {
      this.device = {...device};
      this.dialogTitle = `device.details.${this.deviceType}.edit`;
    } else {
      this.device = new UWB(false, null, null, null);
      this.dialogTitle = `device.details.${this.deviceType}.add`;
    }

    this.deviceHash = Md5.hashStr(JSON.stringify(this.device));
    this.displayDialog = true;
  }

  remove(device: UWB): void {
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

  onItemMoved(movedDevices: UWB[]): void {
    movedDevices.forEach((device: UWB) => {
      device.verified = !device.verified;
      this.deviceService.update(device).subscribe(() => {
        this.messageService.success('device.save.success');
      });
    });
  }

  selectAllToUpload(): void {
    this.devicesToUpdate = [];
    if (this.allSelected) {
      this.verified.forEach((device: UWB) => {
        if (!this.getCheckboxById(device.shortId).disabled) {
          this.devicesToUpdate.push(device);
        }
      });
      this.notVerified.forEach((device: UWB) => {
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
      this.socketService.send(new UpdateRequest(this.devicesToUpdate.map((device: UWB): number => device.shortId), base64));
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
              const checkbox: Checkbox = this.getCheckboxById(deviceStatus.anchor.shortId);
              if (!!checkbox) {
                checkbox.setDisabledState(deviceStatus.status.toString() === Status[Status.OFFLINE]);
              }
              this.updateFirmwareVersion(deviceStatus);
            } else if (deviceStatus.status.toString() === Status[Status.UPDATING]) {
              this.devicesUpdating.push(deviceStatus.anchor);
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

  terminal(device: UWB): void {
    this.terminalActiveDeviceId = device.shortId;
    this.displayTerminalWindow = !this.displayTerminalWindow;
  }

  private setTerminalCommandHandler(): void {
    this.terminalService.commandHandler.takeUntil(this.subscriptionDestructor).subscribe(command => {
      let responseMessage: string;
      let responseData: string;
      switch (command.toLowerCase()) {
        case 'su':
          responseMessage = 'terminal.response.superUser';
          responseData = '';
          this.terminalSuperUser = true;
          this.sendResponseToTermianl(responseMessage, responseData);
          break;
        case 'help':
          responseMessage = 'terminal.response.commands';
          responseData = 'help, fuckOff, fuckOn, fuckRandom';
          this.sendResponseToTermianl(responseMessage, responseData);
          break;
        case 'exit':
          this.terminalSuperUser = false;
          this.displayTerminalWindow = !this.displayTerminalWindow;
          break;
        default:
          responseMessage = 'terminal.response.wrong.command';
          responseData = '';
          this.sendResponseToTermianl(responseMessage, responseData);
      }
    });
  }

  private sendResponseToTermianl(responseMessage: string, responseData: string): void {
    this.translate.get(responseMessage).first().subscribe((message: string) => {
      const value = `${message} ${responseData}`;
      this.terminalService.sendResponse(value);
    });
  }

  private updateFirmwareVersion(deviceStatus: DeviceStatus) {
    let deviceToChangeFirmware: UWB;
    const index = this.devicesWaitingForNewFirmwareVersion.findIndex((ds: DeviceStatus) => {
      return ds.anchor.shortId === deviceStatus.anchor.shortId;
    });
    if (index >= 0) {
      this.removeFromUpdating(deviceStatus);
      this.removeFromToUpdate(deviceStatus);
      this.checkAllSelected();

      deviceToChangeFirmware = this.verified.find((device: UWB) => {
        return device.shortId === deviceStatus.anchor.shortId;
      });
      if (!!deviceToChangeFirmware) {
        deviceToChangeFirmware.firmwareVersion = deviceStatus.anchor.firmwareVersion;
        this.devicesWaitingForNewFirmwareVersion.splice(index, 1);
        return;
      }
      deviceToChangeFirmware = this.notVerified.find((device: UWB) => {
        return device.shortId === deviceStatus.anchor.shortId;
      });
      if (!!deviceToChangeFirmware) {
        deviceToChangeFirmware.firmwareVersion = deviceStatus.anchor.firmwareVersion;
        this.devicesWaitingForNewFirmwareVersion.splice(index, 1);
        return;
      }
    }
  }

  private removeFromUpdating(deviceStatus: DeviceStatus) {
    this.devicesUpdating = this.devicesUpdating.filter((device: UWB) => {
      return device.shortId !== deviceStatus.anchor.shortId;
    });
  }

  private removeFromToUpdate(deviceStatus: DeviceStatus) {
    this.devicesToUpdate = this.devicesToUpdate.filter((device: UWB) => {
      return device.shortId !== deviceStatus.anchor.shortId;
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
      reader.addEventListener('load', () => resolve(reader.result.toString()));
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

  private removeFromList(device: UWB): void {
    const deviceList = (this.verified.findIndex((d: UWB) => {
      return d.id === device.id;
    }) >= 0) ? this.verified : this.notVerified;
    const deviceIndex = deviceList.findIndex((d: UWB) => {
      return d.id === device.id;
    });
    CrudHelper.remove(deviceIndex, deviceList);
  }

  private connectToRegistrationSocket() {
    const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?${this.deviceType}`);
    this.socketSubscription = stream.subscribe((devices: Array<UWB>): void => {
      this.ngZone.run((): void => {
        devices.forEach((device: UWB) => {
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

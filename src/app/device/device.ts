import {Component, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute} from '@angular/router';
import {Tag} from './tag.type';
import {Anchor} from './anchor.type';
import {Sink} from './sink.type';
import {DeviceService} from './device.service';
import {CrudComponent, CrudHelper} from '../shared/components/crud/crud.component';
import {Device} from './device.type';
import {NgForm} from '@angular/forms';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {SocketService} from '../shared/services/socket/socket.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';

@Component({
  templateUrl: './device.html',
  styleUrls: ['./device.css']
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

  @ViewChild('deviceForm') deviceForm: NgForm;

  private socketSubscription: Subscription;
  private confirmBody: string;

  constructor(private socketService: SocketService,
              public translate: TranslateService,
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
    this.translate.get('confirm.body').subscribe((value: string) => {
      this.confirmBody = value;
    });
    this.translate.get(`${this.deviceType}.header`).subscribe((value: string) => {
      this.breadcrumbService.publishIsReady([
        {label: value, disabled: true}
      ]);
    });

    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + `devices/registration?${this.deviceType}`);

      this.socketSubscription = stream.subscribe((devices: Array<Anchor | Tag | Sink>) => {
        this.ngZone.run(() => {
          devices.forEach((device: Anchor | Tag | Sink) => {
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

  onItemMoved(movedDevices: Device[]) {
    movedDevices.forEach((device: Device) => {
      device.verified = !device.verified;
      this.deviceService.update(device).subscribe((savedDevice: Device) => {
        this.messageService.success('device.save.success');
      });
    });
  }

  private setPermissions() {
    const prefix: string = DeviceService.getDevicePermissionPrefix(this.deviceType);
    this.createPermission = `${prefix}_CREATE`;
    this.editPermission = `${prefix}_UPDATE`;
    this.deletePermission = `${prefix}_DELETE`;
  }

  private isAlreadyOnAnyList(device: Anchor | Tag | Sink) {
    return this.verified.findIndex((d: Device) => {
        return d.id === device.id;
      }) >= 0 ||
      this.notVerified.findIndex((d: Device) => {
        return d.id === device.id;
      }) >= 0;
  }

  private removeFromList(device: Device) {
    const deviceList = (this.verified.findIndex((d: Device) => {
      return d.id === device.id;
    }) >= 0) ? this.verified : this.notVerified;
    const deviceIndex = deviceList.findIndex((d: Device) => {
      return d.id === device.id;
    });
    CrudHelper.remove(deviceIndex, deviceList);
  }
}

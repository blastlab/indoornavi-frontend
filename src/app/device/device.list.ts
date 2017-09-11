import {Component, Input, OnInit} from '@angular/core';
import * as Collections from 'typescript-collections';
import {MdDialog, MdDialogRef} from '@angular/material';
import {ToastService} from '../utils/toast/toast.service';
import {Device} from './device.type';
import {DeviceService} from './device.service';
import {DeviceDialogComponent} from './device.dialog';


@Component({
  selector: 'app-device-list',
  templateUrl: './device.list.html',
  styleUrls: ['./device.css']
})
export class DeviceListComponent implements OnInit {

  private delPermision: string;
  private editPermision: string;

  @Input()
  verified: boolean;

  @Input()
  public deviceType: string;

  devices: Collections.Dictionary<number, Device> = new Collections.Dictionary<number, Device>();

  dialogRef: MdDialogRef<DeviceDialogComponent>;
  private lockedDevice: Device = null;

  constructor(private deviceService: DeviceService,
              private dialog: MdDialog,
              private toastService: ToastService) {
  }

  ngOnInit() {
    this.deviceService.setUrl(this.deviceType + '/');
    this.setPermisions();
  }

  getDevices(): Device[] {
    return this.devices.values();
  }

  isLocked(device: Device): boolean {
    return this.lockedDevice !== null && device.id === this.lockedDevice.id;
  }

  addToList($event: any): void {
    this.lockedDevice = $event.dragData;
    this.lockedDevice.verified = this.verified;
    this.deviceService.update(this.lockedDevice).subscribe((updated: Device) => {
      this.devices.setValue(updated.id, updated);
      this.lockedDevice = null;
      this.toastService.showSuccess('device.save.success');
    });
  }

  removeFromList($event: any): void {
    const device: Device = $event.dragData;
    this.devices.remove(device.id);
  }
  // this method opens a component dialog and cannot be passed as service
  // in addition this method needs a path that is taken from
  // this.route.snapshot.path that is this component prop
  // similar method is used in DevicesComponent and has the same name
  // this method opens dialog that updates device
  openDialog(device: Device): void {
    this.dialogRef = this.dialog.open(DeviceDialogComponent, {
      data: {
        device: Object.assign({}, device),
        url: `${this.deviceType}/`
      }
    });

    this.dialogRef.afterClosed().subscribe(deviceFromDialog => {
      if (deviceFromDialog !== undefined) {
        this.toastService.showSuccess('device.save.success');
      }
      this.dialogRef = null;
    });
  }

  remove(device: Device): void {
    this.deviceService.remove(device.id).subscribe(() => {
      this.devices.remove(device.id);
      this.toastService.showSuccess('device.remove.success');
    });
  }
  setPermisions(): void {
    switch (this.deviceType) {
      case 'tag':
        this.delPermision =  'TAG_DELETE';
        this.editPermision = 'TAG_UPDATE';
        break;
      case 'anchor':
        this.delPermision =  'ANCHOR_DELETE';
        this.editPermision = 'ANCHOR_UPDATE';
        break;
      case 'sink':
        this.delPermision =  'SINK_DELETE';
        this.editPermision = 'SINK_UPDATE';
        break;
      default:
        this.delPermision =  'TAG_DELETE';
        this.editPermision = 'TAG_UPDATE';
        break;
    }
  }

}

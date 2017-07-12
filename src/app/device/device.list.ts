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

  @Input()
  verified: boolean;

  @Input()
  public deviceType: string;

  devices: Collections.Dictionary<number, Device> = new Collections.Dictionary<number, Device>();

  dialogRef: MdDialogRef<DeviceDialogComponent>;
  private lockedDevice: Device = null;

  constructor(private deviceService: DeviceService, private dialog: MdDialog, private toastService: ToastService) {
  }

  ngOnInit() {
    this.deviceService.setUrl(this.deviceType + '/');
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

  openDialog(device: Device): void {
    this.dialogRef = this.dialog.open(DeviceDialogComponent);
    this.dialogRef.componentInstance.device = {...device}; // copy
    this.dialogRef.componentInstance.url = this.deviceType + '/';

    this.dialogRef.afterClosed().subscribe(anchorFromDialog => {
      if (anchorFromDialog !== undefined) {
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

}

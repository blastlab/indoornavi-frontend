import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {Device} from '../device.type';
import {DeviceService} from '../device.service';
import {ToastService} from '../../shared/utils/toast/toast.service';

@Component({
  templateUrl: './device.dialog.html'
})
export class DeviceDialogComponent implements OnInit {
  device: Device;
  url: string;

  constructor(private dialogRef: MdDialogRef<DeviceDialogComponent>,
              private deviceService: DeviceService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
    this.url = this.dialogRef.config.data['url'];
    this.device = this.dialogRef.config.data['device'];
    if (!this.url) {
      throw Error('You need to set device URL');
    }
    this.deviceService.setUrl(this.url);
  }

  save(valid: boolean): void {
    if (valid) {
      (!this.device.id ? this.deviceService.create(this.device) : this.deviceService.update(this.device))
        .subscribe((savedDevice: Device) => {
            this.dialogRef.close(savedDevice);
          },
          (errorCode: string) => {
            this.toastService.showFailure(errorCode);
          }
        );
    }
  }
}

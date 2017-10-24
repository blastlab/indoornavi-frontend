import {OnInit, Component} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {Device} from './device.type';
import {DeviceService} from './device.service';
import {ToastService} from '../utils/toast/toast.service';
import {Anchor} from './anchor.type';
import {Sink} from './sink.type';

@Component({
  selector: 'app-device-dialog',
  templateUrl: './device.dialog.html',
  styleUrls: ['./device.css']
})
export class DeviceDialogComponent implements OnInit {
  device: Device|Anchor|Sink;
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

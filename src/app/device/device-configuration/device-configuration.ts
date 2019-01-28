import {Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {DeviceService} from '../device.service';
import {Device} from '../device.type';

@Component({
  selector: 'app-device-configuration',
  styleUrls: ['./device-configuration.css'],
  templateUrl: './device-configuration.html',
  encapsulation: ViewEncapsulation.None
})
export class DeviceConfigurationComponent implements OnInit, OnDestroy {

  private subscriptionDestructor: Subject<void> = new Subject<void>();

  @Input() displayDeviceConfig: boolean;
  @Input() deviceType: string;
  @Output() deviceConfigClosed: EventEmitter<boolean> = new EventEmitter<boolean>();
  titleHeader: string;
  device: Device;

  constructor(private deviceService: DeviceService) {}

  ngOnInit() {
    this.titleHeader = `device.details.${this.deviceType}.config`;
    this.setRtfConfig();
    this.deviceService.getDevice()
      .takeUntil(this.subscriptionDestructor)
      .subscribe(device => this.device = device);
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor.unsubscribe();
  }

  closeDeviceConfig(): void {
    this.deviceConfigClosed.emit(false);
  }

  saveDeviceConfig(): void {
    this.closeDeviceConfig();
  }

  private setRtfConfig() {
  }
}

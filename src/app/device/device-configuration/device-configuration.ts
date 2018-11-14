import {Component, OnInit, Input, Output, EventEmitter, OnDestroy} from '@angular/core';
import {DeviceConfigurationService} from '../../shared/services/device-configuration/device-configuration.service';
import {Subject} from 'rxjs/Subject';

@Component({
  selector: 'app-device-configuration',
  templateUrl: './device-configuration.html'
})
export class DeviceConfigurationComponent implements OnInit, OnDestroy {

  private subscribtionDestructor: Subject<void> = new Subject<void>();

  @Input() displayDeviceConfig: boolean;
  @Input() deviceType: string;
  @Output() deviceConfigClosed: EventEmitter<boolean> = new EventEmitter<boolean>();
  titleHeader: string;
  rfsetConfigData: {} = {};

  constructor(private deviceConfigurationService: DeviceConfigurationService) {}

  ngOnInit() {
    this.titleHeader = `device.details.${this.deviceType}.config`;
    this.setRtfConfig();
  }

  ngOnDestroy() {
    this.subscribtionDestructor.next();
    this.subscribtionDestructor.unsubscribe();
  }

  closeDeviceConfig(): void {
    this.deviceConfigClosed.emit(false);
  }

  saveDeviceConfig(): void {
    this.closeDeviceConfig();
  }

  private setRtfConfig() {
    this.deviceConfigurationService.getConfigDevices()
      .takeUntil(this.subscribtionDestructor)
      .subscribe(rtfData => this.rfsetConfigData = rtfData);
  }
}

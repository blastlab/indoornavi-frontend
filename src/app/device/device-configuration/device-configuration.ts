import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';

@Component({
  selector: 'app-device-configuration',
  templateUrl: './device-configuration.html'
})
export class DeviceConfigurationComponent implements OnInit {

  @Input() displayDeviceConfig: boolean;
  @Output() deviceConfigClosed: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {
  }

  closeDeviceConfig(): void {
    this.deviceConfigClosed.emit(false);
  }

  saveDeviceConfig() {
    this.closeDeviceConfig();
  }

}

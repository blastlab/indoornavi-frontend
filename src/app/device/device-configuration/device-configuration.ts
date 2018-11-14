import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {SelectItem} from 'primeng/primeng';

@Component({
  selector: 'app-device-configuration',
  templateUrl: './device-configuration.html'
})
export class DeviceConfigurationComponent implements OnInit {

  @Input() displayDeviceConfig: boolean;
  @Input() deviceType: string;
  @Output() deviceConfigClosed: EventEmitter<boolean> = new EventEmitter<boolean>();
  titleHeader: string;
  rfsetConfigData;

  constructor() {}

  ngOnInit() {
    this.titleHeader = `device.details.${this.deviceType}.config`;
    this.rfsetConfigData = {
      radioChannels: this.radioChannels,
      radioBaudRate: this.radioBaudRate
    };
  }

  closeDeviceConfig(): void {
    this.deviceConfigClosed.emit(false);
  }

  saveDeviceConfig() {
    this.closeDeviceConfig();
  }

  private get radioChannels(): SelectItem[] {
    return [
      { label: '1', value: 1 },
      { label: '2', value: 2 },
      { label: '3', value: 3 },
      { label: '4', value: 4 },
      { label: '5', value: 5 },
      { label: '7', value: 7 }
    ];
  }

  private get radioBaudRate(): SelectItem[] {
    return [
      { label: '110', value: 110 },
      { label: '850', value: 850 },
      { label: '6800', value: 6800 }
    ];
  }
}

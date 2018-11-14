import {Component, Input, OnInit} from '@angular/core';
import {SelectItem} from 'primeng/primeng';

@Component({
  selector: 'app-device-rfset',
  templateUrl: './device-rfset.html'
})
export class DeviceRfsetComponent implements OnInit {

  @Input() rfsetConfigData;
  deviceRfCode = 1;
  deviceSdf = 1;
  deviceNsfdChecked = true;

  constructor() {}

  ngOnInit() {

  }

}

import {Component, Input, OnInit} from '@angular/core';
import {SelectItem} from 'primeng/primeng';

@Component({
  selector: 'app-device-rfset',
  templateUrl: './device-rfset.html'
})
export class DeviceRfsetComponent implements OnInit {

  @Input() rfsetConfigData;

  constructor() {}

  ngOnInit() {

  }

}

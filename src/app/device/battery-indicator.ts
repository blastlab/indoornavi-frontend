import {Component, Input, OnInit} from '@angular/core';


@Component({
  selector: 'app-battery-indicator',
  templateUrl: './battery-indicator.html'
})
export class BatteryIndicatorComponent implements OnInit {
  @Input()
  batteryLevel: number;
  icon: string;
  ngOnInit() {
    if (this.batteryLevel > 90) {
        this.icon = 'fa fa-battery-full';
    } else if (this.batteryLevel > 75) {
      this.icon = 'fa fa-battery-three-quarters';
    } else if (this.batteryLevel > 50) {
      this.icon = 'fa fa-battery-half';
    } else if (this.batteryLevel > 25) {
      this.icon = 'fa fa-battery-quarter';
    } else if (this.batteryLevel > 10) {
      this.icon = 'fa fa-battery-empty';
    }
  }
}

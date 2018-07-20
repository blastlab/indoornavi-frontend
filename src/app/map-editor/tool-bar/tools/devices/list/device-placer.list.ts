import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';


@Component({
  selector: 'app-device-placer-list',
  templateUrl: './devices-list.html'
})
export class DevicePlacerListComponent implements OnInit, OnDestroy {
  public remainingDevices: Array<Anchor | Sink> = [];
  public queryString: string;
  public heightInMeters: number = 2;

  ngOnInit() {

  }

  ngOnDestroy() {

  }
}

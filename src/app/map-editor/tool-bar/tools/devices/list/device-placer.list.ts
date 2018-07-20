import {Component, OnDestroy, OnInit} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DevicePlacerService} from '../device-placer.service';
import {Subscription} from 'rxjs/Subscription';


@Component({
  selector: 'app-device-placer-list',
  templateUrl: './device-placer.list.html'
})
export class DevicePlacerListComponent implements OnInit, OnDestroy {
  public remainingDevices: Array<Anchor | Sink> = [];
  public queryString: string;
  public heightInMeters: number = 2;

  private activationSubscription: Subscription;

  constructor(
    private devicePlacerService: DevicePlacerService
  ) {

  }

  ngOnInit() {
    this.activationSubscription = this.devicePlacerService.onListVisibility.subscribe((visible: boolean): void => {
      console.log(visible);
    });
  }

  ngOnDestroy() {
    this.activationSubscription.unsubscribe();
  }
}

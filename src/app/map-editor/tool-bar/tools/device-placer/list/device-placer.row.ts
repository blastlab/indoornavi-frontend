import {Directive, Input} from '@angular/core';
import {DevicePlacerService} from '../device-placer.service';

@Directive({
  selector: 'tr[appDevicePlacerRow]'
})
export class DevicePlacerRowDirective {

  constructor(private devicePlacerService: DevicePlacerService) {

  }

  @Input()
  set ready(isReady: boolean) {
    if (isReady) {
      this.devicePlacerService.emitTableRendered();
    }
  }

}

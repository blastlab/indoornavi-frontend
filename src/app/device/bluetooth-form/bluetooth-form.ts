import {Component, Input, AfterViewChecked} from '@angular/core';
import {Device} from '../device.type';
import {ChangeDetectorRef} from '@angular/core';

@Component({
  selector: 'app-bluetooth-form',
  templateUrl: './bluetooth-form.html'
})

export class BluetoothFormComponent implements AfterViewChecked {

  @Input() device: Device;

  constructor(private cdRef: ChangeDetectorRef) {}

  ngAfterViewChecked() {
    this.cdRef.detectChanges();
  }

}

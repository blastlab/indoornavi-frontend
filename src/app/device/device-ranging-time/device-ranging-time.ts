import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-ranging-time',
  templateUrl: './device-ranging-time.html'
})
export class DeviceRangingTimeComponent implements OnInit {

  rangingTimeConfigForm: FormGroup;
  selectedType = null;
  disabled: boolean;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createRangingTimeForm();
  }

  changeType(value) {
    this.selectedType = value;
    this.disabled = !this.disabled;
  }

  private createRangingTimeForm(): void {
    this.rangingTimeConfigForm = this.fb.group({
      rangingTimeData: this.fb.group({
        rangingPeriod: 1,
        rangingTimeOneSlot: 2,
        numberOfMeasurement: 3
      })
    });
  }

}

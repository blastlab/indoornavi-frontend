import {Component, OnInit, ViewChild} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-ranging-time',
  templateUrl: './device-ranging-time.html'
})
export class DeviceRangingTimeComponent implements OnInit {

  @ViewChild('rangingTimeOneSlot') rangingTimeOneSlot;
  @ViewChild('numberOfMeasurement') numberOfMeasurement;

  rangingTimeConfigForm: FormGroup;
  isRangingPeriodDisabled = false;
  rangingPeriod = 1;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createRangingTimeForm();
  }

  changeType(value) {
    this.isRangingPeriodDisabled = value === 'time' ? false : true;
    this.calculateRangingPeriod();
  }

  calculateRangingPeriod(): void {
    let numberOfMeasurement = null;
    const rangingTimeOneSlot = this.rangingTimeOneSlot.nativeElement.value;

    if (this.numberOfMeasurement) {
      numberOfMeasurement = this.numberOfMeasurement.nativeElement.value;
    }

    if (!this.isRangingPeriodDisabled) {
      this.rangingPeriod = this.inputRangingPeriod.value;
    } else {
      this.rangingPeriod = rangingTimeOneSlot * numberOfMeasurement;
    }

    this.inputRangingPeriod.setValue(this.rangingPeriod);
  }

  sendToDevice() {
    console.log(this.rangingTimeConfigForm.value);
  }

  get inputRangingPeriod(): AbstractControl {
    return this.rangingTimeConfigForm.get('rangingTimeData.rangingPeriod');
  }

  private createRangingTimeForm(): void {
    this.rangingTimeConfigForm = this.fb.group({
      rangingTimeData: this.fb.group({
        rangingPeriod: 1,
        rangingTimeOneSlot: 1,
        numberOfMeasurement: 1,
        typeRangingTime: 'time'
      })
    });
  }

}

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
  isButtonSendDisabled = true;
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
    this.setIsButtonDisabled(true);
    console.log(this.rangingTimeConfigForm.value);
  }

  resetDevice() {
    this.rangingTimeConfigForm.setValue({
      rangingTimeData: {
        rangingPeriod: 12,
        rangingTimeOneSlot: 6,
        numberOfMeasurement: 2,
        typeRangingTime: this.rangingTimeConfigForm.value.rangingTimeData.typeRangingTime
      }
    });
    this.setIsButtonDisabled(false);
    this.calculateRangingPeriod();
  }

  get inputRangingPeriod(): AbstractControl {
    return this.rangingTimeConfigForm.get('rangingTimeData.rangingPeriod');
  }

  private setIsButtonDisabled(isDisabled: boolean): void {
    this.isButtonSendDisabled = isDisabled;
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

import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-imu',
  templateUrl: './device-imu.html'
})
export class DeviceImuComponent implements OnInit {

  imuConfigForm: FormGroup;
  isButtonSendDisabled = true;
  startDelayBeforeAssleep: number;
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createRfForm();
    this.startDelayBeforeAssleep = this.delayBeforeAssleep;
    this.changeImuForm();
  }

  changeImuForm(): void {
    this.imuConfigForm.valueChanges.subscribe((values) => {
      if (this.startDelayBeforeAssleep !== values.imuData.delayBeforeAssleep) {
        this.setIsButtonDisabled(false);
      }
    });
  }

  sendToDevice(): void {
    this.setIsButtonDisabled(true);
    console.log(this.imuConfigForm.value);
  }

  resetDevice(): void {
    this.imuConfigForm.patchValue({ imuData: { delayBeforeAssleep: 23 } });
    this.setIsButtonDisabled(false);
  }

  get toggleImu(): boolean {
    return this.imuConfigForm.value.imuData.toggleImu;
  }

  set toggleImu(value: boolean) {
    this.imuConfigForm.value.imuData.toggleImu = value;
  }

  get delayBeforeAssleep(): number {
    return this.imuConfigForm.value.imuData.delayBeforeAssleep;
  }

  private setIsButtonDisabled(isDisabled: boolean): void {
    this.isButtonSendDisabled = isDisabled;
  }

  private createRfForm(): void {
    this.imuConfigForm = this.fb.group({
      imuData: this.fb.group({
        toggleImu: false,
        delayBeforeAssleep: 10
      })
    });
  }
}

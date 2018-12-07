import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {ImuData} from '../device.type';

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
  }

  resetDevice(): void {
    const imuData: ImuData = { delayBeforeAssleep: 23 };
    this.imuConfigForm.patchValue({ imuData });
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
    const imuData: ImuData = {
      toggleImu: false,
      delayBeforeAssleep: 10
    };

    this.imuConfigForm = this.fb.group({
      imuData: this.fb.group(imuData)
    });
  }
}

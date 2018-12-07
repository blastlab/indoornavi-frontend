import {Component, OnInit, Input} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {MacData} from '../device.type';

@Component({
  selector: 'app-device-mac',
  templateUrl: './device-mac.html'
})
export class DeviceMacComponent implements OnInit {

  @Input() deviceType: string;
  macConfigForm: FormGroup;
  isButtonSendDisabled = true;
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createMacForm();
  }

  sendToDevice(): void {
    this.setIsButtonDisabled(true);
    console.log(this.macConfigForm.value);
  }

  resetDevice(): void {
    const macData: MacData = {
      beaconTimerInterval: 4,
      slotPeriod: (!this.isDeviceTag) ? 7 : null,
      slotTime: (!this.isDeviceTag) ? 15 : null,
      guardTime: (!this.isDeviceTag) ? 21 : null,
      devicePersonalAreaNetwork: 48392,
      newDeviceAddress: 49283,
      reportAnchorToAnchorDistances: true
    };

    this.setIsButtonDisabled(false);
    this.macConfigForm.patchValue({ macData });
  }

  private setIsButtonDisabled(isDisabled: boolean): void {
    this.isButtonSendDisabled = isDisabled;
  }

  get isDeviceTag(): boolean {
    return this.deviceType === 'tags';
  }

  private createMacForm(): void {
    const macData: MacData = {
      beaconTimerInterval: 1,
      slotPeriod: (!this.isDeviceTag) ? 1 : null,
      slotTime: (!this.isDeviceTag) ? 2 : null,
      guardTime: (!this.isDeviceTag) ? 3 : null,
      devicePersonalAreaNetwork: 46562,
      newDeviceAddress: 15426,
      reportAnchorToAnchorDistances: false
    };

    this.macConfigForm = this.fb.group({
      macData: this.fb.group(macData)
    });
  }
}

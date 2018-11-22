import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-mac',
  templateUrl: './device-mac.html'
})
export class DeviceMacComponent implements OnInit {

  macConfigForm: FormGroup;
  isButtonSendDisabled = true;
  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createMacForm();
  }

  sendToDevice(): void {
    this.setIsButtonDisabled(true);
  }

  resetDevice(): void {
    this.setIsButtonDisabled(false);
  }

  private setIsButtonDisabled(isDisabled: boolean): void {
    this.isButtonSendDisabled = isDisabled;
  }

  private createMacForm(): void {
    this.macConfigForm = this.fb.group({
      macData: this.fb.group({

      })
    });
  }
}

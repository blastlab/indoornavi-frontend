import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-rfset',
  templateUrl: './device-rfset.html'
})
export class DeviceRfsetComponent implements OnInit {

  @Input() rfsetConfigData;
  rfConfigForm: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createRfForm();
  }

  sendToDevice(): void {
    console.log(this.rfConfigForm.value);
  }

  resetDevice(): void {
    this.rfConfigForm.patchValue({ rfData: this.defaultRfConfig});
  }

  private createRfForm(): void {
    this.rfConfigForm = this.fb.group({
      rfData: this.fb.group({
        radioChannel: 2,
        radioBaudRate: 850,
        preambleLength: 256,
        pulseRepetitionFrequency: 64,
        preambleAcquisitionChunk: 32,
        communicationCode: 5,
        sfd: 5,
        nsfd: false
      })
    });
  }

  get defaultRfConfig() {
    return {
      radioChannel: 2,
      radioBaudRate: 850,
      preambleLength: 256,
      pulseRepetitionFrequency: 64,
      preambleAcquisitionChunk: 32,
      communicationCode: 5,
      sfd: 5,
      nsfd: false
    }
  }

}

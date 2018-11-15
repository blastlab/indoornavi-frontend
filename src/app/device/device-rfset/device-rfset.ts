import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {DeviceConfigurationService} from '../../shared/services/device-configuration/device-configuration.service';

@Component({
  selector: 'app-device-rfset',
  templateUrl: './device-rfset.html'
})
export class DeviceRfSetComponent implements OnInit {

  @Input() rfsetConfigData;
  rfConfigForm: FormGroup;
  rfDefaultData;
  isButtonSendDisabled = true;

  constructor(
    private fb: FormBuilder,
    private deviceConfigurationService: DeviceConfigurationService
  ) {}

  ngOnInit() {
    this.createRfForm();
    this.setDefaultRfConfig();
    this.rfConfigForm.valueChanges.subscribe(() => this.isButtonSendDisabled = false );
  }

  sendToDevice(): void {
    console.log(this.rfConfigForm.value);
    this.isButtonSendDisabled = true;
  }

  resetDevice(): void {
    this.rfConfigForm.patchValue({ rfData: this.rfDefaultData });
  }

  private createRfForm(): void {
    this.rfConfigForm = this.fb.group({
      rfData: this.fb.group({
        radioChannel: 5,
        radioBaudRate: 6800,
        preambleLength: 1546,
        pulseRepetitionFrequency: 16,
        preambleAcquisitionChunk: 16,
        communicationCode: 100,
        sfd: 100,
        nsfd: true
      })
    });
  }

  private setDefaultRfConfig(): void {
    this.deviceConfigurationService.getDefaultConfigDevices()
      .subscribe(rfDefaultData => this.rfDefaultData = rfDefaultData)
  }

}

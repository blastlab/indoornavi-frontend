import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-rfset',
  templateUrl: './device-rfset.html',
  styleUrls: ['./device-rfset.css']
})
export class DeviceRfSetComponent implements OnInit {

  rfsetConfigData: {} = {};
  rfConfigForm: FormGroup;
  isButtonSendDisabled = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.rfsetConfigurationData();
    this.createRfForm();
    this.rfConfigForm.valueChanges.subscribe(() => this.isButtonSendDisabled = false );
  }

  sendToDevice(): void {
    console.log(this.rfConfigForm.value);
    this.isButtonSendDisabled = true;
  }

  resetDevice(): void {
    this.rfConfigForm.patchValue({ rfData: {
        radioChannel: 3,
        radioBaudRate: 850,
        preambleLength: 512,
        pulseRepetitionFrequency: 64,
        preambleAcquisitionChunk: 32,
        communicationCode: 5,
        sfd: 483,
        nsfd: false
      }});
  }

  private createRfForm(): void {
    this.rfConfigForm = this.fb.group({
      rfData: this.fb.group({
        radioChannel: 5,
        radioBaudRate: 6800,
        preambleLength: 1546,
        pulseRepetitionFrequency: 16,
        preambleAcquisitionChunk: 16,
        communicationCode: 21,
        sfd: 100,
        nsfd: true
      })
    });
  }

  private rfsetConfigurationData() {
    this.rfsetConfigData = {
      radioChannels: [
        { label: '1', value: 1 }, { label: '2', value: 2 }, { label: '3', value: 3 }, { label: '4', value: 4 }, { label: '5', value: 5 }, { label: '7', value: 7 }
      ],
      radioBaudRate: [
        { label: '110', value: 110 }, { label: '850', value: 850 }, { label: '6800', value: 6800 }
      ],
      preambleLength: [
        { label: '64', value: 64 }, { label: '128', value: 128 }, { label: '256', value: 256 },
        { label: '512', value: 512 }, { label: '1024', value: 1024 }, { label: '1546', value: 1546 }, { label: '2048', value: 2048 }, { label: '4096', value: 4096 }
      ],
      pulseRepetitionFrequency: [
        { label: '16', value: 16 }, { label: '64', value: 64 }
      ],
      preambleAcquisitionChunk: [
        { label: '8', value: 8 }, { label: '16', value: 16 }, { label: '32', value: 32 }, { label: '64', value: 64 }
      ]
    };
  }

}

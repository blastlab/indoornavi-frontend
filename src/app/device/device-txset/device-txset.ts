import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import { TxConfigData, TxPower } from '../device.type';

@Component({
  selector: 'app-device-txset',
  templateUrl: './device-txset.html'
})
export class DeviceTxSetComponent implements OnInit {

  readonly divideByStep = 2;
  txConfigForm: FormGroup;
  isButtonSendDisabled = true;
  powerTransmitter1: number;
  powerTransmitter2: number;
  powerTransmitter3: number;
  powerTransmitter4: number;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createTxForm();
    this.setSumDefaultPower();

    this.txConfigForm.valueChanges.subscribe(() => {
      this.setIsButtonDisabled(false);
      this.setSumDefaultPower();
    });
  }

  sendTxDataToDevice(): void {
    const { transmitterFine1, transmitterFine2, transmitterFine3, transmitterFine4 } = this.txConfigForm.value.txPower as TxPower;
    const txConfigData: TxConfigData = {
      txPower: {
        ...this.txConfigForm.value.txPower,
        transmitterFine1: this.calculateDatabaseTransmitterFine(transmitterFine1, this.dividePNFByStep),
        transmitterFine2: this.calculateDatabaseTransmitterFine(transmitterFine2, this.dividePNFByStep),
        transmitterFine3: this.calculateDatabaseTransmitterFine(transmitterFine3, this.dividePNFByStep),
        transmitterFine4: this.calculateDatabaseTransmitterFine(transmitterFine4, this.dividePNFByStep)
      }
    };
    console.log(txConfigData);
    this.setIsButtonDisabled(true);
  }

  setTxDeviceDefault(): void {
    this.setTxDefaultData();
    this.setIsButtonDisabled(false);
  }

  get dividePNFByStep() {
    return this.divideByStep;
  }

  private setIsButtonDisabled(isDisabled: boolean): void {
    this.isButtonSendDisabled = isDisabled;
  }

  private setSumDefaultPower(): void {
    const {
      transmitterCoarse1, transmitterFine1,
      transmitterCoarse2, transmitterFine2,
      transmitterCoarse3, transmitterFine3,
      transmitterCoarse4, transmitterFine4
    } = this.txConfigForm.value.txPower as TxPower;

    this.powerTransmitter1 = this.calculateTransmitterCoarse(transmitterCoarse1, transmitterFine1);
    this.powerTransmitter2 = this.calculateTransmitterCoarse(transmitterCoarse2, transmitterFine2);
    this.powerTransmitter3 = this.calculateTransmitterCoarse(transmitterCoarse3, transmitterFine3);
    this.powerTransmitter4 = this.calculateTransmitterCoarse(transmitterCoarse4, transmitterFine4);
  }

  private calculateStepTransmitterFine(power: number, step: number): number {
    return power * step;
  }

  private calculateDatabaseTransmitterFine(power: number, step: number): number {
    return power / step;
  }

  private calculateTransmitterCoarse(transmitterFine: number, transmitterCoarse: number): number {
    return transmitterFine + transmitterCoarse / this.dividePNFByStep;
  }

  private createTxForm(): void {
    const txPower: FormGroup = this.fb.group({
      transmitterCoarse1: null,
      transmitterFine1: null,
      transmitterCoarse2: null,
      transmitterFine2: null,
      transmitterCoarse3: null,
      transmitterFine3: null,
      transmitterCoarse4: null,
      transmitterFine4: null
    });

    this.txConfigForm = this.fb.group({ txPower });

    this.setTxDataFromDataBase();
  }

  private setTxDefaultData(): void {
    const txPower: TxPower = {
      transmitterCoarse1: 6,
      transmitterFine1: this.calculateStepTransmitterFine(10.5, this.dividePNFByStep),
      transmitterCoarse2: 9,
      transmitterFine2: this.calculateStepTransmitterFine(3.5, this.dividePNFByStep),
      transmitterCoarse3: 3,
      transmitterFine3: this.calculateStepTransmitterFine(12.5, this.dividePNFByStep),
      transmitterCoarse4: 12,
      transmitterFine4: this.calculateStepTransmitterFine(4.5, this.dividePNFByStep)
    };

    this.txConfigForm.patchValue({ txPower });
  }

  private setTxDataFromDataBase(): void {
    const txPower: TxPower = {
      transmitterCoarse1: 8,
      transmitterFine1: this.calculateStepTransmitterFine(5, this.dividePNFByStep),
      transmitterCoarse2: 6,
      transmitterFine2: this.calculateStepTransmitterFine(10.5, this.dividePNFByStep),
      transmitterCoarse3: 9,
      transmitterFine3: this.calculateStepTransmitterFine(2.5, this.dividePNFByStep),
      transmitterCoarse4: 3,
      transmitterFine4: this.calculateStepTransmitterFine(14.5, this.dividePNFByStep)
    };

    this.txConfigForm.setValue({ txPower });
  }
}

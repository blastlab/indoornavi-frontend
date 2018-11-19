import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-device-txset',
  templateUrl: './device-txset.html'
})
export class DeviceTxSetComponent implements OnInit {

  readonly divideByStep = 2;
  txConfigForm: FormGroup;
  isButtonSendDisabled = true;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.createTxForm();
    this.txConfigForm.valueChanges.subscribe(() => this.setIsButtonDisabled(false));
  }

  sendTxDataToDevice(): void {
    const { p1f, p2f, p3f, p4f }  = this.txConfigForm.value.txPower;
    const txConfigData = {
      txPower: {
        ...this.txConfigForm.value.txPower,
        p1f: this.calculateDatabasePf(p1f, this.dividePNFByStep),
        p2f: this.calculateDatabasePf(p2f, this.dividePNFByStep),
        p3f: this.calculateDatabasePf(p3f, this.dividePNFByStep),
        p4f: this.calculateDatabasePf(p4f, this.dividePNFByStep)
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

  private calculateStepPf(power: number, step: number): number {
    return power * step;
  }

  private calculateDatabasePf(power: number, step: number): number {
    return power / step;
  }

  private createTxForm(): void {
    this.txConfigForm = this.fb.group({
      txPower: this.fb.group({
        p1c: null,
        p1f: null,
        p2c: null,
        p2f: null,
        p3c: null,
        p3f: null,
        p4c: null,
        p4f: null
      })
    });

    this.setTxDataFromDataBase();
  }

  private setTxDefaultData(): void {
    this.txConfigForm.patchValue({
      txPower: {
        p1c: 6,
        p1f: this.calculateStepPf(10.5, this.dividePNFByStep),
        p2c: 9,
        p2f: this.calculateStepPf(3.5, this.dividePNFByStep),
        p3c: 3,
        p3f: this.calculateStepPf(12.5, this.dividePNFByStep),
        p4c: 12,
        p4f: this.calculateStepPf(4.5, this.dividePNFByStep)
      }
    });
  }

  private setTxDataFromDataBase(): void {
    this.txConfigForm.setValue({
      txPower: {
        p1c: 8,
        p1f: this.calculateStepPf(5, this.dividePNFByStep),
        p2c: 6,
        p2f: this.calculateStepPf(10.5, this.dividePNFByStep),
        p3c: 9,
        p3f: this.calculateStepPf(2.5, this.dividePNFByStep),
        p4c: 3,
        p4f: this.calculateStepPf(14.5, this.dividePNFByStep)
      }
    });
  }
}

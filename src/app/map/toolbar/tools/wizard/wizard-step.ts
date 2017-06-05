import {Point} from '../../../map.type';
import {EventEmitter} from '@angular/core';
import {StepMsg, WizardData} from './wizard';
import {MdDialogRef} from '@angular/material';
import {DialogComponent} from '../../../../utils/dialog/dialog.component';
export interface WizardStep {
  nextStepIndex: EventEmitter<number>;
  clearView: EventEmitter<boolean>;
  dialogRef: MdDialogRef<DialogComponent>;
  stepIndex: number;
  load(msg: String): void;
  openDialog(): void;
  placeOnMap(data: any): void;
  clean(): void;
  closeWizard(): void;
  prepareToSend(wizardData: WizardData): StepMsg;
  makeDecision(where: Point): void;
}

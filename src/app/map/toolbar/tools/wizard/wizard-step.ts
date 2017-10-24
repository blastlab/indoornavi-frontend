import {Point} from '../../../map.type';
import {EventEmitter} from '@angular/core';
import {MdDialog, MdDialogRef} from '@angular/material';
import {SocketMessage, WizardData} from './wizard.type';

export interface WizardStep {
  nextStepIndex: EventEmitter<number>;
  clearView: EventEmitter<boolean>;
  title: string;
  dialogRef: MdDialogRef<MdDialog>;
  stepIndex: number;
  load(msg: String): void;
  openDialog(): void;
  placeOnMap(data: any): void;
  clean(): void;
  closeWizard(clean: boolean): void;
  prepareToSend(wizardData: WizardData): SocketMessage;
  goToNextStep(): void;
  updateWizardData(wizardData: WizardData): WizardData;
  makeDecision(where: Point): void;
}

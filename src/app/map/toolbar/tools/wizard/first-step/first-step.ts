import {Component} from '@angular/core';
import {WizardStep} from '../wizard-step';
import {MdDialog} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {DialogComponent} from '../../../../../utils/dialog/dialog.component';
// import {SecondStep} from '../second-step/second-step';
import * as d3 from 'd3';

@Component({
  selector: 'app-first-step',
  templateUrl: '../wizard-step.html',
  styleUrls: ['../wizard-step.css']
})
export class FirstStepComponent implements WizardStep {
  public title = 'Wizard first message title';

  constructor(public dialog: MdDialog,
              public translate: TranslateService) {
  }

  public load(msg: String): void {
    console.log('FS');
    console.log(msg);
  }

  public openDialog(): void {

  }

  public placeDevice(): void {
    console.log('FS');
    console.log('FS');
  }

  public clean(): void {
    console.log('FSclean');
  }

  public prepareToSend(): void {
    console.log('FSprepareToSend');
  }

  public nextStep(step: WizardStep): void {
    console.log('FS');
    console.log(step);
  }

}

import {Component, EventEmitter, NgZone, Output, TemplateRef, ViewChild} from '@angular/core';
import {ToolName} from '../tools.enum';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs/Rx';
import {ToastService} from '../../../../utils/toast/toast.service';
import {Config} from '../../../../../config';
import {SocketService} from '../../../../utils/socket/socket.service';
import {WizardStep} from './wizard-step';
import {Point} from '../../../map.type';
import {FirstStepComponent} from './first-step/first-step';
import {SecondStepComponent} from './second-step/second-step';
import {ThirdStepComponent} from './third-step/third-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {HintBarService} from '../../../hint-bar/hint-bar.service';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.html',
  styleUrls: ['../tool.css']
})
export class WizardComponent implements Tool {

  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public toolEnum: ToolName = ToolName.WIZARD; // used in hint-bar component as a toolName
  public hintMessage: string;
  public active: boolean = false;
  public activeStep: WizardStep;
  public wizardCompleted: boolean;
  private socketSubscription: Subscription;
  private wizardData: WizardData;
  private steps: Array<WizardStep> = [];
  @ViewChild('firstStep') firstStep: FirstStepComponent;
  @ViewChild('secondStep') secondStep: SecondStepComponent;
  @ViewChild('thirdStep') thirdStep: ThirdStepComponent;
  @ViewChild(TemplateRef) dialogTemplate: TemplateRef<any>;

  dialogRef: MdDialogRef<MdDialog>;

  constructor(private socketService: SocketService,
              public translate: TranslateService,
              public dialog: MdDialog,
              private toastService: ToastService,
              private ngZone: NgZone,
              private hintBar: HintBarService) {
    this.setTranslations();
  }

  public emitToggleActive(): void {
    this.clicked.emit(this);
  }

  public setActive(): void {
    this.active = true;
    this.initWizard();
    this.wizardCompleted = false;
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private initWizard(): void {
    this.steps = [this.firstStep, this.secondStep, this.thirdStep];
    this.activeStep = this.firstStep;
    this.activeStep.openDialog();
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'wizard');
      this.socketSubscription = stream.subscribe((socketMsg: any) => {
        this.ngZone.run(() => {
          this.activeStep.load(socketMsg);
        });
      });
    });
  }

  public setInactive(): void {
    if (!this.wizardCompleted) {
      this.cleanAll();
    }
    this.hintBar.publishHint(null);
    this.active = false;
    this.destroySocket();
  }

  private cleanAll(): void {
    let stepIndex = this.activeStep.stepIndex;
    while (stepIndex >= 0) {
      this.steps[stepIndex].clean();
      stepIndex--;
    }
  }

  private destroySocket(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  public wizardNextStep(nextStepIndex: number): void {
    if (nextStepIndex === this.steps.length) {
      this.wizardCompleted = true;
      this.dialogRef = this.dialog.open(this.dialogTemplate);
      this.dialogRef.afterClosed().subscribe(() => {
        this.emitToggleActive();
      });
    } else {
      this.wizardData = this.activeStep.updateWizardData(this.wizardData);
      const message: SocketMsg = this.activeStep.prepareToSend(this.wizardData);
      this.socketService.send(message);
      this.activeStep = this.steps[nextStepIndex];
      this.activeStep.openDialog();
    }
  }

  public wizardStopped(endWizard: boolean) {
    if (endWizard === true) {
      this.cleanAll();
      this.dialogRef.close();
      this.emitToggleActive();
    } else {
      this.dialogRef = this.dialog.open(this.dialogTemplate, {disableClose: true});
      this.dialogRef.afterClosed().subscribe(() => {
        this.dialogRef = null;
      });
    }
  }

  public backToWizard() {
    this.dialogRef.close();
    this.activeStep.openDialog();
  }

  public manualAnchors() {
    this.dialogRef.close();
    this.emitToggleActive();
  }

  public wizardAnchors() {
    this.dialogRef.close();
    this.emitToggleActive();
  }

}
export interface SocketMsg {
  sinkShortId: number;
  sinkPosition: Point;
  anchorShortId: number;
  degree: number;
}

export interface WizardData extends SocketMsg {
  firstAnchorPosition: Point;
  secondAnchorPosition: Point;
}


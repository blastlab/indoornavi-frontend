import {Component, EventEmitter, Input, NgZone, Output, TemplateRef, ViewChild} from '@angular/core';
import {ToolName} from '../tools.enum';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs/Rx';
import {Config} from '../../../../../config';
import {SocketService} from '../../../../utils/socket/socket.service';
import {WizardStep} from './wizard-step';
import {FirstStepComponent} from './first-step/first-step';
import {SecondStepComponent} from './second-step/second-step';
import {ThirdStepComponent} from './third-step/third-step';
import {MdDialog, MdDialogRef} from '@angular/material';
import {HintBarService} from '../../../hint-bar/hint-bar.service';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {SocketMessage, WizardData} from './wizard.type';
import {Floor} from '../../../../floor/floor.type';

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.html',
  styleUrls: ['../tool.css']
})
export class WizardComponent implements Tool {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
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
  @Input() floor: Floor;

  dialogRef: MdDialogRef<MdDialog>;

  constructor(private socketService: SocketService,
              public translate: TranslateService,
              public dialog: MdDialog,
              private ngZone: NgZone,
              private hintBar: HintBarService,
              private configurationService: ActionBarService) {
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

  public setInactive(): void {
    if (!this.wizardCompleted) {
      this.cleanAll();
    }
    this.translate.get('hint.chooseTool').subscribe((value: string) => {
      this.hintBar.publishHint(value);
    });
    this.active = false;
    this.destroySocket();
  }

  public getToolName(): ToolName {
    return ToolName.WIZARD;
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
    this.wizardData = this.activeStep.updateWizardData(this.wizardData);
    const message: SocketMessage = this.activeStep.prepareToSend(this.wizardData);
    this.socketService.send(message);

    if (nextStepIndex === this.steps.length) {
      this.wizardCompleted = true;

      const anchors: Anchor[] = [];
      anchors.push(<Anchor>{
        shortId: this.wizardData.firstAnchorShortId,
        x: this.wizardData.firstAnchorPosition.x,
        y: this.wizardData.firstAnchorPosition.y
      });
      anchors.push(<Anchor>{
        shortId: this.wizardData.secondAnchorShortId,
        x: this.wizardData.secondAnchorPosition.x,
        y: this.wizardData.secondAnchorPosition.y
      });
      this.configurationService.setSink(<Sink>{
        shortId: this.wizardData.sinkShortId,
        x: this.wizardData.sinkPosition.x,
        y: this.wizardData.sinkPosition.y,
        anchors: anchors
      });

      this.dialogRef = this.dialog.open(this.dialogTemplate);
      this.dialogRef.afterClosed().subscribe(() => {
        this.emitToggleActive();
      });

      this.firstStep.socketData.clear();
      this.cleanAll();

    } else {
      this.activeStep = this.steps[nextStepIndex];
      this.activeStep.openDialog();
    }
  }

  public wizardStopped(endWizard: boolean) {
    if (endWizard) {
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

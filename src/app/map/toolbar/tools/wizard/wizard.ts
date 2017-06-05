import {Component, EventEmitter, NgZone, Output, ViewChild} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
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

@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.html',
  styleUrls: ['../tool.css']
})
export class WizardComponent implements Tool {
  @Output() clickedWizard: EventEmitter<Tool> = new EventEmitter<Tool>();
  public toolEnum: ToolsEnum = ToolsEnum.WIZARD; // used in hint-bar component as a toolName
  public hintMessage: string;
  public active: boolean = false;
  public activeStep: WizardStep;
  private socketSubscription: Subscription;
  private wizardData: WizardData;
  private steps: Array<WizardStep> = [];
  @ViewChild('firstStep') firstStep: FirstStepComponent;
  @ViewChild('secondStep') secondStep: SecondStepComponent;
  @ViewChild('thirdStep') thirdStep: ThirdStepComponent;

  constructor(private socketService: SocketService,
              public translate: TranslateService,
              private toastService: ToastService,
              private ngZone: NgZone) {
  }

  private initSocket(): void {
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

  private destroySocket(): void {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  public toolClicked(): void {
    this.clickedWizard.emit(this);
  }

  public setActive(): void {
    this.setTranslations();
    this.active = true;
    this.initSocket();
  }

  public setInactive(): void {
    this.cleanAll();
    this.active = false;
    this.destroySocket();
  }

  public closeWizard(): void {
    this.toolClicked();
  }

  private cleanAll(): void {
    let stepIndex = this.activeStep.stepIndex;
    while (stepIndex >= 0) {
      this.steps[stepIndex].clean();
      stepIndex--;
    }
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  public wizardNextStep(nextStepIndex: number): void {
    if (nextStepIndex === this.steps.length) {
      this.toolClicked();
    } else {
      const message: StepMsg = this.activeStep.prepareToSend(this.wizardData);
      this.socketService.send(this.handleMessage(message));
      this.activeStep = this.steps[nextStepIndex];
      this.activeStep.openDialog();
    }
  }

  private handleMessage(msg): SocketMsg {
    this.wizardData = msg.wizardData;
    console.log(msg.socketData);
    return msg.socketData;
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
export interface StepMsg {
  socketData: SocketMsg;
  wizardData: WizardData;
}

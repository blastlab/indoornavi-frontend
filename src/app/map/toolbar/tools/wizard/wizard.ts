import {Component, EventEmitter, NgZone, Output, ViewChild, TemplateRef} from '@angular/core';
import {ToolsEnum} from '../tools.enum';
import {Tool} from '../tool';
import {TranslateService} from '@ngx-translate/core';
import {Subscription} from 'rxjs/Rx';
import {ToastService} from '../../../../utils/toast/toast.service';
import {Config} from '../../../../../config';
import {SocketService} from '../../../../utils/socket/socket.service';
import {WizardStep} from './wizard-step';
import {FirstStepComponent} from './first-step/first-step';

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
  private previousSteps: Array<WizardStep>;

  constructor(private socketService: SocketService,
              public translate: TranslateService,
              private toastService: ToastService,
              private ngZone: NgZone,
              private firstStep: FirstStepComponent) {
  }

  private initSocket(): void {
    this.wizardNextStep(this.firstStep, false);
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'wizard');
      this.socketSubscription = stream.subscribe((socketMsg: any) => {
        this.ngZone.run(() => {
          this.activeStep.load(socketMsg); // TODO remove comments
          /*console.log(socketMsg);
          if (!this.canceledWizard) {
            if (this.wizardStep === 1) {
              Collections.arrays.forEach(socketMsg, (sink: Anchor) => {
                this.sinks.add(sink);
              });
              this.isLoading = (!this.sinks.size());
            } else if (this.wizardStep === 2) {
              this.anchors.add(socketMsg);
              this.isLoading = false;
            }
          }*/
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
    this.active = false;
    this.cleanAll();
    this.destroySocket();
  }

  private cleanAll() {
    console.log('clean all steps');
    // iterate over previous steps -> calling step.clean() TODO delete comments
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('wizard.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private wizardNextStep(step: WizardStep, lastStep: boolean): void {
    if (lastStep) {
      this.toolClicked();
    } else {
      this.activeStep = step;
    }
  }
}

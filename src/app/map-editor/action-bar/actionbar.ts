import {ChangeDetectorRef, Component, HostListener, Input, NgZone, OnDestroy, OnInit} from '@angular/core';
import {ActionBarService} from './actionbar.service';
import {Floor} from '../../floor/floor.type';
import {MapLoaderInformerService} from '../../shared/services/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Timer} from '../../shared/utils/timer/timer';
import {TranslateService} from '@ngx-translate/core';
import {Configuration} from './actionbar.type';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../../shared/services/message/message.service';
import {animate, state, style, transition, trigger} from '@angular/animations';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.html',
  styleUrls: ['./actionbar.css'],
  animations: [
    trigger('draftStateAnimation', [
      state('visible', style({
        transform: 'translateX(0)'
      })),
      state('hidden', style({
        transform: 'translateX(-100%)'
      })),
      transition('hidden => visible', animate(600)),
      transition('visible => hidden', animate(200))
    ])
  ]
})
export class ActionBarComponent implements OnInit, OnDestroy {
  public static SAVE_DRAFT_TIMEOUT = 3000;
  public publishButtonDisabled = true;
  public saveButtonDisabled = true;
  public resetButtonDisabled = true;
  @Input() floor: Floor;
  private mapLoadedSubscription: Subscription;
  private configurationLoadedSubscription: Subscription;
  private configurationChangedSubscription: Subscription;
  private timer: Timer;

  public draftState: string = 'hidden';
  public draftStateText: string;
  private savedText: string;
  private savingText: string;

  // pre undo dialog data
  private undoDialogBody: string;
  private undoDialogBodyDate: string;
  private undoDialogBodyInitial: string;
  public undoTooltip: string;
  private undoTooltipPrevious: string;
  private undoTooltipInitial: string;

  private static shouldBeDisabled(configuration: Configuration) {
    if (configuration.publishedDate === null && configuration.savedDraftDate === null) {
      return true;
    }

    return configuration.publishedDate !== null;
  }

  constructor(private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private ngZone: NgZone,
              private confirmationService: ConfirmationService,
              private cd: ChangeDetectorRef,
              private translateService: TranslateService,
              private messageService: MessageServiceWrapper) {
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');

    this.translateService.get('configuration.saved').subscribe((value: string) => {
      this.savedText = value;
    });

    this.translateService.get('configuration.saving').subscribe((value: string) => {
      this.savingText = value;
    });

    this.translateService.get('configuration.preUndoConfirmDialog.body').subscribe((value: string) => {
      this.undoDialogBodyDate = value;
    });

    this.translateService.get('configuration.preUndoConfirmDialogNoPublication.body').subscribe((value: string) => {
      this.undoDialogBodyInitial = value;
    });

    this.translateService.get('configuration.undoInitial').subscribe((value: string) => {
      this.undoTooltipInitial = value;
    });

    this.translateService.get('configuration.undoPrevious').subscribe((value: string) => {
      this.undoTooltipPrevious = value;
    });

    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe(() => {
      this.configurationService.loadConfiguration(this.floor);
    });

    this.configurationLoadedSubscription = this.configurationService.configurationLoaded().subscribe((configuration: Configuration) => {
      const disabled = ActionBarComponent.shouldBeDisabled(configuration);
      this.publishButtonDisabled = disabled;
      this.resetButtonDisabled = disabled;

      this.updateUndoDialogBody(configuration.publishedDate);
      if (!!configuration.savedDraftDate) {
        this.showSaved(configuration.savedDraftDate);
      }

      this.ngZone.runOutsideAngular(() => {
        this.timer = new Timer(() => {
          this.configurationService.saveDraft().then(() => {
            this.ngZone.run(() => {
              this.afterSaveDraftDone();
            });
          });
        }, ActionBarComponent.SAVE_DRAFT_TIMEOUT);
      });

      this.configurationChangedSubscription = this.configurationService.configurationChanged().subscribe(() => {
        this.saveButtonDisabled = false;
        this.showSaving();
        this.ngZone.runOutsideAngular(() => {
          this.timer.restart();
        });
      });
    });
  }

  ngOnDestroy(): void {
    if (!!this.configurationLoadedSubscription) {
      this.configurationLoadedSubscription.unsubscribe();
    }
    if (!!this.mapLoadedSubscription) {
      this.mapLoadedSubscription.unsubscribe();
    }
    if (!!this.configurationChangedSubscription) {
      this.configurationChangedSubscription.unsubscribe();
    }
    if (!!this.timer) {
      this.timer.stop();
    }
    if (!!this.cd) {
      this.cd.detach();
    }

    this.configurationService.clear();
  }

  @HostListener('document:keydown.enter', [])
  handleEnter(): void {
    if (!this.saveButtonDisabled) {
      this.saveDraft();
    }
  }

  public saveDraft(): void {
    this.configurationService.saveDraft().then(() => {
      this.afterSaveDraftDone();
    });
  }

  public resetToPreviousPublication(): void {
    this.confirmationService.confirm({
      message: this.undoDialogBody,
      key: 'preUndo',
      accept: () => {
        this.configurationService.undo().then((configuration: Configuration) => {
          const disabled = ActionBarComponent.shouldBeDisabled(configuration);
          this.publishButtonDisabled = disabled;
          this.resetButtonDisabled = disabled;
          this.updateUndoDialogBody(configuration.publishedDate);
          if (!!configuration.savedDraftDate) {
            this.showSaved(configuration.savedDraftDate);
          } else {
            this.draftState = 'hidden';
          }
        });
      }
    });
  }

  public publish(): void {
    this.configurationService.publish().subscribe(() => {
      this.afterPublishDone();
    });
  }

  private showSaving() {
    this.draftStateText = this.savingText;
    this.draftState = 'visible';
  }

  private showSaved(date: Date) {
    this.draftStateText = this.savedText.replace('{{date}}', date.toLocaleString());
    this.draftState = 'visible';
  }

  private afterSaveDraftDone(): void {
    this.showSaved(new Date());
    this.resetButtonDisabled = false;
    this.publishButtonDisabled = false;
    this.saveButtonDisabled = true;
    this.messageService.success('configuration.saveDraft.success');
    this.cd.detectChanges();
  }

  private afterPublishDone(): void {
    this.publishButtonDisabled = true;
    this.resetButtonDisabled = true;
    this.saveButtonDisabled = true;
    this.updateUndoDialogBody(new Date());
    this.messageService.success('configuration.publish.success');
    this.cd.detectChanges();
  }

  private updateUndoDialogBody(date?: Date): void {
    if (!!this.configurationService.getLatestPublishedConfiguration() || !!date) {
      date = !!date ? date : this.configurationService.getLatestPublishedConfiguration().publishedDate;
      this.undoDialogBody = this.undoDialogBodyDate.replace('{{date}}', date.toLocaleString());
      this.undoTooltip = this.undoTooltipPrevious;
    } else {
      this.undoDialogBody = this.undoDialogBodyInitial;
      this.undoTooltip = this.undoTooltipInitial;
    }
  }

}

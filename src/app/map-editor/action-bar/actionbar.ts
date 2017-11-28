import {animate, ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit, state, style, transition, trigger, ViewChild} from '@angular/core';
import {ActionBarService} from './actionbar.service';
import {Floor} from '../../floor/floor.type';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Timer} from '../../utils/timer/timer';
import {PublishedDialogComponent} from '../../publications/dialog/published.dialog';
import {PublishedMap} from '../../map-viewer/published.type';
import {TranslateService} from '@ngx-translate/core';
import {Configuration} from './actionbar.type';
import {ConfirmationService} from 'primeng/primeng';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.html',
  styleUrls: ['./actionbar.css'],
  /*
  TODO: fix deprecated of animations
   */
  animations: [
    trigger('messageState', [
      state('visible', style({opacity: 1, transform: 'scale(1.0)'})),
      state('hidden', style({opacity: 0, transform: 'scale(0.0)'})),
      transition('hidden <=> visible', animate(ActionBarService.SAVE_DRAFT_ANIMATION_TIME + 'ms')),
    ])
  ]
})
export class ActionBarComponent implements OnInit, OnDestroy {
  public static SAVE_DRAFT_TIMEOUT = 3000;
  public publishButtonDisabled = true;
  public saveButtonDisabled = true;
  public resetButtonDisabled = true;
  public messageSpanState: string = 'hidden';
  @Input() floor: Floor;
  private isAnimationDone: boolean = true;
  private mapLoadedSubscription: Subscription;
  private configurationLoadedSubscription: Subscription;
  private configurationChangedSubscription: Subscription;
  private timer: Timer;

  @ViewChild(PublishedDialogComponent)
  private publishedMapDialog: PublishedDialogComponent;

  // pre publish dialog data
  private publishConfirmButtonText: string;
  private publishCancelButtonText: string;
  private publishDialogBody: string;

  // pre undo dialog data
  private undoConfirmButtonText: string;
  private undoCancelButtonText: string;
  private undoDialogBody: string;

  constructor(private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private ngZone: NgZone,
              private cd: ChangeDetectorRef,
              private translateService: TranslateService,
              private confirmationService: ConfirmationService) {
  }

  ngOnInit() {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe(() => {
      this.configurationService.loadConfiguration(this.floor);
    });

    this.configurationLoadedSubscription = this.configurationService.configurationLoaded().subscribe((configuration: Configuration) => {
      this.publishButtonDisabled = !!configuration.publishedDate;
      this.resetButtonDisabled = !!configuration.publishedDate;

      this.updateUndoDialogBody(new Date(this.configurationService.getLatestPublishedConfiguration().publishedDate));

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
        this.ngZone.runOutsideAngular(() => {
          this.timer.restart();
        });
      });
    });

    this.setTranslations();
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
  }

  public saveDraft(): void {
    this.configurationService.saveDraft().then(() => {
      this.afterSaveDraftDone();
    });
  }

  public resetToPreviousPublication(): void {
    this.confirmationService.confirm({
      message: this.undoDialogBody,
      accept: () => {
        this.configurationService.undo().then(() => {
          this.publishButtonDisabled = true;
          this.resetButtonDisabled = true;
        });
      }
    });
  }

  public publish(): void {
    this.confirmationService.confirm({
      message: this.publishDialogBody,
      accept: () => {
        const subscription = this.publishedMapDialog.openWithFloor(this.floor).subscribe((_: PublishedMap) => {
          this.configurationService.publish().subscribe(() => {
            this.afterPublishDone();
            subscription.unsubscribe();
          });
        });
      },
      reject: () => {
        this.configurationService.publish().subscribe(() => {
          this.afterPublishDone();
        });
      }
    });
  }

  public messageSpanAnimationDone(): void {
    this.isAnimationDone = this.messageSpanState === 'hidden';
    this.messageSpanState = 'hidden';
  }

  private afterSaveDraftDone(): void {
    this.resetButtonDisabled = false;
    this.publishButtonDisabled = false;
    this.saveButtonDisabled = true;
    if (this.isAnimationDone) {
      this.messageSpanState = 'visible';
    }
    this.cd.detectChanges();
  }

  private afterPublishDone(): void {
    this.publishButtonDisabled = true;
    this.resetButtonDisabled = true;
    this.saveButtonDisabled = true;
    this.updateUndoDialogBody(new Date());
    this.cd.detectChanges();
  }

  private setTranslations(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.get('configuration.prePublishConfirmDialog.yes').subscribe((value: string) => {
      this.publishConfirmButtonText = value;
    });
    this.translateService.get('configuration.prePublishConfirmDialog.no').subscribe((value: string) => {
      this.publishCancelButtonText = value;
    });
    this.translateService.get('configuration.prePublishConfirmDialog.body').subscribe((value: string) => {
      this.publishDialogBody = value;
    });
    this.translateService.get('configuration.preUndoConfirmDialog.yes').subscribe((value: string) => {
      this.undoConfirmButtonText = value;
    });
    this.translateService.get('configuration.preUndoConfirmDialog.no').subscribe((value: string) => {
      this.undoCancelButtonText = value;
    });
  }

  private updateUndoDialogBody(date: Date): void {
    this.translateService.get('configuration.preUndoConfirmDialog.body', {
      date: date.toLocaleString()
    }).subscribe((value: string) => {
      this.undoDialogBody = value;
    });
  }
}

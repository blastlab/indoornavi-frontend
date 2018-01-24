import {ChangeDetectorRef, Component, Input, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActionBarService} from './actionbar.service';
import {Floor} from '../../floor/floor.type';
import {MapLoaderInformerService} from '../../shared/services/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Timer} from '../../shared/utils/timer/timer';
import {PublishedDialogComponent} from '../../map-viewer/dialog/published.dialog';
import {PublishedMap} from '../../map-viewer/published.type';
import {TranslateService} from '@ngx-translate/core';
import {Configuration} from './actionbar.type';
import {ConfirmationService} from 'primeng/primeng';
import {MessageServiceWrapper} from '../../shared/services/message/message.service';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.html',
  styleUrls: ['./actionbar.css'],
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

  @ViewChild(PublishedDialogComponent)
  private publishedMapDialog: PublishedDialogComponent;

  // pre publish dialog data
  private publishDialogBody: string;

  // pre undo dialog data
  private undoDialogBody: string;

  constructor(private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private ngZone: NgZone,
              private confirmationService: ConfirmationService,
              private cd: ChangeDetectorRef,
              private translateService: TranslateService,
              private messageService: MessageServiceWrapper) {
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
      key: 'preUndo',
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
      key: 'prePublish',
      accept: () => {
        const subscription = this.publishedMapDialog.openWithFloor(this.floor).subscribe((_: PublishedMap) => {
          this.configurationService.publish().subscribe(() => {
            this.afterPublishDone();
            subscription.unsubscribe();
          });
        });
      },
      // TODO: we need to wait till they implement ability to react different on close than on reject https://github.com/primefaces/primeng/issues/3428
      reject: () => {
        this.configurationService.publish().subscribe(() => {
          this.afterPublishDone();
        });
      }
    });
  }

  private afterSaveDraftDone(): void {
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

  private setTranslations(): void {
    this.translateService.setDefaultLang('en');
    this.translateService.get('configuration.prePublishConfirmDialog.body').subscribe((value: string) => {
      this.publishDialogBody = value;
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

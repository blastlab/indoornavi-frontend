import {animate, Component, Input, NgZone, OnDestroy, OnInit, state, style, transition, trigger} from '@angular/core';
import {ActionBarService} from './actionbar.service';
import {Floor} from '../../floor/floor.type';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Timer} from '../../utils/timer/timer';
import {MdDialog, MdDialogRef} from '@angular/material';
import {PublishedDialogComponent} from '../../published/dialog/published.dialog';
import {PublishedMap} from '../../published/published.type';
import {ConfirmDialogComponent} from '../../utils/confirm-dialog/confirm.dialog';
import {TranslateService} from '@ngx-translate/core';
import {Configuration} from './actionbar.type';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.html',
  styleUrls: ['./actionbar.css'],
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
  private publishedDialogRef: MdDialogRef<PublishedDialogComponent>;

  // confirm dialog data
  private confirmDialogRef: MdDialogRef<ConfirmDialogComponent>;
  private confirmButtonText: string;
  private cancelButtonText: string;
  private body: string;

  constructor(private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private ngZone: NgZone,
              private dialog: MdDialog,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe(() => {
      this.configurationService.loadConfiguration(this.floor);
    });

    this.configurationLoadedSubscription = this.configurationService.configurationLoaded().subscribe((configuration: Configuration) => {
      this.publishButtonDisabled = configuration.published;
      this.resetButtonDisabled = configuration.published;

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
    if (this.configurationLoadedSubscription) {
      this.configurationLoadedSubscription.unsubscribe();
    }
    if (this.mapLoadedSubscription) {
      this.mapLoadedSubscription.unsubscribe();
    }
    if (this.configurationChangedSubscription) {
      this.configurationChangedSubscription.unsubscribe();
    }
    if (!!this.timer) {
      this.timer.stop();
    }
  }

  public saveDraft(): void {
    this.configurationService.saveDraft().then(() => {
      this.afterSaveDraftDone();
    });
  }

  public resetToPreviousPublication(): void {
    this.configurationService.undo().then(() => {
      this.publishButtonDisabled = true;
      this.resetButtonDisabled = true;
    });
  }

  public publish(): void {
    this.configurationService.publish().subscribe(() => {
      this.publishButtonDisabled = true;
      this.resetButtonDisabled = true;
      this.saveButtonDisabled = true;
    this.confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        body: this.body,
        confirmButtonText: this.confirmButtonText,
        cancelButtonText: this.cancelButtonText
      }
    });
    this.confirmDialogRef.afterClosed().subscribe((okButtonClicked: boolean) => {
      if (okButtonClicked) {
        this.publishedDialogRef = this.dialog.open(PublishedDialogComponent, {width: '500px', height: '600px'});
        this.publishedDialogRef.componentInstance.setMap({
          floor: this.floor,
          users: [],
          tags: []
        });
        this.publishedDialogRef.afterClosed().subscribe((savedMap: PublishedMap) => {
          if (!!savedMap) {
            this.configurationService.publish().subscribe(() => {
              this.publishButtonDisabled = true;
            });
          }
        });
      } else if (okButtonClicked !== undefined) { // don't do it when user closed dialog giving no answer
        this.configurationService.publish().subscribe(() => {
          this.publishButtonDisabled = true;
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
  }

  private setTranslations() {
    this.translateService.setDefaultLang('en');
    this.translateService.get('configuration.confirmDialog.yes').subscribe((value: string) => {
      this.confirmButtonText = value;
    });
    this.translateService.get('configuration.confirmDialog.no').subscribe((value: string) => {
      this.cancelButtonText = value;
    });
    this.translateService.get('configuration.confirmDialog.body').subscribe((value: string) => {
      this.body = value;
    });
  }
}

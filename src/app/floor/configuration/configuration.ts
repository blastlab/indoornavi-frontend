import {animate, Component, Input, NgZone, OnDestroy, OnInit, state, style, transition, trigger} from '@angular/core';
import {ConfigurationService} from './configuration.service';
import {Floor} from '../floor.type';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Timer} from '../../utils/timer/timer';
import {MdDialog, MdDialogRef} from '@angular/material';
import {PublishedDialogComponent} from '../../published/dialog/published.dialog';
import {PublishedMap} from '../../published/published.type';
import {ConfirmDialogComponent} from '../../utils/confirm-dialog/confirm.dialog';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-configuration',
  templateUrl: './configuration.html',
  styleUrls: ['./configuration.css'],
  animations: [
    trigger('messageState', [
      state('visible', style({opacity: 1, transform: 'scale(1.0)'})),
      state('hidden', style({opacity: 0, transform: 'scale(0.0)'})),
      transition('hidden <=> visible', animate(ConfigurationService.SAVE_DRAFT_ANIMATION_TIME + 'ms')),
    ])
  ]
})
export class ConfigurationComponent implements OnInit, OnDestroy {
  public static SAVE_DRAFT_TIMEOUT = 3000;
  public publishButtonDisabled = true;
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
  private confirmButton: string;
  private cancelButton: string;
  private body: string;

  constructor(private configurationService: ConfigurationService,
              private mapLoaderInformer: MapLoaderInformerService,
              private ngZone: NgZone,
              private dialog: MdDialog,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe(() => {
      this.configurationService.loadConfiguration(this.floor);
    });

    this.configurationLoadedSubscription = this.configurationService.configurationLoaded().subscribe(() => {
      this.ngZone.runOutsideAngular(() => {
        this.timer = new Timer(() => {
          this.configurationService.saveDraft().then(() => {
            this.ngZone.run(() => {
              this.publishButtonDisabled = false;
              if (this.isAnimationDone) {
                this.messageSpanState = 'visible';
              }
            });
          });
        }, ConfigurationComponent.SAVE_DRAFT_TIMEOUT);
      });

      this.configurationChangedSubscription = this.configurationService.configurationChanged().subscribe(() => {
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
  }

  public publish(): void {
    this.confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        body: this.body,
        confirmButton: this.confirmButton,
        cancelButton: this.cancelButton
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
      } else {
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

  private setTranslations() {
    this.translateService.setDefaultLang('en');
    this.translateService.get('yes').subscribe((value: string) => {
      this.confirmButton = value;
    });
    this.translateService.get('no').subscribe((value: string) => {
      this.cancelButton = value;
    });
    this.translateService.get('configuration.confirmDialog.body').subscribe((value: string) => {
      this.body = value;
    });
  }
}

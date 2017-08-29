import {animate, Component, Input, NgZone, OnDestroy, OnInit, state, style, transition, trigger} from '@angular/core';
import {ConfigurationService} from './configuration.service';
import {Floor} from '../floor.type';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';
import {Subscription} from 'rxjs/Subscription';
import {Timer} from '../../utils/timer/timer';

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

  constructor(private configurationService: ConfigurationService,
              private mapLoaderInformer: MapLoaderInformerService,
              private ngZone: NgZone) {
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
    this.configurationService.publish().subscribe(() => {
      this.publishButtonDisabled = true;
    });
  }

  public messageSpanAnimationDone(): void {
    this.isAnimationDone = this.messageSpanState === 'hidden';
    this.messageSpanState = 'hidden';
  }
}

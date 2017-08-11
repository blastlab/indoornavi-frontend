import {animate, Component, Input, OnInit, state, style, transition, trigger} from '@angular/core';
import {Configuration} from './configuration.type';
import {ConfigurationService} from './configuration.service';
import {Floor} from '../floor.type';
import {MapLoaderInformerService} from '../../utils/map-loader-informer/map-loader-informer.service';

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
export class ConfigurationComponent implements OnInit {

  public publishButtonDisabled = true;
  public messageSpanState: string = 'hidden';
  @Input() floor: Floor;
  private isAnimationDone: boolean = true;

  constructor(private configurationService: ConfigurationService,
              private mapLoaderInformer: MapLoaderInformerService) {
  }

  ngOnInit() {
    this.mapLoaderInformer.isLoaded$.subscribe(() => {
      this.configurationService.loadConfiguration(this.floor);
    });
    this.configurationService.configurationLoaded().subscribe(() => {
        this.configurationService.configurationChanged().subscribe((_: Configuration) => {
          this.publishButtonDisabled = false;
          if (this.isAnimationDone) {
            this.messageSpanState = 'visible';
          }
        });
    });
  }

  public publish(): void {
    this.configurationService.publish().subscribe((_: Configuration) => {
      this.publishButtonDisabled = true;
    });
  }

  public messageSpanAnimationDone(): void {
    this.isAnimationDone = this.messageSpanState === 'hidden';
    this.messageSpanState = 'hidden';
  }
}

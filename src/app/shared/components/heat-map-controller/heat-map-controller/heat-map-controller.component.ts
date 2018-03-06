import {Component} from '@angular/core';
import {HeatMapControllerService} from './heat-map-controller.service';


@Component({
  selector: 'app-heat-map-controller',
  templateUrl: './heat-map-controller.component.html',
  styleUrls: ['./heat-map-controller.component.css']
})
export class HeatMapControllerComponent {
  private playingAnimation: boolean = false;
  private pathLength: number = 25; // in seconds for user friendly units
  private heatTimeWait: number = 5; // in seconds for user friendly units
  private heatMapType: string = '0';
  Hexagonal: HeatMapType = HeatMapType.HEXAGONAL;
  Square: HeatMapType = HeatMapType.SQUARE;

  constructor(private heatMapControllerService: HeatMapControllerService) { }

  setPathLength (event: number): void {
    this.pathLength = event;
    // calculate time to [ms] before passing as observable
    this.heatMapControllerService.setHeatMapWaterfallDisplayTime(this.pathLength * 1000);
  }

  setHeatTimeWait (event: number): void {
    this.heatTimeWait = event;
    // calculate time to [ms] before passing as observable
    this.heatMapControllerService.setHeatTimeGapChange(this.heatTimeWait * 1000);
  }

  toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    this.heatMapControllerService.setHeatMapType(parseInt(this.heatMapType, 10));
    this.heatMapControllerService.togglePlayingAnimation(this.playingAnimation);
  }

}

export enum HeatMapType {
  HEXAGONAL,
  SQUARE
}

import {Component} from '@angular/core';
import {HeatMapControllerService} from './heat-map-controller.service';


@Component({
  selector: 'app-heat-map-controller',
  templateUrl: './heat-map-controller.component.html',
  styleUrls: ['./heat-map-controller.component.css']
})
export class HeatMapControllerComponent {
  public playingAnimation: boolean = true;
  public pathLength: number = 2500; // in seconds for user friendly units
  public heatTimeWait: number = 5; // in seconds for user friendly units
  public heatMapType: string = '1';
  Hexagonal: HeatMapType = HeatMapType.HEXAGONAL;
  Square: HeatMapType = HeatMapType.SQUARE;

  constructor(private heatMapControllerService: HeatMapControllerService) { }

  toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    this.heatMapControllerService.setHeatMapType(parseInt(this.heatMapType, 10));
    this.heatMapControllerService.togglePlayingAnimation(this.playingAnimation);
    this.heatMapControllerService.setHeatMapWaterfallDisplayTime(this.pathLength * 1000);
    this.heatMapControllerService.setHeatTimeGapChange(this.heatTimeWait * 1000);
  }

}

export enum HeatMapType {
  HEXAGONAL,
  SQUARE
}

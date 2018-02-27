import {Component, OnInit} from '@angular/core';
import {HeatMapControllerService} from './heat-map-controller.service';


@Component({
  selector: 'app-heat-map-controller',
  templateUrl: './heat-map-controller.component.html',
  styleUrls: ['./heat-map-controller.component.css']
})
export class HeatMapControllerComponent implements OnInit {
  private playingAnimation: boolean = false;
  private pathLength: number = 25; // in seconds for user friendly units
  private heatTimeWait: number = 5; // in seconds for user friendly units
  private heatMapType: string = 'Hexagonal';

  constructor(private heatMapControllerService: HeatMapControllerService) { }

  ngOnInit() {
  }

  setPathLength (event: number): void {
    this.pathLength = event;
    // calculate time to [ms] before passing to observable
    this.heatMapControllerService.setHeatMapWaterfallDisplayTime(this.pathLength * 1000);
  }

  setHeatTimeWait (event: number): void {
    this.heatTimeWait = event;
    // calculate time to [ms] before to observable
    this.heatMapControllerService.setHeatTimeGapChange(this.heatTimeWait * 1000);
  }

  toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    this.heatMapControllerService.setHeatMapType(this.heatMapType);
    this.heatMapControllerService.togglePlayingAnimation(this.playingAnimation);
  }

}


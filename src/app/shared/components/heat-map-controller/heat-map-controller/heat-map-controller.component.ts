import { Component, OnInit } from '@angular/core';
import {HeatMapControllerService} from './heat-map-controller.service';

@Component({
  selector: 'app-heat-map-controller',
  templateUrl: './heat-map-controller.component.html',
  styleUrls: ['./heat-map-controller.component.css']
})
export class HeatMapControllerComponent implements OnInit {
  private pathSliderView: boolean = false;
  private playingAnimation: boolean = false;
  private heatMapWaterfallDisplayTime: number = 25; // in seconds for user friendly units

  constructor(private heatMapControllerService: HeatMapControllerService) { }

  ngOnInit() {
  }

  setPathLength (event: number): void {
    this.heatMapWaterfallDisplayTime = event;
    // calculate time to [ms] before serving
    this.heatMapControllerService.setHeatMapWaterfallDisplayTime(this.heatMapWaterfallDisplayTime * 1000);
  }

  toggleSlider(): void {
    this.pathSliderView = !this.pathSliderView;
  }

  toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    this.heatMapControllerService.togglePlayingAnimation(this.playingAnimation);
  }

}

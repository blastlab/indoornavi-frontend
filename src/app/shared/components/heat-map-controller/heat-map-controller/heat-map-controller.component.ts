import { Component, OnInit } from '@angular/core';
import {HeatMapPath} from '../../../../map-viewer/views/analytics/analytics.type';

@Component({
  selector: 'app-heat-map-controller',
  templateUrl: './heat-map-controller.component.html',
  styleUrls: ['./heat-map-controller.component.css']
})
export class HeatMapControllerComponent implements OnInit {
  private pathSliderView: boolean = false;
  private playingAnimation: boolean = false;
  private heatMapSettings: HeatMapPath = {
    path: 2500,
    heatingTime: 2000,
  };

  constructor() { }

  ngOnInit() {
  }

  setPathLength (event): void {
    this.heatMapSettings.path = event;
    // move to subscription
    // this.heatMap.coolingDown = this.heatMapSettings.path;
  }

  toggleSlider(): void {
    this.pathSliderView = !this.pathSliderView;
  }

  toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    if (!this.playingAnimation) {
      // move to subscription
      // this.heatMap.eraseHeatMap();
    }
  }

}

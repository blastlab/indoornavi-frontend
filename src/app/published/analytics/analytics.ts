import {SocketService} from '../../utils/socket/socket.service';
import {ActivatedRoute} from '@angular/router';
import {PublishedService} from '../publication/published.service';
import {MapViewerService} from '../../map/map.viewer.service';
import {IconService} from 'app/utils/drawing/icon.service';
import {PublishedViewerComponent} from '../published-viewer.component';
import {AfterViewInit, Component, NgZone} from '@angular/core';
import {MeasureSocketData} from '../publication/published.type';
import {scaleCoordinates} from '../../map/toolbar/tools/scale/scale.type';
import {Point} from '../../map/map.type';
import {HeatMapBuilder, HeatMapCreated} from './heatmap.service';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';

@Component({
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent extends PublishedViewerComponent implements AfterViewInit {
  private heatMapSet: Dictionary<number, HeatMapCreated> = new Dictionary<number, HeatMapCreated>();
  private radiusSliderView: boolean = false;
  private opacitySliderView: boolean = false;
  private blurSliderView: boolean = false;
  private pathSliderView: boolean = false;
  private heatSliderView: boolean = false;
  private heatMapSettings: HeatMapSettings = {
    radius: 15,
    opacity: 0.5,
    blur: 0.5,
    path: 400,
    heat: 20
  };

  public playingAnimation: boolean = false;

  constructor(ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapViewerService: MapViewerService,
              iconService: IconService) {
    super(ngZone,
      socketService,
      route,
      publishedService,
      mapViewerService,
      iconService);
  }

  ngAfterViewInit () {
    this.callbacksToBeRunAfterSocketInitialization.push(this.heatMapDrawer.bind(this));
  }

  public toggleSlider(type: string): void {
    switch (type) {
      case 'radius':
        this.radiusSliderView = !this.radiusSliderView;
        this.opacitySliderView = this.blurSliderView = this.pathSliderView = this.heatSliderView = false;
        break;
      case 'opacity':
        this.opacitySliderView = !this.opacitySliderView;
        this.radiusSliderView = this.blurSliderView = this.pathSliderView = this.heatSliderView = false;
        break;
      case 'blur':
        this.blurSliderView = !this.blurSliderView;
        this.radiusSliderView = this.opacitySliderView = this.pathSliderView = this.heatSliderView = false;
        break;
      case 'path':
        this.pathSliderView = !this.pathSliderView;
        this.radiusSliderView = this.opacitySliderView = this.blurSliderView = this.heatSliderView = false;
        break;
      case 'heat':
        this.heatSliderView = !this.heatSliderView;
        this.radiusSliderView = this.opacitySliderView = this.blurSliderView = this.pathSliderView = false;
        break;
      default:
        break;
    }
  }
  public setSliderValue(type: string, value): void {
    switch (type) {
      case 'radius':
        this.heatMapSettings.radius = value;
        break;
      case 'opacity':
        this.heatMapSettings.opacity = value;
        break;
      case 'blur':
        this.heatMapSettings.blur = value;
        break;
      case 'path':
        this.heatMapSettings.path = value;
        break;
      case 'heat':
        this.heatMapSettings.heat = value;
        break;
      default:
        break;
    }
    console.log(this.heatMapSettings);
  }
  public toggleHeatAnimation() {
    this.playingAnimation = !this.playingAnimation;
    if (this.playingAnimation) {
      this.radiusSliderView = this.opacitySliderView = this.blurSliderView = this.pathSliderView = this.radiusSliderView = false;
    }
  }

  protected isInHeatMapSet(deviceId: number): boolean {
    return this.tagsOnMap.containsKey(deviceId);
  }

  protected heatMapDrawer(data: MeasureSocketData) {
    const coordinates: Point = scaleCoordinates(data.coordinates.point, this.pixelsToCentimeters),
      deviceId: number = data.coordinates.tagShortId;
    if (!this.isInHeatMapSet(deviceId)) {
      const heatMapBuilder = new HeatMapBuilder({pathLength: 1000, heatValue: 20});
      const heatMap = heatMapBuilder
        .createHeatGroup()
        .update(coordinates);
      this.heatMapSet.setValue(deviceId, heatMap);
    } else {
      this.heatMapSet.getValue(deviceId).update(coordinates);
    }
  };
}

export interface HeatMapSettings {
  radius: number;
  opacity: number;
  blur: number;
  path: number;
  heat: number;
}

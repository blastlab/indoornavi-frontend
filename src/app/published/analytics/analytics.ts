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
import {HeatMapSettings} from './heat-map.type';

@Component({
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent extends PublishedViewerComponent implements AfterViewInit {
  private heatMapSet: Dictionary<number, HeatMapCreated> = new Dictionary<number, HeatMapCreated>();
  private opacitySliderView: boolean = false;
  private blurSliderView: boolean = false;
  private pathSliderView: boolean = false;
  private heatSliderView: boolean = false;
  private heatMapSettings: HeatMapSettings = {
    radius: 20,
    opacity: 0.5,
    blur: 0.5,
    path: 100,
    heat: 20
  };

  public playingAnimation: boolean = false;
  public mapStyle: object = {
    'width': '2000px'
  };

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

  ngAfterViewInit(): void {
    // in the moment of creating svg #map, component doesn't know anything about its style
    // so cannot set proper canvas size,
    // we need to get picture size an set it before canvas creation
    // const map = document.querySelector('#map');
    this.callbacksToBeRunAfterSocketInitialization.push(this.heatMapDrawer.bind(this));
  }

  public toggleSlider(type: string): void {
    switch (type) {
      case 'opacity':
        if (this.opacitySliderView) {
          this.setAllSlidersViewToFalse();
        } else {
          this.setAllSlidersViewToFalse();
          this.opacitySliderView = !this.opacitySliderView;
        }
        break;
      case 'blur':
        if (this.blurSliderView) {
          this.setAllSlidersViewToFalse();
        } else {
          this.setAllSlidersViewToFalse();
          this.blurSliderView = !this.blurSliderView;
        }
        break;
      case 'path':
        if (this.pathSliderView) {
          this.setAllSlidersViewToFalse();
        } else {
          this.setAllSlidersViewToFalse();
          this.pathSliderView = !this.pathSliderView;
        }
        break;
      case 'heat':
        if (this.heatSliderView) {
          this.setAllSlidersViewToFalse();
        } else {
          this.setAllSlidersViewToFalse();
          this.heatSliderView = !this.heatSliderView;
        }
        break;
      default:
        break;
    }
  }

  public toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    if (this.playingAnimation) {
      this.setAllSlidersViewToFalse();
    }
  }

  protected isInHeatMapSet(deviceId: number): boolean {
    return this.tagsOnMap.containsKey(deviceId);
  }

  protected heatMapDrawer(data: MeasureSocketData): void {
    const coordinates: Point = scaleCoordinates(data.coordinates.point, this.pixelsToCentimeters),
      deviceId: number = data.coordinates.tagShortId;
    if (!this.isInHeatMapSet(deviceId)) {
      const heatMapBuilder = new HeatMapBuilder({
        pathLength: this.heatMapSettings.path,
        heatValue: this.heatMapSettings.heat,
        radius: this.heatMapSettings.radius,
        opacity: this.heatMapSettings.opacity,
        blur: this.heatMapSettings.blur
      });
      const heatMap = heatMapBuilder
        .createHeatGroup();
      this.heatMapSet.setValue(deviceId, heatMap);
    } else if (this.playingAnimation) {
      this.heatMapSet.getValue(deviceId).configure(this.heatMapSettings);
      this.heatMapSet.getValue(deviceId).update(coordinates);
    } else {
      this.heatMapSet.getValue(deviceId).repaint();
    }
  };

  private setAllSlidersViewToFalse(): void {
    this.opacitySliderView = this.blurSliderView = this.pathSliderView = this.heatSliderView = false;
  }

}

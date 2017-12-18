import {ActivatedRoute} from '@angular/router';
import {Component, NgZone, OnInit} from '@angular/core';
import {HeatMapBuilder, HeatMapCreated} from './heatmap.service';
import Dictionary from 'typescript-collections/dist/lib/Dictionary';
import {HeatMapSettingsExtended} from './heat-map.type';
import {TranslateService} from '@ngx-translate/core';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TimeStepBuffer} from './analytics.type';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../published.service';
import {AreaService} from '../../../shared/services/area/area.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {Point} from '../../../map-editor/map.type';
import {ZoomService} from '../../../map-editor/zoom.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {CoordinatesSocketData} from '../../published.type';


@Component({
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent extends SocketConnectorComponent implements OnInit {
  private heatMapSet: Dictionary<number, HeatMapCreated> = new Dictionary<number, HeatMapCreated>();
  private opacitySliderView: boolean = false;
  private blurSliderView: boolean = false;
  private pathSliderView: boolean = false;
  private heatSliderView: boolean = false;
  private timeStepBuffer: Array<TimeStepBuffer> = [];
  private heatMapSettings: HeatMapSettingsExtended = {
    radius: 20,
    opacity: 0.5,
    blur: 0.5,
    path: 100,
    heat: 20
  };
  private mapStyle = {
    'width': '2000px'
  };

  public playingAnimation: boolean = false;

  constructor(ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapLoaderInformer: MapLoaderInformerService,
              areaService: AreaService,
              translateService: TranslateService,
              iconService: IconService,
              zoomService: ZoomService
              ) {
    super(ngZone,
      socketService,
      route,
      publishedService,
      mapLoaderInformer,
      areaService,
      translateService,
      iconService,
      zoomService
    );
  }

  protected init(): void {
    /*
    in the moment of creating svg #map, component doesn't know anything about its style
    so cannot set proper canvas size,
    we need to get picture size an set it before canvas creation
    const widthOfMapComponent = document.querySelector('#map').getAttribute('width');
    doesn't work as it is not set for this element in the process of DOM setting
    mapStyle variable needs to be updated with proper width value of the map
    before canvas is being created in the DOM
    */
    this.whenDataArrived().subscribe((data: CoordinatesSocketData) => {
      // update
      const timeOfDataStep: number = Date.now();
      this.timeStepBuffer.push({data: data, timeOfDataStep: timeOfDataStep});
      this.handleCoordinatesData(data);
    });

    this.whenTransitionEnded().subscribe((tagShortId: number) => {
      // release to setHeatMap only those data that are in proper time step up to transition of the tag
      // from timeStepBuffer
      const timeWhenTransitionIsFinished: number = Date.now() - this.transitionDurationTimeStep;
      for (let index = 0; index < this.timeStepBuffer.length; index ++) {
        if (this.timeStepBuffer[index].timeOfDataStep < timeWhenTransitionIsFinished) {
          this.setHeatMap(this.timeStepBuffer[index].data);
          this.timeStepBuffer.splice(index, 1);
        }
      }
      if (!this.playingAnimation) {
        // clean timeStepBuffer
        this.timeStepBuffer = [];
      } else {
        // draw
        this.drawHeatMap(tagShortId);
      }
    });
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
    return this.heatMapSet.containsKey(deviceId);
  }

  private setHeatMap(data: CoordinatesSocketData): void {
    const coordinates: Point = data.coordinates.point,
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
    }
    if (this.playingAnimation) {
      this.heatMapSet.getValue(deviceId).configure(this.heatMapSettings);
      this.heatMapSet.getValue(deviceId).update(coordinates);
    } else {
      this.heatMapSet.getValue(deviceId).clean();
    }
  }

  private drawHeatMap (deviceId) {
    this.heatMapSet.getValue(deviceId).draw();
  }

  private setAllSlidersViewToFalse(): void {
    this.opacitySliderView = this.blurSliderView = this.pathSliderView = this.heatSliderView = false;
  }
}

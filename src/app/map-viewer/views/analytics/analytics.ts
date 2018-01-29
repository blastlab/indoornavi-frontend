import {ActivatedRoute} from '@angular/router';
import {Component, NgZone, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SocketConnectorComponent} from '../socket-connector.component';
import {TimeStepBuffer} from './analytics.type';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../published.service';
import {AreaService} from '../../../shared/services/area/area.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {CoordinatesSocketData} from '../../published.type';
import {HexagonHeatMap} from './hexagon-heatmap.service';
import * as d3 from 'd3';
import {ZoomService} from '../../../shared/services/zoom/zoom.service';
import {Movable} from '../../../shared/wrappers/movable/movable';
import {MapSvg} from '../../../map/map.type';

@Component({
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent extends SocketConnectorComponent implements OnInit {
  private pathSliderView: boolean = false;
  private timeStepBuffer: Map<number, TimeStepBuffer[]> = new Map();
  private mapId = 'map';
  private heatmap: HexagonHeatMap;
  // hexRadius set to tag icon size equal 20px x 20px square
  private hexSize: number = 20;
  private gradient: string[] = [
    '#ebff81',
    '#fffb00',
    '#ffaa00',
    '#ff7300',
    '#ff3700',
    '#ff000c'
  ];

  public heatMapSettings = {
    path: 25000,
    heatingTime: 2000
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
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg) => {
      this.createHexagonalHeatMapGrid(mapSvg.layer);
    });
    this.whenDataArrived().subscribe((data: CoordinatesSocketData) => {
      // update
      const timeOfDataStep: number = Date.now();
      if (this.timeStepBuffer.has(data.coordinates.tagShortId)) {
        this.timeStepBuffer.get(data.coordinates.tagShortId).push({data: data, timeOfDataStep: timeOfDataStep});
      } else {
        this.timeStepBuffer.set(data.coordinates.tagShortId, [{data: data, timeOfDataStep: timeOfDataStep}])
      }
      this.handleCoordinatesData(data);
    });

    this.whenTransitionEnded().subscribe((tagShortId: number) => {
      // release to setHeatMap only those data that are in proper time step up to transition of the tag
      // from timeStepBuffer
      const timeStepBuffer = this.timeStepBuffer.get(tagShortId);
      const timeWhenTransitionIsFinished: number = Date.now() - Movable.TRANSITION_DURATION;
      for (let index = 0; index < timeStepBuffer.length; index ++) {
        if (timeStepBuffer[index].timeOfDataStep < timeWhenTransitionIsFinished) {
          if (this.playingAnimation) {
            this.heatUpHexes(timeStepBuffer[index].data);
          }
          timeStepBuffer.splice(0, index);
        }
      }
    });
  }

  setPathLength (event): void {
    this.heatMapSettings.path = event;
    this.heatmap.coolingDown = this.heatMapSettings.path;
  }

  toggleSlider(): void {
    this.pathSliderView = !this.pathSliderView;
  }

  toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    if (!this.playingAnimation) {
      this.heatmap.eraseHeatMap();
    }
  }

  private heatUpHexes(data: CoordinatesSocketData): void {
    // this.heatmap.feedWithCoordinates(this.scaleCoordinates(data.coordinates.point));
  }

  private createHexagonalHeatMapGrid (mapNode: d3.selection): void {
    const height = Number.parseInt(mapNode.node().getBBox().height);
    const width = Number.parseInt(mapNode.node().getBBox().width);
    this.heatmap = new HexagonHeatMap(width, height, this.hexSize, this.gradient);
    this.heatmap.create(this.mapId);
    this.heatmap.heatingUp = this.heatMapSettings.heatingTime;
    this.heatmap.coolingDown = this.heatMapSettings.path;
  }
}

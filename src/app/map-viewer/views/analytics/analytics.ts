import {ActivatedRoute} from '@angular/router';
import {Component, NgZone, OnInit} from '@angular/core';
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
import {HexagonHeatmap} from './hexagon-heatmap.service';
import * as d3 from 'd3';

@Component({
  templateUrl: './analytics.html',
  styleUrls: ['./analytics.css']
})
export class AnalyticsComponent extends SocketConnectorComponent implements OnInit {;
  private pathSliderView: boolean = false;
  private timeStepBuffer: Array<TimeStepBuffer> = [];
  private mapId = 'map';
  private heatmap: HexagonHeatmap;

  public heatMapSettings = {
    path: 25000,
    heatingTime: 500
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
    this.mapLoaderInformer.loadCompleted().first().subscribe((d3map: d3.selection) => {
      this.createHexagonalHeatmapGrid(d3map);
    });
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
          this.playingAnimation ? this.heatUpHexes(this.timeStepBuffer[index].data) : null;
          this.timeStepBuffer.splice(0, index);
        }
      }
    });
  }

  public setPathLength (event) {
    this.heatMapSettings.path = event;
    this.heatmap.coolingDown = this.heatMapSettings.path;
  }

  public toggleSlider(): void {
    this.pathSliderView = !this.pathSliderView;
  }

  public toggleHeatAnimation(): void {
    this.playingAnimation = !this.playingAnimation;
    if (!this.playingAnimation) {
      this.heatmap.coolDownImmediately();
    }
  }

  private heatUpHexes(data: CoordinatesSocketData): void {
    const coordinates: Point = data.coordinates.point;
    this.heatmap.feedWithCoordinates(coordinates);

  }

  private createHexagonalHeatmapGrid (mapNode, hexSize ?, colors ?) {
    const height = Number.parseInt(mapNode.node().getBBox().height);
    const width = Number.parseInt(mapNode.node().getBBox().width);
    let hexRaduis: number;
    // hexRadius set to tag icon size equal 20px x 20px square
    !hexSize ? hexRaduis = 20 : hexRaduis = hexSize;
    this.heatmap = new HexagonHeatmap(width, height, hexRaduis, '#ff0000');
    this.heatmap.toggleMouseEvents = false;
    this.heatmap.create(this.mapId);
    this.heatmap.heatingUp = this.heatMapSettings.heatingTime;
    this.heatmap.coolingDown = this.heatMapSettings.path;
  }
}

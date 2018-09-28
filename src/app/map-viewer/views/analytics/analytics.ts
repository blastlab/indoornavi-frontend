import {ActivatedRoute} from '@angular/router';
import {Component, NgZone, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SocketConnectorComponent} from '../socket-connector.component';
import {HeatMap, HeatMapPath, TimeStepBuffer} from './analytics.type';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../publication.service';
import {AreaService} from '../../services/area/area.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {CoordinatesSocketData} from '../../publication.type';
import {HexagonalHeatMap} from './hexagonal.heatmap.service';
import * as d3 from 'd3';
import {MapSvg} from '../../../map/map.type';
import {FloorService} from '../../../floor/floor.service';
import {TagVisibilityTogglerService} from '../../../shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {ApiService} from '../../../shared/utils/drawing/api.service';
import {BreadcrumbService} from '../../../shared/services/breadcrumbs/breadcrumb.service';
import {HeatMapControllerService} from '../../../shared/components/heat-map-controller/heat-map-controller/heat-map-controller.service';
import {TagToggle} from '../../../shared/components/tag-visibility-toggler/tag-toggle.type';
import {PixelHeatMap} from './pixel.heatmap.service';
import {HeatMapType} from '../../../shared/components/heat-map-controller/heat-map-controller/heat-map-controller.component';
import {MapClickService} from '../../../shared/services/map-click/map-click.service';
import {TagOnMap} from '../../../map/models/tag';
import {PathService} from '../../services/path/path.service';
import {ComplexService} from '../../../complex/complex.service';
import {PathDisplayService} from '../../../shared/utils/navigation/path.display.service';

@Component({
  templateUrl: './analytics.html'
})
export class AnalyticsComponent extends SocketConnectorComponent implements OnInit, OnDestroy {
  private timeStepBuffer: Map<number, TimeStepBuffer[]> = new Map();
  private mapId = 'map';
  private activeHeatMap: HeatMap[] = [];
  private hexHeatPointSize: number = 10;
  private plasmaHeatPointSize: number = 5;
  private gradient: string[] = [
    '#ebff81',
    '#fffb00',
    '#ffaa00',
    '#ff7300',
    '#ff3700',
    '#ff000c'
  ];

  private heatMapSettings: HeatMapPath = {
    temperatureLifeTime: 25000,
    temperatureWaitTime: 5000,
  };
  private playingAnimation: boolean = false;
  private heatMapType: number = HeatMapType.HEXAGONAL;

  constructor(
              ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapLoaderInformer: MapLoaderInformerService,
              mapClickService: MapClickService,
              areaService: AreaService,
              pathService: PathService,
              translateService: TranslateService,
              iconService: IconService,
              mapObjectService: ApiService,
              pathDisplayService: PathDisplayService,
              complexService: ComplexService,
              floorService: FloorService,
              tagTogglerService: TagVisibilityTogglerService,
              breadcrumbService: BreadcrumbService,
              private heatMapControllerService: HeatMapControllerService
              ) {
    super(
      ngZone,
      socketService,
      route,
      publishedService,
      mapLoaderInformer,
      mapClickService,
      areaService,
      pathService,
      translateService,
      iconService,
      mapObjectService,
      complexService,
      pathDisplayService,
      floorService,
      tagTogglerService,
      breadcrumbService
    );
  }

  protected init(): void {
    this.heatMapControllerService.onHeaMapTypeChange().takeUntil(this.subscriptionDestructor)
      .subscribe((type: HeatMapType): void => {
      this.heatMapType = type;
    });
    this.heatMapControllerService.onAnimationToggled().takeUntil(this.subscriptionDestructor)
      .subscribe((animationToggle: boolean): void => {
      this.playingAnimation = animationToggle;
      if (!this.playingAnimation) {
        this.getActiveHeatMap().erase();
      }

    });
    this.heatMapControllerService.onHeatMapWaterfallDisplayTimesChange().takeUntil(this.subscriptionDestructor)
      .subscribe((heatMapWaterfallDisplayTime: number): void => {
      this.heatMapSettings.temperatureLifeTime = heatMapWaterfallDisplayTime;
      this.getActiveHeatMap().temperatureTimeIntervalForCooling = this.heatMapSettings.temperatureLifeTime;
    });
    this.heatMapControllerService.onHeatMapTimeGapChange().takeUntil(this.subscriptionDestructor)
      .subscribe((heatTimeGap: number): void => {
      this.heatMapSettings.temperatureWaitTime = heatTimeGap;
      this.getActiveHeatMap().temperatureTimeIntervalForHeating = this.heatMapSettings.temperatureWaitTime;
    });
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg): void => {
      // both hexagonalHeatMap and pixelHeatMap needs to be created upfront, to be displayed in svg layer below tags svg layer
      this.createHeatMapGrid(mapSvg.layer);
    });
    this.whenDataArrived().takeUntil(this.subscriptionDestructor)
      .subscribe((data: CoordinatesSocketData): void => {
      // update
      const timeOfDataStep: number = Date.now();
      if (this.timeStepBuffer.has(data.coordinates.tagShortId)) {
        this.timeStepBuffer.get(data.coordinates.tagShortId).push({data: data, timeOfDataStep: timeOfDataStep});
      } else {
        this.timeStepBuffer.set(data.coordinates.tagShortId, [{data: data, timeOfDataStep: timeOfDataStep}])
      }
      this.handleCoordinatesData(data);
    });
    this.tagTogglerService.onToggleTag().takeUntil(this.subscriptionDestructor)
      .subscribe((tagToggle: TagToggle) => {
      if (this.tagsOnMap.containsKey(tagToggle.tag.shortId) && !tagToggle.selected) {
        this.timeStepBuffer.delete(tagToggle.tag.shortId);
        this.getActiveHeatMap().erase(tagToggle.tag.shortId);
      }
    });
    this.whenTransitionEnded().takeUntil(this.subscriptionDestructor)
      .subscribe((tagShortId: number): void => {
      const timeStepBuffer = this.timeStepBuffer.get(tagShortId);
      if (!!timeStepBuffer && timeStepBuffer.length > 0 && !document.hidden) {
        const timeWhenTransitionIsFinished: number = Date.now() - TagOnMap.TRANSITION_DURATION;
        for (let index = 0; index < timeStepBuffer.length; index ++) {
          if (timeStepBuffer[index].timeOfDataStep < timeWhenTransitionIsFinished) {
            if (this.playingAnimation) {
              this.getActiveHeatMap().feedWithCoordinates(timeStepBuffer[index].data);
            }
            timeStepBuffer.splice(0, index);
          }
        }
      }
    });
  }

  private getActiveHeatMap() {
    return this.activeHeatMap[this.heatMapType];
  }

  // grid needs to be calculated upfront before starting heat map,
  // it is needed for having correct grid dimension corresponding with map img size and current pan & zoom
  private createHeatMapGrid (mapNode: d3.selection): void {
    const height = Number.parseInt(mapNode.node().getBBox().height);
    const width = Number.parseInt(mapNode.node().getBBox().width);
    this.activeHeatMap = [
      new HexagonalHeatMap(width, height, this.hexHeatPointSize, this.gradient),
      new PixelHeatMap(width, height, this.plasmaHeatPointSize, this.gradient)
    ];
    this.activeHeatMap.forEach((heatMap: HeatMap): void => {
      heatMap.create(this.mapId);
      heatMap.temperatureTimeIntervalForHeating = this.heatMapSettings.temperatureWaitTime;
      heatMap.temperatureTimeIntervalForCooling = this.heatMapSettings.temperatureLifeTime;
    });
  }
}

import {ActivatedRoute} from '@angular/router';
import {Component, NgZone, OnInit} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {SocketConnectorComponent} from '../socket-connector.component';
import {HeatMapPath, TimeStepBuffer} from './analytics.type';
import {SocketService} from '../../../shared/services/socket/socket.service';
import {PublishedService} from '../../publication.service';
import {AreaService} from '../../../shared/services/area/area.service';
import {IconService} from '../../../shared/services/drawing/icon.service';
import {MapLoaderInformerService} from '../../../shared/services/map-loader-informer/map-loader-informer.service';
import {CoordinatesSocketData} from '../../publication.type';
import {HexagonalHeatMap} from './hexagonal.heatmap.service';
import * as d3 from 'd3';
import {Movable} from '../../../shared/wrappers/movable/movable';
import {MapSvg} from '../../../map/map.type';
import {FloorService} from '../../../floor/floor.service';
import {TagVisibilityTogglerService} from '../../../shared/components/tag-visibility-toggler/tag-visibility-toggler.service';
import {MapObjectService} from '../../../shared/utils/drawing/map.object.service';
import {BreadcrumbService} from '../../../shared/services/breadcrumbs/breadcrumb.service';
import {HeatMapControllerService} from '../../../shared/components/heat-map-controller/heat-map-controller/heat-map-controller.service';
import {TagToggle} from '../../../shared/components/tag-visibility-toggler/tag-toggle.type';
import {PlasmaHeatMap} from './plasma.heatmap.service';

@Component({
  templateUrl: './analytics.html'
})
export class AnalyticsComponent extends SocketConnectorComponent implements OnInit {
  private timeStepBuffer: Map<number, TimeStepBuffer[]> = new Map();
  private mapId = 'map';
  private hexagonalHeatMap: HexagonalHeatMap;
  private plasmaHeatMap: PlasmaHeatMap;
  // heatPointSize set to tag icon size equal 10px x 10px square
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
    temperatureWaitTime: 10000,
  };
  private playingAnimation: boolean = false;
  private displayHexagonal: string = 'Hexagonal';

  constructor(
              ngZone: NgZone,
              socketService: SocketService,
              route: ActivatedRoute,
              publishedService: PublishedService,
              mapLoaderInformer: MapLoaderInformerService,
              areaService: AreaService,
              translateService: TranslateService,
              iconService: IconService,
              mapObjectService: MapObjectService,
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
      areaService,
      translateService,
      iconService,
      mapObjectService,
      floorService,
      tagTogglerService,
      breadcrumbService
    );
  }

  protected init(): void {
    this.heatMapControllerService.onHeaMapTypeChange().subscribe((hexagonalType: string): void => {
      this.displayHexagonal = hexagonalType;
    });
    this.heatMapControllerService.onAnimationToggled().subscribe((animationToggle: boolean): void => {
      this.playingAnimation = animationToggle;
      if (!this.playingAnimation) {
        this.displayHexagonal === 'Hexagonal' ? this.hexagonalHeatMap.eraseHeatMap() : this.plasmaHeatMap.eraseHeatMap();
      }
    });
    this.heatMapControllerService.onHeatMapWaterfallDisplayTimesChange().subscribe((heatMapWaterfallDisplayTime: number): void => {
      this.heatMapSettings.temperatureLifeTime = heatMapWaterfallDisplayTime;
      this.hexagonalHeatMap.temperatureTimeIntervalForCooling = this.heatMapSettings.temperatureLifeTime;
    });
    this.heatMapControllerService.onHeatMapTimeGapChange().subscribe((heatTimeGap: number): void => {
      this.heatMapSettings.temperatureWaitTime = heatTimeGap;
      this.hexagonalHeatMap.temperatureTimeIntervalForHeating = this.heatMapSettings.temperatureWaitTime;
    });
    this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg): void => {
      // both hexagonalHeatMap and plasmaHeatMap needs to be created upfront, to be displayed in svg layer below tags svg layer
      this.createHeatMapGrid(mapSvg.layer);
    });
    this.whenDataArrived().subscribe((data: CoordinatesSocketData): void => {
      // update
      const timeOfDataStep: number = Date.now();
      if (this.timeStepBuffer.has(data.coordinates.tagShortId)) {
        this.timeStepBuffer.get(data.coordinates.tagShortId).push({data: data, timeOfDataStep: timeOfDataStep});
      } else {
        this.timeStepBuffer.set(data.coordinates.tagShortId, [{data: data, timeOfDataStep: timeOfDataStep}])
      }
      this.handleCoordinatesData(data);
    });
    this.tagTogglerService.onToggleTag().subscribe((tagToggle: TagToggle) => {
      if (this.tagsOnMap.containsKey(tagToggle.tag.shortId) && !tagToggle.selected) {
        this.timeStepBuffer.delete(tagToggle.tag.shortId);
        this.displayHexagonal === 'Hexagonal' ? this.hexagonalHeatMap.eraseHeatMap(tagToggle.tag.shortId) : this.plasmaHeatMap.eraseHeatMap(tagToggle.tag.shortId);
      }
    });
    this.whenTransitionEnded().subscribe((tagShortId: number): void => {
      const timeStepBuffer = this.timeStepBuffer.get(tagShortId);
      if (!!timeStepBuffer && timeStepBuffer.length > 0 && !document.hidden) {
        const timeWhenTransitionIsFinished: number = Date.now() - Movable.TRANSITION_DURATION;
        for (let index = 0; index < timeStepBuffer.length; index ++) {
          if (timeStepBuffer[index].timeOfDataStep < timeWhenTransitionIsFinished) {
            if (this.playingAnimation) {
              this.heatUpHexes(timeStepBuffer[index].data);
            }
            timeStepBuffer.splice(0, index);
          }
        }
      }
    });
  }

  private heatUpHexes(data: CoordinatesSocketData): void {
    this.displayHexagonal === 'Hexagonal' ? this.hexagonalHeatMap.feedWithCoordinates(data) : this.plasmaHeatMap.feedWithCoordinates(data);
  }

  private createHeatMapGrid (mapNode: d3.selection): void {
    const height = Number.parseInt(mapNode.node().getBBox().height);
    const width = Number.parseInt(mapNode.node().getBBox().width);
    this.hexagonalHeatMap = new HexagonalHeatMap(width, height, this.hexHeatPointSize, this.gradient);
    this.hexagonalHeatMap.create(this.mapId);
    this.hexagonalHeatMap.temperatureTimeIntervalForHeating = this.heatMapSettings.temperatureWaitTime;
    this.hexagonalHeatMap.temperatureTimeIntervalForCooling = this.heatMapSettings.temperatureLifeTime;
    this.plasmaHeatMap = new PlasmaHeatMap(width, height, this.plasmaHeatPointSize, this.gradient);
    this.plasmaHeatMap.create(this.mapId);
    this.plasmaHeatMap.temperatureTimeIntervalForHeating = this.heatMapSettings.temperatureWaitTime;
    this.plasmaHeatMap.temperatureTimeIntervalForCooling = this.heatMapSettings.temperatureLifeTime;
  }

}

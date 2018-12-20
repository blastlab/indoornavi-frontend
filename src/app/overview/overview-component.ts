import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Floor} from '../floor/floor.type';
import {Subject} from 'rxjs/Subject';
import {FloorService} from '../floor/floor.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {TranslateService} from '@ngx-translate/core';
import {Scale, ScaleCalculations, ScaleDto} from '../map-editor/tool-bar/tools/scale/scale.type';
import {Geometry} from '../shared/utils/helper/geometry';
import {EChartOption} from 'echarts';
import {MapService} from '../map-editor/uploader/map.uploader.service';
import {echartHeatmapConfig} from './echart.config';
import {CoordinatesIncident, CoordinatesRequest, ReportService} from './services/coordinates.service';
import {Point} from '../map-editor/map.type';
import {getNoiseHelper} from './services/mock_helper';

@Component({
  templateUrl: './overview.html'
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewInit {

  heatMapWidth = 1200;
  heatMapHeight = 800;
  private echartsInstance: any;
  private floor: Floor;
  private gradientsInX: number = 200;
  private gradientsInY: number = 200;
  private heatmapOffsetX: number;
  private heatmapOffsetY: number;
  private imageUrl: string;
  private imageWidth: number;
  private imageHeight: number;
  private heatmapImageEdgePoint: Point = {x: 0, y: 0};
  private scaleMinificationFactor: ScaleDto;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  chartOptions: EChartOption = echartHeatmapConfig;

  @ViewChild('canvasParent') canvasParent;

  constructor(private route: ActivatedRoute,
              private floorService: FloorService,
              private breadcrumbService: BreadcrumbService,
              private translateService: TranslateService,
              private mapService: MapService,
              private reportService: ReportService
  ) {
  }

  ngOnInit() {
    this.calculateEChartOffset();
    this.setCorrespondingFloorParams();
    this.translateService.setDefaultLang('en');
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
  }

  ngAfterViewInit() {
    this.subscribeToMapParametersChange();
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  private calculateEChartOffset(): void {
    this.heatmapOffsetX = this.heatMapWidth * 0.1;
    this.heatmapOffsetY = this.heatMapHeight * 0.075;
  }
  private setCorrespondingFloorParams(): void {
    this.route.params.takeUntil(this.subscriptionDestructor)
      .subscribe((params: Params) => {
        const floorId = +params['id'];
        this.floorService.getFloor(floorId).takeUntil(this.subscriptionDestructor).subscribe((floor: Floor): void => {
          this.breadcrumbService.publishIsReady([
            {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
            {
              label: floor.building.complex.name,
              routerLink: `/complexes/${floor.building.complex.id}/buildings`,
              routerLinkActiveOptions: {exact: true}
            },
            {
              label: floor.building.name,
              routerLink: `/complexes/${floor.building.complex.id}/buildings/${floor.building.id}/floors`,
              routerLinkActiveOptions: {exact: true}
            },
            {label: `${(floor.name.length ? floor.name : floor.level)}`, disabled: true}
          ]);
        });
      });
  }

  private subscribeToMapParametersChange() {
    this.route.params.takeUntil(this.subscriptionDestructor).subscribe((params: Params): void => {
      const floorId = +params['id'];
      this.floorService.getFloor(floorId).takeUntil(this.subscriptionDestructor).subscribe((floor: Floor): void => {
        this.floor = floor;
        if (!!floor.scale) {
          this.scale = new Scale(this.floor.scale);
          this.scaleCalculations = {
            scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
            scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
          };
        }
        if (!!floor.imageId) {
          console.log(floor);
          this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
            this.imageUrl = URL.createObjectURL(blob);
            this.loadMapImage().then((imageSize: number[]): void => {
              this.imageHeight = imageSize[0];
              this.imageWidth = imageSize[1];
              this.calculateDataToHeatmapScaleFactorChange();
              this.loadData();
            });
          });
        }
      });
    });
  }

  private calculateDataToHeatmapScaleFactorChange(): void {
    const mapSizeInPixels: Point = {
      x: this.heatmapImageEdgePoint.x - this.heatmapOffsetX,
      y: this.heatmapImageEdgePoint.y - this.heatmapOffsetY
    };
    const sizeMinificationFactor: Point = {
      x: mapSizeInPixels.x / this.imageWidth,
      y: mapSizeInPixels.x / this.imageHeight
    };
    const stop: Point = {
      x: Math.abs((this.scale.start.x - this.scale.stop.x) * sizeMinificationFactor.x),
      y: Math.abs((this.scale.start.y - this.scale.stop.y) * sizeMinificationFactor.y)
    };
    this.scaleMinificationFactor = new ScaleDto({x: 0, y: 0}, stop, this.scale.realDistance, this.scale.measure);
  }

  private loadMapImage(): Promise<number[]> {
      return new Promise((resolve) => {
        const canvas = document.getElementsByTagName('canvas').item(0);
        const newCanvas = document.createElement('canvas');
        newCanvas.setAttribute('id', 'image-heatmap-canvas');
        canvas.parentElement.appendChild(newCanvas);
        const ctx = newCanvas.getContext('2d');
        const background = new Image();
        background.src = this.imageUrl;
        const result: number[] = [];
        let width = 0;
        let height = 0;
        const self = this;
        background.onload = function () {
          width += background.width;
          height += background.height;
          self.heatmapImageEdgePoint.x = self.heatMapWidth - self.heatmapOffsetX * 2;
          self.heatmapImageEdgePoint.y = self.heatMapHeight - self.heatmapOffsetY * 2;
          ctx.drawImage(background, self.heatmapOffsetX, self.heatmapOffsetY,
            self.heatmapImageEdgePoint.x, self.heatmapImageEdgePoint.y);
          result.push(width);
          result.push(height);
          resolve(result);
        }.bind(self);
        newCanvas.setAttribute('width', `${this.heatMapWidth}px`);
        newCanvas.setAttribute('height', `${this.heatMapHeight}px`);
      });
  }

  private loadData(): void {
    const data: number[][] = this.mockGenerateData();
    const hours = new Date().getHours();
    let minutes: string = new Date().getMinutes().toString();
    minutes = parseInt(minutes, 10) > 9 ? minutes : `0${minutes}`;
    const dateNow: string =  `${new Date().getFullYear()}-${(parseInt(new Date().getMonth().toString(), 10) + 1)}` +
      `-${new Date().getDate()}T${hours}:${minutes}:00`;
    console.log(dateNow);
    const request: CoordinatesRequest = {
      from: '2018-12-18T11:23:56',
      to: dateNow,
      floorId: this.floor.id
    };
    this.reportService.getCoordinates(request).first().subscribe((payload: CoordinatesIncident[]): void => {
      let i = true;
      console.log(payload.length);
      payload.forEach((incident: CoordinatesIncident) => {
        if (i) {
          i = false;
          console.log(incident);
        }
      });
    });
    this.chartOptions.xAxis.data = data[0];
    this.chartOptions.yAxis.data = data[1];
    this.chartOptions.series[0].data = data[2];
    this.chartOptions = Object.assign({}, this.chartOptions);
  }

  private mockGenerateData(): number[][] {
    const noise = getNoiseHelper();
    const data = [];
    const xData = [];
    const yData = [];
    for (let i = 0; i <= this.gradientsInX; i++) {
      for (let j = 0; j <= this.gradientsInY; j++) {
        let noiseValue = noise.perlin2(i / 40, j / 20) * 10 + 3;
        noiseValue = noiseValue > .5 ? noiseValue : .5;
        data.push([i, j, noiseValue]);
        }
        xData.push(i);
      }
    for (let j = 0; j < this.gradientsInY; j++) {
        yData.push(j);
      }
      return [xData, yData, data];
    }

  }

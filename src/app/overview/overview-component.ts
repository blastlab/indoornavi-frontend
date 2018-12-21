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
import {CoordinatesIncident, CoordinatesRequest} from './overview.type';
import {Point} from '../map-editor/map.type';
import {getNoiseHelper} from './services/mock_helper';
import {ReportService} from './services/coordinates.service';
import {MessageServiceWrapper} from '../shared/services/message/message.service';

@Component({
  templateUrl: './overview.html'
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewInit {

  heatMapWidth = 1200;
  heatMapHeight = 800;
  dateFrom: string;
  dateTo: string;
  dateToMaxValue: Date;
  dateFromMaxValue: Date;
  displayDialog = false;
  private dateFromRequestFormat: string;
  private dateToRequestFormat: string;
  private imageLoaded = false;
  private echartsInstance: any;
  private floor: Floor;
  private gradientsInX: number = 400;
  private gradientsInY: number = 400;
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
              private reportService: ReportService,
              private messageService: MessageServiceWrapper
  ) {
  }

  ngOnInit() {
    this.calculateEChartOffset();
    this.setCorrespondingFloorParams();
    this.setTimeDateAllowedToChooseFrom();
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

  renderNewHeatmap() {
    if (this.imageLoaded) {
      if (!!this.dateFrom && !!this.dateTo) {
        this.displayDialog = true;
        this.setDateRequestFormat();
        this.loadData();
      } else {
        this.messageService.failed('overview.message.setDate');
      }
    } else {
      this.messageService.failed('overview.message.imageNotLoaded');
    }
  }

  cancel(): void {
    this.displayDialog = false;
}

  private setDateRequestFormat(): void {
    let hoursFrom = new Date(this.dateFrom).getHours().toString();
    let minutesFrom: string = new Date(this.dateFrom).getMinutes().toString();
    let hoursTo = new Date(this.dateFrom).getHours().toString();
    let minutesTo: string = new Date(this.dateFrom).getMinutes().toString();
    hoursFrom = parseInt(hoursFrom, 10) > 9 ? hoursFrom : `0${hoursFrom}`;
    hoursTo = parseInt(hoursTo, 10) > 9 ? hoursTo : `0${hoursTo}`;
    minutesFrom = parseInt(minutesFrom, 10) > 9 ? minutesFrom : `0${minutesFrom}`;
    minutesTo = parseInt(minutesTo, 10) > 9 ? minutesTo : `0${minutesTo}`;
    this.dateFromRequestFormat = `${new Date(this.dateFrom).getFullYear()}-${(parseInt(new Date(this.dateFrom).getMonth().toString(), 10) + 1)}` +
      `-${new Date(this.dateFrom).getDate()}T${hoursFrom}:${minutesFrom}:00`;
    this.dateToRequestFormat = `${new Date(this.dateTo).getFullYear()}-${(parseInt(new Date(this.dateTo).getMonth().toString(), 10) + 1)}` +
      `-${new Date(this.dateTo).getDate()}T${hoursTo}:${minutesTo}:00`;
  }

  private calculateEChartOffset(): void {
    this.heatmapOffsetX = this.heatMapWidth * 0.1;
    this.heatmapOffsetY = this.heatMapHeight * 0.075;
  }

  private setTimeDateAllowedToChooseFrom(): void {
    const today: Date = new Date();
    const hour: number = today.getHours();
    const prevHour = (hour === 0) ? 23 : hour - 1;
    this.dateFromMaxValue = new Date();
    this.dateFromMaxValue.setHours(prevHour);
    this.dateToMaxValue = new Date();
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
          this.mapService.getImage(floor.imageId).subscribe((blob: Blob) => {
            this.imageUrl = URL.createObjectURL(blob);
            this.loadMapImage().then((imageSize: number[]): void => {
              this.imageHeight = imageSize[0];
              this.imageWidth = imageSize[1];
              this.calculateDataToHeatmapScaleFactorChange();
              this.imageLoaded = true;
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
    const request: CoordinatesRequest = {
      from: this.dateFromRequestFormat,
      to: this.dateToRequestFormat,
      floorId: this.floor.id
    };
    this.reportService.getCoordinates(request).first().subscribe((payload: CoordinatesIncident[]): void => {
      if (this.displayDialog) {
        // build data array from received payload
        // });
        const data: number[][] = this.mockGenerateData();
        this.chartOptions.xAxis.data = data[0];
        this.chartOptions.yAxis.data = data[1];
        this.chartOptions.series[0].data = data[2];
        this.chartOptions = Object.assign({}, this.chartOptions);
        // payload.forEach((incident: CoordinatesIncident) => {
        this.messageService.success('overview.message.loadedSuccess');
        this.displayDialog = false;
      } else {
        this.messageService.failed('overview.message.loadCanceled');
      }
    });
  }

  private mockGenerateData(): number[][] {
    const noise = getNoiseHelper();
    noise.seed(Math.random());
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

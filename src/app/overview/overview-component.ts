import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
export class OverviewComponent implements OnInit, OnDestroy {
  dateFrom: string;
  dateTo: string;
  dateToMaxValue: Date;
  dateFromMaxValue: Date;
  displayDialog = false;
  isImageSet = false;
  chartOptions: EChartOption = echartHeatmapConfig;
  private dateFromRequestFormat: string;
  private dateToRequestFormat: string;
  private imageLoaded = false;
  private echartsInstance: any;
  private floor: Floor;
  private gradientsNumber: number = 400;
  private gradient: number;
  private heatmapOffsetX: number;
  private heatmapOffsetY: number;
  private windowWidth: number;
  private imageWidth = 0;
  private imageHeight = 0;
  private imageUrl: string;
  private heatmapImageEdgePoint: Point = {x: 0, y: 0};
  private scaleMinificationFactor: ScaleDto;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private maxPayloadLength = 100000; // ToDo: consider to free this after getting data calculated by solver

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
    this.setImageToWindowSizeRelation();
    this.setCorrespondingFloorParams();
    this.setTimeDateAllowedToChooseFrom();
    this.translateService.setDefaultLang('en');
    this.subscribeToMapParametersChange();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
    this.isImageSet = false;
  }

  onChartInit(ec) {
    this.echartsInstance = ec;
  }

  renderNewHeatmap() {
    if (!!this.dateFrom && !!this.dateTo) {
      this.displayDialog = true;
      this.setDateRequestFormat();
      this.loadData();
    } else {
      this.messageService.failed('overview.message.setDate');
    }
  }

  cancel(): void {
    this.displayDialog = false;
  }

  private setImageToWindowSizeRelation() {
    this.windowWidth = window.innerWidth;
    this.windowWidth = this.windowWidth < 1000 ? this.windowWidth = 1000 : this.windowWidth; // prevent to load heat map for very small image by resizing up
    this.windowWidth = this.windowWidth > 2200 ? this.windowWidth = 2200 : this.windowWidth; // prevent to load heat map for very larger image by resizing down
  }

  private setDateRequestFormat(): void {
    let hoursFrom = new Date(this.dateFrom).getHours().toString();
    let minutesFrom: string = new Date(this.dateFrom).getMinutes().toString();
    let hoursTo = new Date(this.dateFrom).getHours().toString();
    let minutesTo: string = new Date(this.dateFrom).getMinutes().toString();
    let dayFrom: string = new Date(this.dateFrom).getDate().toString();
    let dayTo: string = new Date(this.dateTo).getDate().toString();
    let monthTo: string = (new Date(this.dateTo).getMonth() + 1).toString();
    let monthFrom: string = (new Date(this.dateFrom).getMonth() + 1).toString();
    dayFrom = parseInt(dayFrom, 10) > 9 ? dayFrom : `0${dayFrom}`;
    dayTo = parseInt(dayTo, 10) > 9 ? dayTo : `0${dayTo}`;
    hoursFrom = parseInt(hoursFrom, 10) > 9 ? hoursFrom : `0${hoursFrom}`;
    hoursTo = parseInt(hoursTo, 10) > 9 ? hoursTo : `0${hoursTo}`;
    minutesFrom = parseInt(minutesFrom, 10) > 9 ? minutesFrom : `0${minutesFrom}`;
    minutesTo = parseInt(minutesTo, 10) > 9 ? minutesTo : `0${minutesTo}`;
    monthTo = parseInt(monthTo, 10) > 9 ? monthTo : `0${monthTo}`;
    monthFrom = parseInt(monthFrom, 10) > 9 ? monthFrom : `0${monthFrom}`;
    this.dateFromRequestFormat = `${new Date(this.dateFrom).getFullYear()}-${monthFrom}` +
      `-${dayFrom}T${hoursFrom}:${minutesFrom}:00`;
    this.dateToRequestFormat = `${new Date(this.dateTo).getFullYear()}-${monthTo}` +
      `-${dayTo}T${hoursTo}:${minutesTo}:00`;
  }

  private calculateEChartOffset(): void {
    this.heatmapOffsetX = this.windowWidth * 0.1;
    this.heatmapImageEdgePoint.x = this.windowWidth;
    this.heatmapImageEdgePoint.y = this.windowWidth * this.imageHeight / this.imageWidth;
    this.heatmapOffsetY = 58;
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
        this.floorService.getFloor(floorId).first().subscribe((floor: Floor): void => {
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
    this.route.params.first().subscribe((params: Params): void => {
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
          this.mapService.getImage(floor.imageId).first().subscribe((blob: Blob) => {
            this.imageUrl = URL.createObjectURL(blob);
            const self = this;
            const img = new Image();
            img.src = this.imageUrl;
            img.onload = function () {
              self.imageWidth += img.width;
              self.imageHeight += img.height;
              self.isImageSet = true;
              self.calculateEChartOffset();
              self.calculateScaleFactor();
              self.calculateGradient();
            }.bind(self);
          });
        }
      });
    });
  }

  private calculateScaleFactor(): void {
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

  private loadMapImage(): Promise<void> {
    return new Promise((resolve) => {
      const canvas = document.getElementsByTagName('canvas').item(0);
      const newCanvas = document.createElement('canvas');
      newCanvas.setAttribute('id', 'image-heatmap-canvas');
      canvas.parentElement.appendChild(newCanvas);
      const ctx = newCanvas.getContext('2d');
      const background = new Image();
      background.src = this.imageUrl;
      const self = this;
      background.onload = function () {
        ctx.drawImage(background, self.heatmapOffsetX, self.heatmapOffsetY,
          self.heatmapImageEdgePoint.x - self.heatmapOffsetX,
          self.heatmapImageEdgePoint.y - self.heatmapOffsetY);
        resolve();
      }.bind(self);
      newCanvas.setAttribute('width', `${this.heatmapImageEdgePoint.x - this.heatmapOffsetX}px`);
      newCanvas.setAttribute('height', `${this.heatmapImageEdgePoint.y - this.heatmapOffsetY}px`);
    });
  }

  private loadData(): void {
    const request: CoordinatesRequest = {
      from: this.dateFromRequestFormat,
      to: this.dateToRequestFormat,
      floorId: this.floor.id
    };
    this.reportService.getCoordinates(request).first()
      .subscribe((payload: CoordinatesIncident[]): void => {
      if (!this.imageLoaded) {
        this.loadMapImage().then((): void => {
          this.echartsInstance.resize({
            width: this.heatmapImageEdgePoint.x,
            height: this.heatmapImageEdgePoint.y,
            silent: false
          });
          this.imageLoaded = true;
        });
        this.displayHeatMap(payload);
      } else {
        this.displayHeatMap(payload);
      }
    });
  }

  private displayHeatMap(payload: CoordinatesIncident[]): void {
    if (this.displayDialog) {
      const dataFaked: number[][] = this.mockGenerateData();
      // const data = dataFaked;
      const data: (number[] |number[][])[] = this.calculateDataSet(payload);
      console.log(dataFaked);
      console.log(data);
      this.chartOptions.xAxis.data = data[0];
      this.chartOptions.yAxis.data = data[1];
      this.chartOptions.series[0].data = data[2];
      this.chartOptions = Object.assign({}, this.chartOptions);
      this.messageService.success('overview.message.loadedSuccess');
      this.displayDialog = false;
    } else {
      this.messageService.failed('overview.message.loadCanceled');
    }
  }

  private calculateGradient(): void {
    const determinant: number = this.imageWidth > this.imageHeight ? this.imageWidth : this.imageHeight;
    this.gradient = determinant / this.gradientsNumber;
  }

  private calculateDataSet(payload: CoordinatesIncident[]): (number[] | number[][])[] {
    const dataForProcessing = payload.slice(0, this.maxPayloadLength); // TODO is going to be removed after solver implementation
    const data: number[][] = [];
    const xData: number[] = [];
    const yData: number[] = [];
    const distance: number = Geometry.getDistanceBetweenTwoPoints(this.scaleMinificationFactor.stop, this.scaleMinificationFactor.start);
    const factor = this.scaleMinificationFactor.realDistance / distance;
    if (distance < 1 || factor === Infinity) {
      return [xData, yData, data];
    }
    for (let i = 0; i <= this.gradientsNumber; i++) {
      xData.push(i);
    }
    for (let j = 0; j <= this.gradientsNumber; j++) {
      yData.push(j);
    }
    dataForProcessing.forEach((coord: CoordinatesIncident) => {
      let point: Point = Geometry.calculatePointPositionInPixels(distance, this.scaleMinificationFactor.realDistance, coord.point);
      point = {x: Math.round(point.x / this.gradient), y: Math.round(point.y / this.gradient)};
        data.push([point.x, point.y, 9]);
    });
    return [xData, yData, data];
  }

  private mockGenerateData(): number[][] {
    const noise = getNoiseHelper();
    noise.seed(Math.random());
    const data = [];
    const xData = [];
    const yData = [];
    for (let i = 0; i <= this.gradientsNumber; i++) {
      for (let j = 0; j <= this.gradientsNumber; j++) {
        let noiseValue = noise.perlin2(i / 40, j / 20) * 10 + 3;
        noiseValue = noiseValue > .4 ? noiseValue : .4;
        noiseValue = noiseValue < 10 ? noiseValue : 10;
        data.push([i, j, noiseValue]);
      }
      xData.push(i);
    }
    for (let j = 0; j < this.gradientsNumber; j++) {
      yData.push(j);
    }
    return [xData, yData, data];
  }

}

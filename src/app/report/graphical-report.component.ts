import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Floor} from '../floor/floor.type';
import {Subject} from 'rxjs/Subject';
import {FloorService} from '../floor/floor.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {TranslateService} from '@ngx-translate/core';
import {Scale, ScaleCalculations} from '../map-editor/tool-bar/tools/scale/scale.type';
import {Geometry} from '../shared/utils/helper/geometry';
import {EChartOption} from 'echarts';
import {MapService} from '../map-editor/uploader/map.uploader.service';
import {echartHeatmapConfig} from './echart.config';
import {SolverCoordinatesRequest, SolverHeatMapPayload} from './graphical-report.type';
import {Point} from '../map-editor/map.type';
import {ReportService} from './services/report.service';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import * as p5 from 'p5';
import {drawHeatMap} from './services/heatmap';

@Component({
  templateUrl: './graphical-report.html',
  styleUrls: ['./graphical-report.css']
})
export class GraphicalReportComponent implements OnInit, OnDestroy {
  private static maxChartWidth = 2200;
  private static minChartWidth = 1000;
  private static heatMapOffsetFactorX = 0.1;
  private static heatMapOffsetFactorY = 58;
  dateFrom: string;
  dateTo: string;
  dateToMaxValue: Date;
  dateFromMaxValue: Date;
  displayDialog = false;
  isImageSet = false;
  chartOptions: EChartOption = echartHeatmapConfig;
  private isLoadingFirstTime = true;
  private dateFromRequestFormat: string;
  private dateToRequestFormat: string;
  private imageLoaded = false;
  private floor: Floor;
  private gradientsNumber: number = 300;
  private heatmapOffsetX: number;
  private heatmapOffsetY: number;
  private windowWidth: number;
  private imageWidth = 0;
  private imageHeight = 0;
  private imageUrl: string;
  private heatmapImageEdgePoint: Point = {x: 0, y: 0};
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  // todo: move in to config ts file
  private config = {
    heatSpread: 35,
    brushRadius: 4,
    brushIntensity: 80,
    gridWidth: 200, // todo: dynamic set from picture size
    gridHeight: 100, // todo: dynamic set from picture size
    cellSize: 20,
    cellSpacing: 20,
    canApplyHeat: true,
    isStatic: true,
    displayToggle: 'square'
  };


  @ViewChild('canvasParent') canvasParent;

  private static calculateGradient(boxPeripheralPoint: Point): number[][] {
    const xData = [];
    const yData = [];
    for (let i = 0; i <= boxPeripheralPoint.x; i++) {
      xData.push(i);
    }
    for (let j = 0; j < boxPeripheralPoint.y; j++) {
      yData.push(j);
    }
    return [xData, yData];
  }

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
    this.setAllowedDateRange();
    this.translateService.setDefaultLang('en');
    this.subscribeToMapParametersChange();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
    this.isImageSet = false;
    this.removeCanvas();
  }

  renderNewHeatmap() {
    if (!!this.dateFrom && !!this.dateTo) {
      if (this.isDateRequestFormatSet()) {
        this.displayDialog = true;
        this.loadData();
      }
    } else {
      this.messageService.failed('reports.message.setDate');
    }
  }

  cancel(): void {
    this.displayDialog = false;
  }

  private removeCanvas(): void {
    const canvas = document.getElementsByTagName('canvas').item(0);
    if (!!canvas) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  private createCanvas(imgUrl: string) {
    this.removeCanvas();
    const data = [];
    let counter = 100;
    while (counter > 0) {
      data.push({
        x: Math.floor(Math.random() * 1000),
        y: Math.floor(Math.random() * 1000)
      });
      counter--;
    }
    this.config['imgUrl'] = imgUrl;
    drawHeatMap(p5, this.config, data);
  }

  private setImageToWindowSizeRelation() {
    this.windowWidth = window.innerWidth;
    this.windowWidth = this.windowWidth < GraphicalReportComponent.minChartWidth ?
      this.windowWidth = GraphicalReportComponent.minChartWidth : this.windowWidth; // prevent to load heat map for very small image by resizing up
    this.windowWidth = this.windowWidth > GraphicalReportComponent.maxChartWidth ?
      this.windowWidth = GraphicalReportComponent.maxChartWidth : this.windowWidth; // prevent to load heat map for very larger image by resizing down
  }

  private isDateRequestFormatSet(): boolean {
    this.dateFromRequestFormat = new Date(this.dateFrom).toISOString();
    this.dateFromRequestFormat = this.dateFromRequestFormat.slice(0, this.dateFromRequestFormat.length - 2);
    this.dateToRequestFormat = new Date(this.dateTo).toISOString();
    this.dateToRequestFormat = this.dateToRequestFormat.slice(0, this.dateToRequestFormat.length - 2);
    if (new Date(this.dateFrom).valueOf() > new Date(this.dateTo).valueOf()) {
      this.messageService.failed('reports.message.wrongDataSpan');
      return false;
    }
    return true;
  }

  private calculateEChartOffset(): void {
    this.heatmapOffsetX = this.windowWidth * GraphicalReportComponent.heatMapOffsetFactorX;
    this.heatmapImageEdgePoint.x = this.windowWidth;
    this.heatmapImageEdgePoint.y = this.windowWidth * this.imageHeight / this.imageWidth;
    this.heatmapOffsetY = GraphicalReportComponent.heatMapOffsetFactorY;
  }

  private setAllowedDateRange(): void {
    const today: Date = new Date();
    const hour: number = today.getHours();
    const prevHour = (hour === 0) ? 23 : hour - 1;
    this.dateFromMaxValue = new Date();
    this.dateFromMaxValue.setHours(prevHour);
    this.dateToMaxValue = new Date();
  }

  private subscribeToMapParametersChange() {
    this.route.params.first().subscribe((params: Params): void => {
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
            const img = new Image();
            img.src = this.imageUrl;
            img.onload = () => {
              this.imageWidth += img.width;
              this.imageHeight += img.height;
              this.isImageSet = true;
            };
          });
        }
      });
    });
  }

  private loadMapImage(): Promise<string> {
    return new Promise((resolve) => {
      // const canvas = document.getElementsByTagName('canvas').item(0);
      // const newCanvas = document.createElement('canvas');
      // newCanvas.setAttribute('id', 'image-heatmap-canvas');
      // canvas.parentElement.appendChild(newCanvas);
      // const ctx = newCanvas.getContext('2d');
      const background = new Image();
      background.src = this.imageUrl;
      background.onload = () => {
        resolve(background.src);
      };
      // newCanvas.setAttribute('width', `${this.heatmapImageEdgePoint.x - this.heatmapOffsetX}px`);
      // newCanvas.setAttribute('height', `${this.heatmapImageEdgePoint.y - this.heatmapOffsetY}px`);
    });
  }

  private loadData(): void {
    const distanceCm = this.scale.getRealDistanceInCentimeters();
    const request: SolverCoordinatesRequest = {
      from: this.dateFromRequestFormat,
      to: this.dateToRequestFormat,
      floorId: this.floor.id,
      maxGradientsNum: this.gradientsNumber,
      mapXLength: 1,
      mapYLength: 1,
      scaleInX: 1,
      scaleInY: 1,
      distanceInCm: distanceCm
    };
    this.reportService.getCoordinates(request).first()
      .subscribe((payload: SolverHeatMapPayload): void => {
        if (payload.gradient.length === 0) {
          this.messageService.success('reports.message.error');
          this.displayDialog = false;
        } else if (!this.imageLoaded) {
          this.loadMapImage().then((imgUrl: string): void => {
            this.createCanvas(imgUrl);
            this.displayDialog = false;
          });
        }
    });
  }

  private displayHeatMap(payload: SolverHeatMapPayload): void {
    if (this.isLoadingFirstTime || this.displayDialog) {
      const gradientBoxed: Point = {
        x: payload.size[0],
        y: payload.size[1]
      };
      const heatMapGradient: number[][] = GraphicalReportComponent.calculateGradient(gradientBoxed);
      this.chartOptions.xAxis.data = heatMapGradient[0];
      this.chartOptions.yAxis.data = heatMapGradient[1];
      this.chartOptions.series[0].data = payload.gradient;
      this.chartOptions = Object.assign({}, this.chartOptions);
      if (this.displayDialog) {
        this.messageService.success('reports.message.loadedSuccess');
        this.displayDialog = false;
      }
    } else {
      this.messageService.failed('reports.message.loadCanceled');
    }
    this.isLoadingFirstTime = false;
  }
}

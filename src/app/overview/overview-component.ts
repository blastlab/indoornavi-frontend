import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
import {CoordinatesIncident, CoordinatesRequest, ReportService} from './services/coordinates.service';

@Component({
  templateUrl: './overview.html'
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewInit {

  heatMapWidth = 1200;
  heatMapHeight = 800;
  private echartsInstance: any;
  private floor: Floor;
  private heatmapOffsetX: number;
  private heatmapOffsetY: number;
  private imageUrl: string;
  private imageWidth: number;
  private imageHeight: number;
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
    this.heatmapOffsetY = this.heatMapHeight * 0.115;
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
              this.loadData();
            });
          });
        }
      });
    });
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
        ctx.drawImage(background, self.heatmapOffsetX, self.heatmapOffsetX,
          self.heatMapWidth - self.heatmapOffsetX * 2, self.heatMapHeight - self.heatmapOffsetY * 2);
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
    const data = [];
    const xData = [];
    const yData = [];
    for (let i = 0; i <= 200; i++) {
      for (let j = 0; j <= 200; j++) {
        data.push([i, j, data.push([i, j, (i + j) * (Math.random() * 10) - 500])]);
      }
      xData.push(i);
    }
    for (let j = 0; j < 200; j++) {
      yData.push(j);
    }
    return [xData, yData, data];
  }

}

import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Floor} from '../floor/floor.type';
import {Subject} from 'rxjs/Subject';
import {FloorService} from '../floor/floor.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {TranslateService} from '@ngx-translate/core';
import {Scale, ScaleCalculations} from '../map-editor/tool-bar/tools/scale/scale.type';
import {MapSvg} from '../map/map.type';
import {Geometry} from '../shared/utils/helper/geometry';
import {DrawBuilder} from '../shared/utils/drawing/drawing.builder';
import {EChartOption} from 'echarts';
import {MapService} from '../map-editor/uploader/map.uploader.service';

@Component({
  templateUrl: './overview.html'
})
export class OverviewComponent implements OnInit, OnDestroy, AfterViewInit {

  floor: Floor;
  echartsInstance: any;
  heatMapWidth = 1200;
  heatMapHeight = 800;
  private heatmapOffsetX: number;
  private heatmapOffsetY: number;
  private imageUrl: string;
  private imageWidth: number;
  private imageHeight: number;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private heatmap: DrawBuilder;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  chartOptions: EChartOption = {
    tooltip: {},
    xAxis: {
      type: 'category',
      data: []
    },
    yAxis: {
      type: 'category',
      data: []
    },
    visualMap: {
      min: 0,
      max: 1,
      calculable: true,
      realtime: false,
      inRange: {
        color: [
          'rgba(22,0,229,0.4)',
          'rgba(42,196,252,0.4)',
          'rgba(76,239,136,0.4)',
          'rgba(238,255,50,0.4)',
          'rgba(255,206,30,0.4)',
          'rgba(225,156,30,0.4)',
          'rgba(225,109,30,0.4)',
          'rgba(225,64,30,0.4)',
          'rgba(225,64,3,0.4)',
          'rgba(225,64,229,0.4)',
          'rgba(225,0,0,0.4)'
        ]
      }
    },
    series: [{
      name: 'Time span',
      type: 'heatmap',
      data: [],
      pointSize: 1,
      blurSize: 6,
      animation: false
    }]
  };

  @ViewChild('canvasParent') canvasParent;

  constructor(private route: ActivatedRoute,
              private floorService: FloorService,
              private breadcrumbService: BreadcrumbService,
              private translateService: TranslateService,
              private mapService: MapService) {
  }

  ngOnInit() {
    this.heatmapOffsetX = this.heatMapWidth * 0.1;
    this.heatmapOffsetY = this.heatMapHeight * 0.115;
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
            // this.heatmap
            //   .createGroup()
            //   .injectHtml();
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
    this.chartOptions.xAxis.data = data[0];
    this.chartOptions.yAxis.data = data[1];
    this.chartOptions.series[0].data = data[2];
    this.chartOptions = Object.assign({}, this.chartOptions);
  }

  private mockGenerateData(): number[][] {
    console.log(this.imageHeight, this.imageHeight);
    const data = [];
    const xData = [];
    const yData = [];
    for (let i = 0; i <= 100; i++) {
      for (let j = 0; j <= 100; j++) {
        data.push([i, j, data.push([i, j, (i + j) * (Math.random() * 10) - 500])]);
      }
      xData.push(i);
    }
    for (let j = 0; j < 100; j++) {
      yData.push(j);
    }
    return [xData, yData, data];
  }

}

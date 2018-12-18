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
  private imageUrl: string;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private d3map: MapSvg = null;
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
        color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
      }
    },
    series: [{
      name: 'Gaussian',
      type: 'heatmap',
      data: [],
      itemStyle: {
        emphasis: {
          borderColor: '#333',
          borderWidth: 1
        }
      },
      progressive: 1000,
      animation: true
    }]
  };

  @ViewChild('canvasParent') canvasParent;

  static mockGenerateData(): number[][] {
    const data = [];
    const xData = [];
    const yData = [];
    for (let i = 0; i <= 200; i++) {
      for (let j = 0; j <= 200; j++) {
        data.push([i, j, data.push([i, j, (i + j) * (Math.random() * 10) - 1000])]);
      }
      xData.push(i);
    }
    for (let j = 0; j < 200; j++) {
      yData.push(j);
    }
    return [xData, yData, data];
  }

  constructor(private route: ActivatedRoute,
              private floorService: FloorService,
              private breadcrumbService: BreadcrumbService,
              private translateService: TranslateService,
              private mapService: MapService) {
  }

  ngOnInit() {
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
              this.loadData();
            });
            // this.heatmap
            //   .createGroup()
            //   .injectHtml();
        }
      });
    });
  }

  private loadData(): void {
    const data: number[][] = OverviewComponent.mockGenerateData();
    this.chartOptions.xAxis.data = data[0];
    this.chartOptions.yAxis.data = data[1];
    this.chartOptions.series[0].data = data[2];
    this.chartOptions = Object.assign({}, this.chartOptions);
    const canvas = document.getElementsByTagName('canvas').item(0);
    const newCanvas = document.createElement('canvas');
    newCanvas.setAttribute('id', 'image-heatmap-canvas');
    canvas.parentElement.appendChild(newCanvas);
    const ctx = newCanvas.getContext('2d');
    const background = new Image();
    background.src = this.imageUrl;
    background.onload = function () {
      ctx.drawImage(background, 0, 0);
    };
    newCanvas.setAttribute('width', '2200px');
    newCanvas.setAttribute('height', '1200px');
    // canvas.parentNode.insertBefore(newCanvas, canvas.nextSibling);
    // this.canvasParent.nativeElement.appendChild()
  }
}

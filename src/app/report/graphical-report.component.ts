import {Component, OnDestroy, OnInit} from '@angular/core';
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
import {SolverCoordinatesRequest, SolverHeatMapPayload} from './graphical-report.type';
import {ReportService} from './services/report.service';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import * as p5 from 'p5';
import {HeatMapCanvas, HeatMapCanvasConfig} from './canvas/heatmap';
import {heatMapCanvasConfiguration} from './canvas/heatMapCanvas-config';
import {Point} from '../map-editor/map.type';

@Component({
  templateUrl: './graphical-report.html',
  styleUrls: ['./graphical-report.css']
})
export class GraphicalReportComponent implements OnInit, OnDestroy {
  dateFrom: string;
  dateTo: string;
  dateToMaxValue: Date;
  dateFromMaxValue: Date;
  displayDialog = false;
  isImageLoaded = false;
  private isLoadingFirstTime = true;
  private dateFromRequestFormat: string;
  private dateToRequestFormat: string;
  private imageLoaded = false;
  private floor: Floor;
  private gradientsNumber: number = 300;
  private imageUrl: string;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private subscriptionDestructor: Subject<void> = new Subject<void>();
  private heatMapCanvas: HeatMapCanvas;
  private config: HeatMapCanvasConfig = heatMapCanvasConfiguration;
  private data: Point[] = [];

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
    this.setAllowedDateRange();
    this.translateService.setDefaultLang('en');
    this.subscribeToMapParametersChange();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
    this.isImageLoaded = false;
    this.removeCanvas();
  }

  renderNewHeatmap() {
    if (!!this.dateFrom && !!this.dateTo) {
      if (this.isDateRequestFormatSet()) {
        this.cancelDialog();
        this.loadData();
      }
    } else {
      this.messageService.failed('reports.message.setDate');
    }
  }

  cancelDialog(): void {
    this.displayDialog = false;
  }

  private mockData(): void {
    // todo remove this ugly mock after proper data handle
    let counter = 500;
    this.data = [];
    while (counter > 0) {
      this.data.push({
        x: Math.floor(Math.random() * this.config.width),
        y: Math.floor(Math.random() * this.config.height)
      });
      counter--;
    }
    // todo remove till end of ugly mock
  }

  private removeCanvas(): void {
    this.heatMapCanvas = null;
    const canvas = document.getElementsByTagName('canvas').item(0);
    if (!!canvas) {
      canvas.parentNode.removeChild(canvas);
    }
  }

  private addCanvas(imgUrl: string) {
    if (this.isLoadingFirstTime || this.displayDialog) {
      if (this.displayDialog) {
        this.messageService.success('reports.message.loadedSuccess');
        this.cancelDialog();
      }
    } else {
      this.messageService.failed('reports.message.loadCanceled');
    }
    this.removeCanvas();
    this.config.imgUrl = imgUrl;
    console.log(this.config);
    this.heatMapCanvas = new HeatMapCanvas(p5, this.config, this.data);
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
          this.fetchImageFromServer(floor);
        }
      });
    });
  }

  private fetchImageFromServer(floor: Floor): void {
    this.mapService.getImage(floor.imageId).first().subscribe((blob: Blob) => {
      this.imageUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.src = this.imageUrl;
      img.onload = () => {
        this.config.width += img.width;
        this.config.height += img.height;
        this.isImageLoaded = true;
        this.addCanvas(img.src);
      };
    });
  }

  private loadMapImage(): Promise<string> {
    return new Promise((resolve) => {
      const background = new Image();
      background.src = this.imageUrl;
      background.onload = () => {
        resolve(background.src);
      };
    });
  }

  private loadData(): void {
    // todo: change request according to new heatmap set
    const request: SolverCoordinatesRequest = {
      from: this.dateFromRequestFormat,
      to: this.dateToRequestFormat,
      floorId: this.floor.id,
      maxGradientsNum: this.gradientsNumber,
      mapXLength: 1,
      mapYLength: 1,
      scaleInX: 1,
      scaleInY: 1,
      distanceInCm: 11
    };
    this.reportService.getCoordinates(request).first()
      .subscribe((payload: SolverHeatMapPayload): void => {
        if (payload.gradient.length === 0) {
          this.messageService.success('reports.message.error');
          this.cancelDialog();
        } else if (!this.imageLoaded) {
          this.loadMapImage().then((imgUrl: string): void => {
            // todo: use payload to compose payload data and recalculate using scale and picture dimensions and remove mock
            this.mockData();
            this.addCanvas(imgUrl);
            this.cancelDialog();
          });
        }
    });
  }
}

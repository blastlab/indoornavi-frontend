import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Floor} from '../floor/floor.type';
import {FloorService} from '../floor/floor.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {TranslateService} from '@ngx-translate/core';
import {Scale, ScaleCalculations} from '../map-editor/tool-bar/tools/scale/scale.type';
import {Geometry} from '../shared/utils/helper/geometry';
import {EChartOption} from 'echarts';
import {MapService} from '../map-editor/uploader/map.uploader.service';
import {HeatMapGradientPoint, SolverCoordinatesRequest, SolverHeatMapPayload} from './graphical-report.type';
import {ReportService} from './services/report.service';
import {MessageServiceWrapper} from '../shared/services/message/message.service';
import {HeatMapCanvas, HeatMapCanvasConfig} from './canvas/heatmap';
import {heatMapCanvasConfiguration} from './canvas/heatMapCanvas-config';
import {Tag} from '../device/device.type';
import {PublishedService} from '../map-viewer/publication.service';

class SelectItems {
}

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
  tags: SelectItems[] = [];
  selectedTags: string[] = [];
  private isLoadingFirstTime = true;
  private dateFromRequestFormat: string;
  private dateToRequestFormat: string;
  private floor: Floor;
  private imageUrl: string;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private heatMapCanvas: HeatMapCanvas;
  private config: HeatMapCanvasConfig = heatMapCanvasConfiguration;
  private data: HeatMapGradientPoint[] = [];


  constructor(private route: ActivatedRoute,
              private floorService: FloorService,
              private breadcrumbService: BreadcrumbService,
              private translateService: TranslateService,
              private mapService: MapService,
              private reportService: ReportService,
              private messageService: MessageServiceWrapper,
              private publishedService: PublishedService
  ) {
  }

  ngOnInit() {
    this.setAllowedDateRange();
    this.translateService.setDefaultLang('en');
    this.subscribeToMapParametersChange();
  }

  ngOnDestroy() {
    this.isImageLoaded = false;
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

  cancelDialog(): void {
    this.displayDialog = false;
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
    this.heatMapCanvas = new HeatMapCanvas(this.config, this.data);
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
      this.subscribeToTags(floorId);
      this.floorService.getFloor(floorId).first().subscribe((floor: Floor): void => {
        this.floor = floor;
        this.subscribeToBreadcrumbService(floor);
        if (!!floor.scale) {
          this.setScale();
        }
        if (!!floor.imageId) {
          this.fetchImageFromServer();
        }
      });
    });
  }

  private subscribeToTags(floorId): void {
    this.publishedService.getTagsAvailableForUser(floorId).first().subscribe((tags: Tag[]): void => {
      tags.forEach((tag: Tag): void => {
        this.tags.push({
          label: tag.shortId.toString(),
          value: tag.id.toString()
        });
      });
    });
  }

  private subscribeToBreadcrumbService(floor: Floor): void {
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
  }

  private setScale(): void {
      this.scale = new Scale(this.floor.scale);
      this.scaleCalculations = {
        scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
        scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
      };
  }

  private fetchImageFromServer(): void {
    this.mapService.getImage(this.floor.imageId).first().subscribe((blob: Blob) => {
      this.imageUrl = URL.createObjectURL(blob);
      const img = new Image();
      img.src = this.imageUrl;
      img.onload = () => {
        this.config.width = img.width;
        this.config.height = img.height;
        this.config.gridWidth = Math.ceil(this.config.width / this.config.cellSpacing);
        this.config.gridHeight = Math.ceil(this.config.height / this.config.cellSpacing);
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
    const request: SolverCoordinatesRequest = {
      from: this.dateFromRequestFormat,
      to: this.dateToRequestFormat,
      floorId: this.floor.id,
      mapHeight: Math.ceil(this.config.height * this.scale.getRealDistanceInCentimeters() / this.scale.getDistanceInPixels()),
      mapWidth: Math.ceil(this.config.width * this.scale.getRealDistanceInCentimeters() / this.scale.getDistanceInPixels()),
      tagsIds: this.selectedTags.map((tag: string) => {
        return parseInt(tag, 10);
      })
    };
    this.reportService.getCoordinates(request).first()
      .subscribe((payload: SolverHeatMapPayload): void => {
        this.data = [];
        if (payload.distribution.length === 0) {
          this.messageService.success('reports.message.error');
        } else if (this.isImageLoaded) {
          payload.distribution.forEach((gradientPoint: HeatMapGradientPoint) => {
            if (gradientPoint.heat !== 0) {
              gradientPoint.x = Math.floor(gradientPoint.x * this.scale.getDistanceInPixels() / this.scale.getRealDistanceInCentimeters());
              gradientPoint.y = Math.floor(gradientPoint.y * this.scale.getDistanceInPixels() / this.scale.getRealDistanceInCentimeters());
              this.data.push(gradientPoint);
            }
          });
        }
        this.loadMapImage().then((imgUrl: string): void => {
          this.addCanvas(imgUrl);
          this.cancelDialog();
        });
    });
  }
}

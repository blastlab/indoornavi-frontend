import {Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation} from '@angular/core';
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
import {MapComponent} from '../map/map';
import {HeatMapService} from './services/heatmap.service';
import {Subject} from 'rxjs/Subject';
import {HeatmapFilterProperties} from './heatmap-filter-properties/heatmap-filter-properties.type';
import {ZoomService} from '../shared/services/zoom/zoom.service';

@Component({
  templateUrl: './graphical-report.html',
  styleUrls: ['./graphical-report.css'],
  encapsulation: ViewEncapsulation.None
})
export class GraphicalReportComponent implements OnInit, OnDestroy {
  @ViewChild('map') mapComponent: MapComponent;
  displayDialog = false;
  isImageLoaded = false;
  private floor: Floor;
  private imageUrl: string;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private heatMapCanvas: HeatMapCanvas;
  private config: HeatMapCanvasConfig = heatMapCanvasConfiguration;
  private data: HeatMapGradientPoint[] = [];
  private subscribeDestroyer: Subject<void> = new Subject<void>();

  private static convertToIsoLocalDateString(date: Date): string {
    return new Date(date.getTime() - (date.getTimezoneOffset() * 60_000)).toISOString().slice(0, -1);
  }

  constructor(private route: ActivatedRoute,
              private floorService: FloorService,
              private breadcrumbService: BreadcrumbService,
              private translateService: TranslateService,
              private mapService: MapService,
              private reportService: ReportService,
              private messageService: MessageServiceWrapper,
              private publishedService: PublishedService,
              private heatMapService: HeatMapService,
              private zoomService: ZoomService
  ) {
  }

  ngOnInit() {
    this.translateService.setDefaultLang('en');
    this.subscribeToMapParametersChange();
  }

  ngOnDestroy() {
    this.isImageLoaded = false;
    this.removeCanvas();
    this.subscribeDestroyer.next();
  }

  renderNewHeatMap(properties: HeatmapFilterProperties) {
    if (this.validateDates(properties.from, properties.to)) {
      this.displayDialog = true;
      this.loadData(properties);
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

  private addCanvas(imgUrl: string, redrawImage: boolean = false) {
    this.removeCanvas();
    this.config.imgUrl = imgUrl;
    this.heatMapCanvas = new HeatMapCanvas(this.config, this.data, this.heatMapService);
    if (redrawImage) {
      this.heatMapService.drawn().first().subscribe(() => {
        const canvas = document.getElementsByTagName('canvas').item(0);
        if (!!canvas) {
          canvas.toBlob((blob: Blob) => {
            this.mapComponent.redrawImage(blob, this.zoomService.getCurrentZoomValue());
            if (this.displayDialog) {
              this.messageService.success('reports.message.loadedSuccess');
              this.cancelDialog();
            }
          });
        }
      });
    }
  }

  private validateDates(from: Date, to: Date): boolean {
    if (!from && !to) {
      this.messageService.failed('reports.message.setDate');
      return false;
    }
    if (from.getTime() > to.getTime()) {
      this.messageService.failed('reports.message.wrongDataSpan');
      return false;
    }
    return true;
  }

  private subscribeToMapParametersChange() {
    this.route.params.first().subscribe((params: Params): void => {
      const floorId = +params['id'];
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

  private loadData(properties: HeatmapFilterProperties): void {
    const request: SolverCoordinatesRequest = {
      from: GraphicalReportComponent.convertToIsoLocalDateString(properties.from),
      to: GraphicalReportComponent.convertToIsoLocalDateString(properties.to),
      floorId: this.floor.id,
      mapHeight: Math.ceil(this.config.height * this.scale.getRealDistanceInCentimeters() / this.scale.getDistanceInPixels()),
      mapWidth: Math.ceil(this.config.width * this.scale.getRealDistanceInCentimeters() / this.scale.getDistanceInPixels()),
      tagsIds: properties.tags.map((tag: Tag) => {
        return tag.id;
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
          this.addCanvas(imgUrl, true);
        });
      });
  }
}

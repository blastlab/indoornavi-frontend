import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Floor} from '../floor/floor.type';
import {Subject} from 'rxjs/Subject';
import {FloorService} from '../floor/floor.service';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {TranslateService} from '@ngx-translate/core';
import {Scale, ScaleCalculations} from '../map-editor/tool-bar/tools/scale/scale.type';
import {MapSvg} from '../map/map.type';
import {Geometry} from '../shared/utils/helper/geometry';
import {MapLoaderInformerService} from '../shared/services/map-loader-informer/map-loader-informer.service';
import {DrawBuilder} from '../shared/utils/drawing/drawing.builder';

@Component({
  templateUrl: './overview.html'
})
export class OverviewComponent implements OnInit, OnDestroy {

  public floor: Floor;
  private scale: Scale;
  private scaleCalculations: ScaleCalculations;
  private d3map: MapSvg = null;
  private heatmap: DrawBuilder;
  private subscriptionDestructor: Subject<void> = new Subject<void>();

  constructor(private route: ActivatedRoute,
              private floorService: FloorService,
              private breadcrumbService: BreadcrumbService,
              private translateService: TranslateService,
              private mapLoaderInformer: MapLoaderInformerService) {

  }

  ngOnInit() {
    this.setCorrespondingFloorParams();
    this.translateService.setDefaultLang('en');
    this.subscribeToMapParametersChange();
  }

  ngOnDestroy() {
    this.subscriptionDestructor.next();
    this.subscriptionDestructor = null;
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
          this.mapLoaderInformer.loadCompleted().first().subscribe((mapSvg: MapSvg) => {
            this.d3map = mapSvg;
            this.heatmap = new DrawBuilder(this.d3map.container, {id: `overview-heatmap-${this.floor.id}`, clazz: 'overview'});
            this.heatmap
              .createGroup()
              .addCanvas(`echart-${this.floor.id}`);
          });
        }
      });
    });
  }
}

import {AfterViewInit, Component, OnInit, ViewChild, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FloorService} from '../floor/floor.service';
import {Floor} from '../floor/floor.type';
import {Complex} from '../complex/complex.type';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {BuildingService} from '../building/building.service';
import {ContextMenu, MenuItem} from 'primeng/primeng';
import {ContextMenuService} from '../shared/wrappers/editable/editable.service';
import * as d3 from 'd3';
import {Subject} from 'rxjs/Subject';
import {LayersService} from './tool-bar/tools/layers/layers.service';
import {LayersOwner} from '../shared/utils/drawing/layers.owner';

@Component({
  templateUrl: 'map.controller.html'
})
export class MapControllerComponent implements OnInit, OnDestroy, AfterViewInit {
  imageUploaded: boolean;
  floor: Floor;
  contextMenuItems: MenuItem[] = [];

  private subscriptionsDestructor: Subject<void> = new Subject<void>();
  private layersOwner: LayersOwner;

  @ViewChild('contextMenu') contextMenu: ContextMenu;

  constructor(
    private route: ActivatedRoute,
    private floorService: FloorService,
    private buildingService: BuildingService,
    private breadcrumbsService: BreadcrumbService,
    private contextMenuService: ContextMenuService
  ) {}

  ngOnInit(): void {
    this.layersOwner = LayersOwner.getInstance();
    this.layersOwner.setAsNewOwner();
    this.route.params
      .subscribe((params: Params) => {
        const floorId = parseInt(params['floorId'], 10);
        const buildingId = +params['buildingId'];
        const complexId = +params['complexId'];
        this.floorService.getFloor(floorId).subscribe((floor: Floor) => {
          this.imageUploaded = !!floor.imageId;
          this.floor = floor;
          this.buildingService.getComplexWithBuildings(complexId).subscribe((complex: Complex) => {
            this.breadcrumbsService.publishIsReady([
              {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
              {label: complex.name, routerLink: `/complexes/${complexId}/buildings`, routerLinkActiveOptions: {exact: true}
              },
              {label: floor.building.name, routerLink: `/complexes/${complexId}/buildings/${buildingId}/floors`, routerLinkActiveOptions: {exact: true}},
              {label: `${(floor.name.length ? floor.name : floor.level)}`, disabled: true}
            ]);
          });
        });
      });

    this.contextMenuService.onItemsSet().takeUntil(this.subscriptionsDestructor).subscribe((items: MenuItem[]) => {
      this.contextMenuItems = items;
    });
  }

  ngOnDestroy() {
    this.subscriptionsDestructor.next();
    this.subscriptionsDestructor.unsubscribe();
  }

  ngAfterViewInit(): void {
    this.contextMenuService.onToggle().takeUntil(this.subscriptionsDestructor).subscribe(() => {
      if (!!this.contextMenu) {
        this.contextMenu.toggle(d3.event);
      }
    });

    this.contextMenuService.onHide().subscribe(() => {
      if (this.contextMenu) {
        this.contextMenu.hide();
      }
    });
  }

  onImageUploaded(floor: Floor): void {
    this.imageUploaded = true;
    this.floor = floor;
  }
}

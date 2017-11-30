import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {FloorService} from '../floor/floor.service';
import {Floor} from '../floor/floor.type';
import {Complex} from '../complex/complex.type';
import {BreadcrumbService} from '../shared/services/breadcrumbs/breadcrumb.service';
import {BuildingService} from '../building/building.service';

@Component({
  templateUrl: 'map.controller.html',
  styleUrls: ['./map.css']
})
export class MapControllerComponent implements OnInit {
  imageUploaded: boolean;
  floor: Floor;

  constructor(private route: ActivatedRoute,
              private floorService: FloorService,
              private buildingService: BuildingService,
              private breadcrumbsService: BreadcrumbService) {
  }

  ngOnInit(): void {
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
              {label: complex.name, routerLink: `/complexes/${complexId}/buildings`, routerLinkActiveOptions: {exact: true}},
              {label: floor.building.name, routerLink: `/complexes/${complexId}/buildings/${buildingId}/floors`, routerLinkActiveOptions: {exact: true}},
              {label: `${(floor.name.length ? floor.name : floor.level)}`, disabled: true}
            ]);
          });
        });
      });
  }

  onImageUploaded(floor: Floor): void {
    this.imageUploaded = true;
    this.floor = floor;
  }
}

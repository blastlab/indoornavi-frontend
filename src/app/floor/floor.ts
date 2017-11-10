import {Component, OnInit, ViewChild} from '@angular/core';
import {Floor} from './floor.type';
import {FloorService} from './floor.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {FloorDialogComponent} from './dialog/floor.dialog';
import {ToastService} from '../utils/toast/toast.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Building} from '../building/building.type';
import {BreadcrumbService} from '../utils/breadcrumbs/breadcrumb.service';
import {Complex} from '../complex/complex.type';
import {BuildingService} from '../building/building.service';

@Component({
  templateUrl: 'floor.html',
  styleUrls: ['floor.css']
})
export class FloorComponent implements OnInit {
  floors: Array<Floor> = [];

  floor: Floor;
  dialogRef: MdDialogRef<FloorDialogComponent>;

  private building: Building;
  private complexId: number;

  @ViewChild('floorForm') floorForm: NgForm;

  constructor(private floorService: FloorService,
              private dialog: MdDialog,
              private toast: ToastService,
              public translate: TranslateService,
              private route: ActivatedRoute,
              private router: Router,
              private buildingService: BuildingService,
              private breadcrumbsService: BreadcrumbService
  ) {
  }

  ngOnInit(): void {
    this.newFloor();
    this.route.params
    // (+) converts string 'id' to a number
      .subscribe((params: Params) => {
        const buildingId = +params['buildingId'];
        this.complexId = +params['complexId'];
        this.floorService.getBuildingWithFloors(buildingId).subscribe((building: Building) => {
          // todo change to one request instead of nested, after backend marge with new version
          this.floors = building.floors;
          this.building = building;
          this.newFloor();
          this.buildingService.getComplexWithBuildings(this.complexId).subscribe((complex: Complex) => {
            this.breadcrumbsService.publishIsReady([
              {label: 'Complexes', routerLink: '/complexes', routerLinkActiveOptions: {exact: true}},
              {label: complex.name, routerLink: `/complexes/${this.complexId}/buildings`, routerLinkActiveOptions: {exact: true}},
              {label: building.name, disabled: true}
            ]);
          });
        });
      });
    this.translate.setDefaultLang('en');
  }

  editFloor(floor: Floor): void {
    this.dialogRef = this.dialog.open(FloorDialogComponent);
    this.dialogRef.componentInstance.floor = {
      level: floor.level,
      name: floor.name,
      building: floor.building,
      id: floor.id
    };

    this.dialogRef.afterClosed().subscribe((newFloor: Floor) => {
      if (newFloor !== undefined) {
        floor.name = newFloor.name;
        floor.level = newFloor.level;
        floor.id = newFloor.id;
        this.toast.showSuccess('floor.save.success');
      }
      this.dialogRef = null;
    });
  }

  removeFloor(index: number): void {
    this.floorService.removeFloor(this.floors[index].id).subscribe(() => {
      this.floors.splice(index, 1);
      this.toast.showSuccess('floor.remove.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(FloorDialogComponent);
    this.dialogRef.componentInstance.floor = {
      level: this.getCurrentMaxLevel() + 1,
      name: '',
      building: this.building
    };

    this.dialogRef.afterClosed().subscribe(floor => {
      if (floor !== undefined) {
        this.floors.push(floor);
        this.toast.showSuccess('floor.create.success');
      }
      this.dialogRef = null;
    });
  }

  rearrangeFloors(): void {
    for (let i = 0; i < this.floors.length; i++) {
      // when floor position is first on list and next floor has lower level number than previous
      if (i === 0 && this.floors.length > 1 && this.floors[i + 1].level < this.floors[i].level) {
        this.floors[i].level = this.floors[i + 1].level - 1;
        // [4,5,6] -> [6,4,5] -> [3,4,5]
      }
      // when floor position is not first on list and previous floor has higher level number -> change current level to previous floor level + 1
      if (i > 0 && this.floors[i - 1].level >= this.floors[i].level) {
        this.floors[i].level = parseInt(<any>this.floors[i - 1].level, 10) + 1;
      }
      // when floor position is not first and not last on list
      // and previous and next floor levels are lower than current
      // than set current level to next floor level + 1
      if (i > 0 && i < this.floors.length - 1 &&
        this.floors[i - 1].level < this.floors[i].level && this.floors[i + 1].level < this.floors[i].level) {
        this.floors[i].level = parseInt(<any>this.floors[i - 1].level, 10) + 1;
      }
    }
    this.floorService.updateFloors(this.floors).subscribe(() => {
      this.toast.showSuccess('floor.order.success');
    });
  }

  private getCurrentMaxLevel(): number {
    let result = -1;
    let floorLevel: number;
    for (const floorData of this.floors) {
      floorLevel = parseInt(<any>floorData.level, 10);
      if (floorLevel > result) {
        result = floorLevel;
      }
    }
    return result;
  }

  openMap(floor: Floor): void {
    this.router.navigate(['/complexes', this.complexId, 'buildings', this.building.id, 'floors', floor.id, 'map']);
  }

  private newFloor(): void {
    this.floor = {
      level: this.getCurrentMaxLevel() + 1,
      name: '',
      building: this.building
    };
  }
}

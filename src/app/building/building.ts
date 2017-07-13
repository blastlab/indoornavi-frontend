import {Component, OnInit, ViewChild} from '@angular/core';
import {Building} from './building.type';
import {BuildingService} from './building.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {BuildingDialogComponent} from './building.dialog';
import {BuildingConfirmComponent} from './building.confirm';
import {ToastService} from '../utils/toast/toast.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {FloorService} from '../floor/floor.service';

@Component({
  selector: 'app-root',
  templateUrl: 'building.html',
  styleUrls: ['building.css']
})
export class BuildingComponent implements OnInit {
  buildings: Array<Building> = [];

  building: Building;
  dialogRef: MdDialogRef<BuildingDialogComponent>;
  confirmRef: MdDialogRef<BuildingConfirmComponent>;

  private complexId: number = 0;

  @ViewChild('buildingForm') buildingForm: NgForm;

  ngOnInit(): void {

    this.route.params
    // (+) converts string 'id' to a number
      .subscribe((params: Params) => {
        this.complexId = +params['complexId'];
        this.buildingService.getBuildings(this.complexId).subscribe((result: any) => {
          this.buildings = result.buildings;
        });
        this.newBuilding();
      });
    this.translate.setDefaultLang('en');
  }

  constructor(private buildingService: BuildingService,
              private dialog: MdDialog,
              private toast: ToastService,
              public translate: TranslateService,
              private router: Router,
              private floorService: FloorService,
              private route: ActivatedRoute) {
  }

  editBuilding(building: Building): void {
    this.dialogRef = this.dialog.open(BuildingDialogComponent);
    this.dialogRef.componentInstance.building = {
      name: building.name,
      complexId: building.complexId,
    };

    this.dialogRef.afterClosed().subscribe((newBuilding: Building) => {
      if (newBuilding !== undefined) { // dialog has been closed without save button clicked
        building.name = newBuilding.name;
        this.updateBuilding(building);
      }
      this.dialogRef = null;
    });
  }

  openBuildingRemoveConfirmationDialog(index: number): void {
    this.confirmRef = this.dialog.open(BuildingConfirmComponent);
    const buildingId: number = this.buildings[index].id;

    this.confirmRef.afterClosed().subscribe(state => {
      if (state) {
        this.removeBuildingRequest(index, buildingId);
      }
      this.dialogRef = null;
    });
  }

  removeBuilding(index: number): void {
    const buildingId: number = this.buildings[index].id;
    this.floorService.getFloors(buildingId).subscribe((result: any) => {
      if (result && result.floors && result.floors.length) {
        this.openBuildingRemoveConfirmationDialog(index);
      } else {
        this.removeBuildingRequest(index, buildingId);
      }
    });
  }

  updateBuilding(buildingToUpdate: Building): void {
    this.buildingService.updateBuilding(buildingToUpdate).subscribe((building: Building) => {
      this.toast.showSuccess('building.save.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(BuildingDialogComponent);
    this.dialogRef.componentInstance.building = {
      name: '',
      complexId: this.complexId
    };

    this.dialogRef.afterClosed().subscribe(building => {
      if (building !== undefined) {
        this.saveBuilding(building);
      }
      this.dialogRef = null;
    });
  }

  saveBuilding(building: Building) {
    this.buildingService.addBuilding(building).subscribe((newBuilding: Building) => {
      this.buildings.push(newBuilding);
      this.toast.showSuccess('building.create.success');
    }, (err: string) => {
      this.toast.showFailure(err);
    });
  }

  openBuilding(building: Building): void {
    this.router.navigate(['/complexes', this.complexId, 'buildings', building.id, 'floors']);
  }

  private removeBuildingRequest(index: number, buildingId: number) {
    this.buildingService.removeBuilding(buildingId).subscribe(() => {
      this.buildings.splice(index, 1);
      this.toast.showSuccess('building.remove.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  private newBuilding(): void {
    this.building = {
      name: '',
      complexId: this.complexId
    };
  }

}

import {Component, OnInit, ViewChild} from '@angular/core';
import {Building} from './building.type';
import {BuildingService} from './building.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {BuildingDialogComponent} from './building.dialog';
import {BuildingConfirmComponent} from './building.confirm';
import {ToastService} from '../utils/toast/toast.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {FloorService} from '../floor/floor.service';
import {Router} from '@angular/router';
import {ActivatedRoute, Params} from '@angular/router';

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
      this.complexId = +params['id'];
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
              private floorService: FloorService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  editBuilding(building: Building): void {
    this.dialogRef = this.dialog.open(BuildingDialogComponent);
    this.dialogRef.componentInstance.name = building.name;

    this.dialogRef.afterClosed().subscribe(result => {
      if (result === undefined) { // dialog has been closed without save button clicked
        // TODO: do we do anything here? if not, we should modify this if statement
      } else { // save button has been clicked and result variable contains new complex name
        building.name = result;
        this.saveBuilding(building);
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
    this.buildingService.removeBuilding(this.buildings[index].id, this.complexId ).subscribe(() => {
      this.buildings.splice(index, 1);
      this.toast.showSuccess('building.remove.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  addBuilding(model: Building, isValid: boolean): void {
    if (isValid) {
      model.complexId = this.complexId;
      this.buildingService.addBuilding(model).subscribe((newBuilding: Building) => {
        this.buildings.push(newBuilding);
        this.buildingForm.resetForm();
        this.toast.showSuccess('building.create.success');
      }, (msg: string) => {
        this.toast.showFailure(msg);
      });
    }
  }

  saveBuilding(buildingToUpdate: Building): void {
    this.buildingService.updateBuilding(buildingToUpdate).subscribe((building: Building) => {
      this.toast.showSuccess('building.save.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  openBuilding(building: Building): void {
    this.router.navigate(['/buildings', building.id, 'floors']);
  }

  private removeBuildingRequest(index: number, buildingId: number) {
    // this.buildingService.removeBuilding(buildingId).subscribe(() => {
    //  this.buildings.splice(index, 1);
    //  this.toast.showSuccess('building.remove.success');
    // } , (msg: string) => {
    //  this.toast.showFailure(msg);
    // });
  }

  private newBuilding(): void {
    this.building = {
      name: '',
      complexId: this.complexId
    };
  }

}

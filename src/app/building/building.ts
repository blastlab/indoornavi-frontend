import {Component, OnInit, ViewChild} from '@angular/core';
import {Building} from './building.type';
import {BuildingService} from './building.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {BuildingDialogComponent} from './building.dialog';
import {ToastService} from '../utils/toast/toast.service';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'building.html',
  styleUrls: ['building.css']
})

export class BuildingComponent implements OnInit {
  buildings: Array<Building> = [];

  public building: Building;
  private dialogRef: MdDialogRef<BuildingDialogComponent>;
  private complexId: number = 0;

  @ViewChild('buildingForm') buildingForm: NgForm;

  ngOnInit(): void {

    this.route.params
    // (+) converts string 'id' to a number
      .subscribe((params: Params) => {
        this.complexId = +params['id'];
        this.buildingService.getBuildings(this.complexId).subscribe((buildings: Array<Building>) => {
          this.buildings = buildings;
        });
        this.newBuilding();
      });
  }

  constructor(private buildingService: BuildingService,
              private dialog: MdDialog,
              private toast: ToastService,
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

  removeBuilding(index: number): void {
    this.buildingService.removeBuilding(this.buildings[index].id).subscribe(() => {
      this.buildings.splice(index, 1);
      this.toast.showSuccess('Building has been removed.');
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
        this.toast.showSuccess('Building has been created.');
      }, (msg: string) => {
        this.toast.showFailure(msg);
      });
    }
  }

  saveBuilding(complex: Building): void {
    this.buildingService.updateBuilding(complex).subscribe(() => {
      this.toast.showSuccess('Building has been saved.');
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

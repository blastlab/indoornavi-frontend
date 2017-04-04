import {Component, OnInit, ViewChild} from '@angular/core';
import {Floor} from './floor.type';
import {FloorService} from './floor.service';
import {MdDialog, MdDialogRef} from '@angular/material';
import {FloorDialogComponent} from './floor.dialog';
import {ToastService} from '../utils/toast/toast.service';
import {NgForm} from '@angular/forms';
import {TranslateService} from '@ngx-translate/core';
import {ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'floor.html',
  styleUrls: ['floor.css']
})

export class FloorComponent implements OnInit {
  floors: Array<Floor> = [];

  floor: Floor;
  dialogRef: MdDialogRef<FloorDialogComponent>;

  private buildingId: number = 0;

  @ViewChild('floorForm') floorForm: NgForm;

  ngOnInit(): void {

    this.route.params
    // (+) converts string 'id' to a number
    .subscribe((params: Params) => {
      this.buildingId = +params['id'];
      this.floorService.getFloors(this.buildingId).subscribe((result: any) => {
        this.floors = result.floors;
      });
      this.newFloor();
    });
    this.translate.setDefaultLang('en');
  }

  constructor(private floorService: FloorService,
              private dialog: MdDialog,
              private toast: ToastService,
              public translate: TranslateService,
              private route: ActivatedRoute) {
  }

  editFloor(floor: Floor): void {
    this.dialogRef = this.dialog.open(FloorDialogComponent);
    this.dialogRef.componentInstance.name = floor.name;
    this.dialogRef.componentInstance.level = floor.level;

    this.dialogRef.afterClosed().subscribe(result => {
      if (result === undefined) { // dialog has been closed without save button clicked
        // TODO: do we do anything here? if not, we should modify this if statement
      } else { // save button has been clicked and result variable contains new complex name
        floor.name = result;
        this.saveFloor(floor);
      }
      this.dialogRef = null;
    });
  }

  removeFloor(index: number): void {
    this.floorService.removeFloor(this.floors[index].id, this.buildingId ).subscribe(() => {
      this.floors.splice(index, 1);
      this.toast.showSuccess('floor.remove.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  addFloor(model: Floor, isValid: boolean): void {
    if (isValid) {
      model.buildingId = this.buildingId;
      this.floorService.addFloor(model).subscribe((newFloor: Floor) => {
        this.floors.push(newFloor);
        this.floorForm.resetForm();
        this.toast.showSuccess('floor.create.success');
      }, (msg: string) => {
        this.toast.showFailure(msg);
      });
    }
  }

  saveFloor(building: Floor): void {
    this.floorService.updateFloor(building).subscribe(() => {
      this.toast.showSuccess('floor.save.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  private newFloor(): void {
    this.floor = {
      level: 0,
      name: '',
      buildingId: this.buildingId
    };
  }
}

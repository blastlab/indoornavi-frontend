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
    this.newFloor();
    this.route.params
    // (+) converts string 'id' to a number
      .subscribe((params: Params) => {
        this.buildingId = +params['id'];
        this.floorService.getFloors(this.buildingId).subscribe((result: any) => {
          this.floors = result.floors;
          this.newFloor();
        });
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
    this.dialogRef.componentInstance.floor = {
      level: floor.level,
      name: floor.name,
      buildingId: floor.buildingId
    };

    this.dialogRef.afterClosed().subscribe((newFloor: Floor) => {
      if (newFloor !== undefined) {
        floor.name = newFloor.name;
        floor.level = newFloor.level;
        this.updateFloor(floor);
      }
      this.dialogRef = null;
    });
  }

  removeFloor(index: number): void {
    this.floorService.removeFloor(this.floors[index].id, this.buildingId).subscribe(() => {
      this.floors.splice(index, 1);
      this.toast.showSuccess('floor.remove.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  updateFloor(floorToUpdate: Floor): void {
    this.floorService.updateFloor(floorToUpdate).subscribe((floor: Floor) => {
      this.toast.showSuccess('floor.save.success');
    }, (msg: string) => {
      this.toast.showFailure(msg);
    });
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(FloorDialogComponent);
    this.dialogRef.componentInstance.floor = {
      level: this.getCurrentMaxLevel() + 1,
      name: '',
      buildingId: this.buildingId
    };

    this.dialogRef.afterClosed().subscribe(floor => {
      if (floor !== undefined) {
        this.saveFloor(floor);
      }
      this.dialogRef = null;
    });
  }

  saveFloor(floor: Floor) {
    this.floorService.addFloor(floor).subscribe((newFloor: Floor) => {
      this.floors.push(newFloor);
      this.toast.showSuccess('floor.create.success');
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
  }

  private getCurrentMaxLevel(): number {
    let result = 0;
    let floorLevel: number;
    for (const floorData of this.floors) {
      floorLevel = parseInt(<any>floorData.level, 10);
      if (floorLevel > result) {
        result = floorLevel;
      }
    }
    return result;
  }

  private newFloor(): void {
    this.floor = {
      level: this.getCurrentMaxLevel() + 1,
      name: '',
      buildingId: this.buildingId
    };
  }
}

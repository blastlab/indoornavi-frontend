import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Floor} from './floor.type';
import {FloorService} from './floor.service';
import {ToastService} from '../utils/toast/toast.service';

@Component({
  selector: 'app-floor-dialog',
  templateUrl: './floor.dialog.html',
  styleUrls: ['./floor.dialog.css']
})
export class FloorDialogComponent implements OnInit {
  floor: Floor;

  constructor(private dialogRef: MdDialogRef<FloorDialogComponent>,
              public translate: TranslateService,
              private toastService: ToastService,
              private floorService: FloorService) {
  }

  ngOnInit(): void {
  }

  save(valid: boolean): void {
    if (valid) {
      (!this.floor.id ? this.floorService.addFloor(this.floor) : this.floorService.updateFloor(this.floor))
        .subscribe((savedFloor: Floor) => {
            this.dialogRef.close(savedFloor);
          },
          (errorCode: string) => {
            this.toastService.showFailure(errorCode);
          }
        );
    }
  }

  close() {
    this.dialogRef.close(this.floor);
  }

}

import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Floor} from './floor.type';

@Component({
  selector: 'app-floor-dialog',
  templateUrl: './floor.dialog.html',
  styleUrls: ['./floor.dialog.css']
})
export class FloorDialogComponent implements OnInit {
  floor: Floor;
  public level: number = 0;
  public name: string = '';

  constructor(private dialogRef: MdDialogRef<FloorDialogComponent>, public translate: TranslateService) {
  }

  ngOnInit(): void {
  }

  save(valid: boolean): void {
    if (valid) {
      this.dialogRef.close(this.floor);
    }
  }

  updateLevelValue(): void {
    if (this.floor && this.floor.level) {
      this.floor.level = parseInt(this.floor.level.toString(), 10);
    }
  }

  close() {
    this.dialogRef.close(this.floor);
  }

}

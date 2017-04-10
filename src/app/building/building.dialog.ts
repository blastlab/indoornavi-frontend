import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Building} from './building.type';

@Component({
  selector: 'app-building-dialog',
  templateUrl: './building.dialog.html',
  styleUrls: ['./building.dialog.css']
})
export class BuildingDialogComponent implements OnInit {
  building: Building;
  public name: string = '';

  constructor(private dialogRef: MdDialogRef<BuildingDialogComponent>, public translate: TranslateService) {
  }

  ngOnInit(): void {
  }

  save(valid: boolean): void {
    if (valid) {
      this.dialogRef.close(this.building);
    }
  }

  close(): void {
    this.dialogRef.close();
  }

}

import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'app-building-dialog',
  templateUrl: './building.dialog.html',
  styleUrls: ['./building.dialog.css']
})
export class BuildingDialogComponent implements OnInit {
  public name: string = '';

  ngOnInit(): void {
  }

  constructor(private dialogRef: MdDialogRef<BuildingDialogComponent>) {
  }

  close() {
    this.dialogRef.close(this.name);
  }

}

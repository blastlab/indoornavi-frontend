import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'building-dialog',
  templateUrl: './building.dialog.html',
  styleUrls: ['./building.dialog.css']
})
export class BuildingDialog implements OnInit {
  private name: string = '';

  ngOnInit(): void {
  }

  constructor(private dialogRef: MdDialogRef<BuildingDialog>) {
  }

  setName(name: string): void {
    this.name = name;
  }

  close() {
    this.dialogRef.close(this.name);
  }

}

import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'app-floor-dialog',
  templateUrl: './floor.dialog.html',
  styleUrls: ['./floor.dialog.css']
})
export class FloorDialogComponent implements OnInit {
  public level: number = 0;
  public name: string = '';

  ngOnInit(): void {
  }

  constructor(private dialogRef: MdDialogRef<FloorDialogComponent>) {
  }

  close() {
    this.dialogRef.close(this.name);
  }

}

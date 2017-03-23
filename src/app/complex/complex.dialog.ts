import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'complex-dialog',
  templateUrl: './complex.dialog.html',
  styleUrls: ['./complex.dialog.css']
})
export class ComplexDialog implements OnInit {
  private name: string = '';

  ngOnInit(): void {
  }

  constructor(private dialogRef: MdDialogRef<ComplexDialog>) {
  }

  setName(name: string): void {
    this.name = name;
  }

  close() {
    this.dialogRef.close(this.name);
  }

}

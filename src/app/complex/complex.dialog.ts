import {Component} from '@angular/core';
import {MdDialogRef} from '@angular/material';

@Component({
  selector: 'complex-dalog',
  templateUrl: './complex.dialog.html',
  styleUrls: ['./complex.dialog.css']
})
export class ComplexDialog {

  public newComplexName:string = '';

  constructor(public dialogRef:MdDialogRef<any>) {
  }

}

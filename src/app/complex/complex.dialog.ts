import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';
import {Complex} from './complex.type';

@Component({
  selector: 'app-complex-dialog',
  templateUrl: './complex.dialog.html',
  styleUrls: ['./complex.dialog.css']
})
export class ComplexDialogComponent implements OnInit {
  complex: Complex;

  constructor(private dialogRef: MdDialogRef<ComplexDialogComponent>, public translate: TranslateService) {
  }

  ngOnInit(): void {
  }

  save(valid: boolean): void {
    if (valid) {
      this.dialogRef.close(this.complex);
    }
  }

  close() {
    this.dialogRef.close(this.complex);
  }

}

import {Component, OnInit} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-complex-dialog',
  templateUrl: './complex.dialog.html',
  styleUrls: ['./complex.dialog.css']
})
export class ComplexDialogComponent implements OnInit {
  public name: string = '';

  ngOnInit(): void {
  }

  constructor(private dialogRef: MdDialogRef<ComplexDialogComponent>, public translate: TranslateService) {
  }

  close() {
    this.dialogRef.close(this.name);
  }

}

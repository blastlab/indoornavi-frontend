import {OnInit, Component} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {Anchor} from './anchor.type';

@Component({
  selector: 'app-anchor-dialog',
  templateUrl: './anchor.dialog.html',
  styleUrls: ['./anchor.dialog.css']
})
export class AnchorDialogComponent implements OnInit {
  anchor: Anchor;

  constructor(private dialogRef: MdDialogRef<AnchorDialogComponent>) {
  }

  ngOnInit(): void {
  }

  save(valid: boolean): void {
    if (valid) {
      this.dialogRef.close(this.anchor);
    }
  }

}

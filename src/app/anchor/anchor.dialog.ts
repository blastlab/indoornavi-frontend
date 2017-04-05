import {OnInit, Component} from '@angular/core';
import {MdDialogRef} from '@angular/material';
import {Anchor} from './anchor.type';
import {AnchorService} from './anchor.service';
import {ToastService} from '../utils/toast/toast.service';

@Component({
  selector: 'app-anchor-dialog',
  templateUrl: './anchor.dialog.html',
  styleUrls: ['./anchor.dialog.css']
})
export class AnchorDialogComponent implements OnInit {
  anchor: Anchor;

  constructor(private dialogRef: MdDialogRef<AnchorDialogComponent>,
              private anchorService: AnchorService,
              private toastService: ToastService) {
  }

  ngOnInit(): void {
  }

  save(valid: boolean): void {
    if (valid) {
      (!this.anchor.id ? this.anchorService.createAnchor(this.anchor) : this.anchorService.updateAnchor(this.anchor))
        .subscribe((savedAnchor: Anchor) => {
            this.dialogRef.close(savedAnchor);
          },
          (errorCode: string) => {
            this.toastService.showFailure(errorCode);
          }
        );
    }
  }
}

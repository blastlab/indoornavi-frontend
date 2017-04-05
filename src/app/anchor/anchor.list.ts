import {Component, OnInit, Input} from '@angular/core';
import {Anchor} from './anchor.type';
import * as Collections from 'typescript-collections';
import {AnchorService} from './anchor.service';
import {AnchorDialogComponent} from './anchor.dialog';
import {MdDialog, MdDialogRef} from '@angular/material';
import {ToastService} from '../utils/toast/toast.service';

@Component({
  selector: 'app-anchor-list',
  templateUrl: './anchor.list.html',
  styleUrls: ['./anchor.css']
})
export class AnchorListComponent implements OnInit {

  @Input()
  verified: boolean;

  anchors: Collections.Dictionary<number, Anchor> = new Collections.Dictionary<number, Anchor>();

  dialogRef: MdDialogRef<AnchorDialogComponent>;
  private lockedAnchor: Anchor = null;

  constructor(private anchorService: AnchorService, private dialog: MdDialog, private toastService: ToastService) {
  }

  ngOnInit() {

  }

  getAnchors(): Anchor[] {
    return this.anchors.values();
  }

  isLocked(anchor: Anchor): boolean {
    return this.lockedAnchor !== null && anchor.id === this.lockedAnchor.id;
  }

  addToList($event: any): void {
    this.lockedAnchor = $event.dragData;
    this.lockedAnchor.verified = this.verified;
    this.anchorService.updateAnchor(this.lockedAnchor).subscribe((updatedAnchor: Anchor) => {
      this.anchors.setValue(updatedAnchor.id, updatedAnchor);
      this.lockedAnchor = null;
      this.toastService.showSuccess('anchor.save.success');
    });
  }

  removeFromList($event: any): void {
    const anchor: Anchor = $event.dragData;
    this.anchors.remove(anchor.id);
  }

  openDialog(anchor: Anchor): void {
    this.dialogRef = this.dialog.open(AnchorDialogComponent);
    this.dialogRef.componentInstance.anchor = {...anchor}; // copy

    this.dialogRef.afterClosed().subscribe(anchorFromDialog => {
      if (anchorFromDialog !== undefined) {
        this.toastService.showSuccess('anchor.save.success');
      }
      this.dialogRef = null;
    });
  }

  remove(anchor: Anchor): void {
    this.anchorService.removeAnchor(anchor.id).subscribe(() => {
      this.anchors.remove(anchor.id);
      this.toastService.showSuccess('anchor.remove.success');
    });
  }

}

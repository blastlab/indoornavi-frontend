import {Component, OnInit, ViewChild, NgZone, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {SocketService} from '../utils/socket/socket.service';
import {Anchor} from './anchor.type';
import {AnchorListComponent} from './anchor.list';
import {MdDialogRef, MdDialog} from '@angular/material';
import {AnchorDialogComponent} from './anchor.dialog';
import {Config} from '../../config';
import {TranslateService} from '@ngx-translate/core';
import {ToastService} from '../utils/toast/toast.service';

@Component({
  selector: 'app-root',
  templateUrl: './anchor.html',
  styleUrls: ['./anchor.css']
})
export class AnchorComponent implements OnInit, OnDestroy {

  private socketSubscription: Subscription;
  @ViewChild('verified')
  private verifiedList: AnchorListComponent;
  @ViewChild('notVerified')
  private notVerifiedList: AnchorListComponent;

  dialogRef: MdDialogRef<AnchorDialogComponent>;

  constructor(private socketService: SocketService,
              private dialog: MdDialog,
              public translate: TranslateService,
              private toastService: ToastService,
              private ngZone: NgZone) {
  }

  get verified(): Anchor[] {
    return this.verifiedList.getAnchors();
  }

  get notVerified(): Anchor[] {
    return this.notVerifiedList.getAnchors();
  }

  ngOnInit() {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'anchors/registration?anchor');

      this.socketSubscription = stream.subscribe((anchors: Array<Anchor>) => {
        this.ngZone.run(() => {
          anchors.forEach((anchor: Anchor) => {
            console.log(anchor);
            if (this.verifiedList.isLocked(anchor) || this.notVerifiedList.isLocked(anchor)) {
              return;
            }
            if (anchor.verified) {
              this.verifiedList.anchors.setValue(anchor.id, anchor);
              this.notVerifiedList.anchors.remove(anchor.id);
            } else {
              this.notVerifiedList.anchors.setValue(anchor.id, anchor);
              this.verifiedList.anchors.remove(anchor.id);
            }
          });
        });
      });

    });

    this.translate.setDefaultLang('en');
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
  }

  openDialog(): void {
    this.dialogRef = this.dialog.open(AnchorDialogComponent);
    this.dialogRef.componentInstance.anchor = {
      id: null,
      shortId: null,
      longId: null,
      verified: false,
      name: ''
    };

    this.dialogRef.afterClosed().subscribe(anchor => {
      if (anchor !== undefined) {
        this.toastService.showSuccess('anchor.create.success');
      }
      this.dialogRef = null;
    });
  }

}


import {Component, OnInit, ViewChild, NgZone, OnDestroy} from '@angular/core';
import {Subscription} from 'rxjs/Rx';
import {SocketService} from '../utils/socket/socket.service';
import {Anchor} from './anchor.type';
import {AnchorListComponent} from './anchor.list';
import {MdDialogRef, MdDialog} from '@angular/material';
import {AnchorDialogComponent} from './anchor.dialog';
import {Config} from '../../config';
import {AnchorService} from './anchor.service';
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
  private repeatSend: any;

  dialogRef: MdDialogRef<AnchorDialogComponent>;

  constructor(private socketService: SocketService,
              private dialog: MdDialog,
              private anchorService: AnchorService,
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
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'anchors/registration?client');

      this.socketSubscription = stream.subscribe((anchors: Array<Anchor>) => {
        this.ngZone.run(() => {
          anchors.forEach((anchor: Anchor) => {
            if (this.verifiedList.isLocked(anchor) || this.notVerifiedList.isLocked(anchor)) { return; }
            if (this.verifiedList.anchors.containsKey(anchor.id) || this.notVerifiedList.anchors.containsKey(anchor.id)) { return; }
            if (anchor.verified) {
              this.verifiedList.anchors.setValue(anchor.id, anchor);
            } else {
              this.notVerifiedList.anchors.setValue(anchor.id, anchor);
            }
          });
        });
      });

      this.repeatSend = setInterval(() => {
        this.socketService.send({});
      }, 5000);

      this.socketService.send({});
    });

    this.translate.setDefaultLang('en');
  }

  ngOnDestroy() {
    if (this.socketSubscription) {
      this.socketSubscription.unsubscribe();
    }
    if (this.repeatSend) {
      clearInterval(this.repeatSend);
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
        this.saveAnchor(anchor);
      }
      this.dialogRef = null;
    });
  }

  private saveAnchor(anchor: Anchor) {
    this.anchorService.createAnchor(anchor).subscribe((newAnchor: Anchor) => {
      this.notVerifiedList.anchors.setValue(newAnchor.id, newAnchor);
      this.toastService.showSuccess('anchor.create.success');
    });
  }

}


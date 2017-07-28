import {Component, NgZone, OnInit} from '@angular/core';
import * as Collections from 'typescript-collections';
import {SocketService} from '../../../../../utils/socket/socket.service';
import {Config} from '../../../../../../config';
import {Anchor} from '../../../../../anchor/anchor.type';
import {Subscription} from 'rxjs/Subscription';
import {DeviceService} from 'app/device/device.service';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from '../anchor-placer.controller';

@Component({
  selector: 'app-remaining-devices-list',
  templateUrl: './remaining-devices-list.html',
  styleUrls: ['./remaining-devices-list.css']
})
export class RemainingDevicesListComponent implements OnInit {
  public showAnchorsList: boolean = false;
  private socketSubscription: Subscription;
  private remainingAnchors: Collections.Dictionary<number, Anchor> = new Collections.Dictionary<number, Anchor>();
  public anchors: Anchor[];

  constructor(private ngZone: NgZone,
              private socketService: SocketService,
              public translate: TranslateService,
              private deviceService: DeviceService,
              private anchorPlacerController: AnchorPlacerController) {
  }

  ngOnInit() {
    this.fetchDevices();
    this.controlListVisibility();
    this.deviceService.setUrl('anchors/');
  }

  private fetchDevices() {
    this.ngZone.runOutsideAngular(() => {
      const stream = this.socketService.connect(Config.WEB_SOCKET_URL + 'devices/registration?anchor');

      this.socketSubscription = stream.subscribe((anchors: Array<Anchor>) => {
        this.ngZone.run(() => {
          anchors.forEach((anchor: Anchor) => {
            // TODO if anchor.isPlacedOnMap -> remainingAnchors.remove(anchor) ?
            this.remainingAnchors.setValue(anchor.id, anchor);
          });
        });
        this.anchors = this.getRemainingAnchors();
      });

    });
  }

  getRemainingAnchors(): Anchor[] {
    return this.remainingAnchors.values();
    // TODO - secure case when there are no anchors
  }

  private toggleAnchorIsPlacedFlag(): void {
    // this.deviceService.update();
  }

  private controlListVisibility(): void {
    this.anchorPlacerController.listVisibilitySet.subscribe((visible) => {
      this.showAnchorsList = visible;
      // TODO animate position by changing attr `left`
    });
  }

  public anchorToPlaceChosen(anchor: Anchor): void {
    this.anchorPlacerController.setChosenAnchor(anchor);
  }

  anchorDragStarted(anchor: Anchor) {
    console.log('started');
    console.log(anchor);
  }

  logMsg(msg: string) {
    console.log(msg);
  }

  private hideList(): void {
    this.anchorPlacerController.setListVisibility(false);
  }

  private showList(): void {
    this.anchorPlacerController.setListVisibility(true);
  }

}

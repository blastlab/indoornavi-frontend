import {Component, NgZone, OnInit} from '@angular/core';
import * as Collections from 'typescript-collections';
import {SocketService} from '../../../../../utils/socket/socket.service';
import {Config} from '../../../../../../config';
import {Anchor} from '../../../../../anchor/anchor.type';
import {Subscription} from 'rxjs/Subscription';
import {DeviceService} from 'app/device/device.service';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from '../anchor.controller';
import {Sink} from '../../../../../sink/sink.type';

@Component({
  selector: 'app-remaining-devices-list',
  templateUrl: './map-anchors-list.html',
  styleUrls: ['./map-anchors-list.css']
})
export class RemainingDevicesListComponent implements OnInit {
  public showAnchorsList: boolean = false;
  private socketSubscription: Subscription;
  private remainingAnchors: Collections.Dictionary<number, Anchor> = new Collections.Dictionary<number, Anchor>();
  public anchors: Anchor[];
  public sinks: Sink[];

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
            if (!anchor.floorId) {
              this.remainingAnchors.setValue(anchor.id, anchor);
            }
          });
        });
        this.anchors = this.getRemainingAnchors();
      });
    });
    this.anchorPlacerController.getSinks().first().subscribe((sinks) => {
      this.sinks = sinks;
      console.log(this.sinks);
    });
  }

  getRemainingAnchors(): Anchor[] {
    return this.remainingAnchors.values();
  }

  public removeFromList(anchor: Anchor) {
    const index: number = this.anchors.indexOf(anchor);
    if (index !== -1) {
      this.anchors.splice(index, 1);
    }
    console.log('del?');
  }

  private toggleAnchorIsPlacedFlag(evt: Event): void {
    console.log(evt);
    // this.deviceService.update();
  }

  private controlListVisibility(): void {
    this.anchorPlacerController.listVisibilitySet.subscribe((visibility) => {
      this.showAnchorsList = visibility;
      // TODO animate position by changing attr `left`
    });
  }

  anchorDragStarted(anchor: Anchor) {
    console.log('started');
    // TODO publish new hint about dnd
  }

}

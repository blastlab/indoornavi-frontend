import {animate, Component, NgZone, OnInit, state, style, transition, trigger} from '@angular/core';
import {DeviceService} from 'app/device/device.service';
import {TranslateService} from '@ngx-translate/core';
import {AnchorPlacerController} from '../anchor.controller';
import * as d3 from 'd3';
import {AnchorPlacerComponent} from '../anchor';
import {Anchor} from '../../../../../device/anchor.type';
import {Sink} from '../../../../../device/sink.type';
import {Device} from '../../../../../device/device.type';

@Component({
  selector: 'app-remaining-devices-list',
  templateUrl: './map-anchors-list.html',
  styleUrls: ['./map-anchors-list.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(100%, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      transition('in => out', animate('400ms ease-in-out')),
      transition('out => in', animate('400ms ease-in-out'))
    ]),
  ]
})
export class RemainingDevicesListComponent implements OnInit {
  private remainingDevices: Device[] = [];
  public anchors: Anchor[];
  public sinks: Sink[];
  public chosenSink: Sink;
  private menuState: string = 'out';
  public selectedDevice: Sink | Anchor;
  public queryString;

  constructor(public translate: TranslateService,
              private deviceService: DeviceService,
              private anchorPlacerController: AnchorPlacerController) {
  }

  ngOnInit() {
    this.fetchDevices();
    this.controlListVisibility();
    this.controlListState();
  }

  private fetchDevices() {
    this.deviceService.setUrl('anchors/');
    this.deviceService.getAll().subscribe((devices: Device[]) => {
      devices.forEach((device: Anchor|Sink) => {
        if (device.verified) {
          this.remainingDevices.push(device);
        }
      });
    });
  }

  private controlListVisibility(): void {
    this.anchorPlacerController.listVisibilitySet.subscribe(() => {
      this.toggleMenu();
    });
  }

  private toggleMenu() {
    this.menuState = this.menuState === 'out' ? 'in' : 'out';
  }

  private controlListState(): void {
    this.anchorPlacerController.chosenSink.subscribe((chosenSink) => {
      this.chosenSink = chosenSink;
    });
  }

  public selectDevice() {
    this.toggleMenu();
    const mapAnchors = d3.select('#map').selectAll('.anchor');
    mapAnchors.style('cursor', 'crosshair');
    mapAnchors.on('click', (event) => {
      this.toggleMenu();
    });
  }

}

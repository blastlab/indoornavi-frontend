import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {DevicePlacerController} from '../device-placer.controller';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {Expandable} from '../../../../../shared/utils/drawing/drawables/expandable';
import {Anchor, Sink} from '../../../../../device/device.type';

@Component({
  selector: 'app-devices-list',
  templateUrl: './devices-list.html',
  styleUrls: ['./devices-list.css']
})
export class DevicesListComponent implements OnInit, OnDestroy {
  public remainingDevices: Array<Anchor | Sink> = [];
  public queryString: string;
  public selectedDevice: Expandable;
  @ViewChild(`toolDetails`) private devicesList: ToolDetailsComponent;
  private devices = new Set<Anchor | Sink>();
  private addSubscription: Subscription;
  private removeSubscription: Subscription;
  private listVisibility: Subscription;
  private selectedElement: Subscription;
  private deselection: Subscription;
  private connectingState: Subscription;
  private connectingFlag: boolean;

  constructor(public translate: TranslateService,
              private devicePlacerController: DevicePlacerController) {
  }

  ngOnInit(): void {
    this.addSubscription = this.devicePlacerController.addedDevice.subscribe((device) => {
      this.addDevice(device);
      this.populateDevicesList();
    });
    this.removeSubscription = this.devicePlacerController.removedDevice.subscribe((device) => {
      this.removeDevice(device);
      this.populateDevicesList();
    });
    this.listVisibility = this.devicePlacerController.listVisibility.subscribe((shown) => {
      shown ? this.devicesList.show() : this.devicesList.hide();
    });
    this.deselection = this.devicePlacerController.deselected.subscribe((device) => {
      if (this.selectedDevice === device) {this.selectedDevice = null}
    });
    this.selectedElement = this.devicePlacerController.getSelectedDevice().subscribe((selected) => {
      this.selectedDevice = selected;
    });
    this.connectingState = this.devicePlacerController.connectingMode.subscribe((state: boolean) => {
      this.connectingFlag = state;
    })
  }

  ngOnDestroy(): void {
    this.addSubscription.unsubscribe();
    this.removeSubscription.unsubscribe();
    this.listVisibility.unsubscribe();
    this.deselection.unsubscribe();
    this.selectedElement.unsubscribe();
    this.connectingState.unsubscribe();
  }

  public dragDeviceStarted(device: Anchor | Sink): void {
    this.devicePlacerController.emitDeviceDragStarted(device);
  }

  public dragDeviceEnded(): void {
    this.devicePlacerController.emitDeviceDragEnded();
  }

  public modifyConnections(): void {
    this.devicePlacerController.setConnectingMode(!this.connectingFlag);
  }

  public deleteDevice(): void {
    this.devicePlacerController.emitDeleteButtonClicked();
  }

  public getDevices(): Array<Anchor | Sink> {
    return Array.from(this.devices);
  }

  private addDevice(device: Anchor | Sink): Set<Anchor | Sink> {
    return this.devices.add(device);
  }

  private removeDevice(device: Anchor | Sink): boolean {
    return this.devices.delete(device);
  }

  private populateDevicesList(): void {
    this.remainingDevices = this.getDevices();
  }

}

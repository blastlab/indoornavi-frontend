import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DevicePlacerService} from '../device-placer.service';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {DeviceService} from '../../../../../device/device.service';


@Component({
  selector: 'app-device-placer-list',
  templateUrl: './device-placer.list.html'
})
export class DevicePlacerListComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;
  public displayedDevices: Array<Anchor | Sink> = [];
  public queryString: string;
  public heightInMeters: number = 2;
  private activationSubscription: Subscription;
  private deviceDragging: Subscription;
  private deviceDroppingInside: Subscription;
  private deviceDroppingOutside: Subscription;
  private anchors: Array<Anchor> = [];
  private sinks: Array<Sink> = [];
  private draggedDevice: Sink | Anchor;

  constructor(
    private devicePlacerService: DevicePlacerService,
    private deviceService: DeviceService,
  ) {

  }

  ngOnInit() {
    this.listenToToolActivation();
    this.listenToDeviceDragAndDrop();
    this.fetchAllDevices();
  }

  ngOnDestroy() {
    this.activationSubscription.unsubscribe();
    this.deviceDragging.unsubscribe();
    this.deviceDroppingOutside.unsubscribe();
    this.deviceDroppingInside.unsubscribe();
  }

  deviceDragStarted(device: Anchor | Sink): void {
    this.devicePlacerService.emitDragStarted(device);
  }

  deviceDragEnded(): void {
    this.devicePlacerService.emitDroppedOutside();
  }

  private listenToToolActivation(): void {
    this.activationSubscription = this.devicePlacerService.onListVisibility.subscribe((visible: boolean): void => {
      visible ? this.toolDetails.show() : this.toolDetails.hide();
    });
  }

  private listenToDeviceDragAndDrop(): void {
    this.deviceDragging = this.devicePlacerService.onDragStarted.subscribe((device: Sink | Anchor): void => {
      this.draggedDevice = device;
    });
    this.deviceDroppingOutside = this.devicePlacerService.onDroppedOutside.subscribe((): void => {
      this.draggedDevice = null;
    });
    this.deviceDroppingInside = this.devicePlacerService.onDroppedInside.subscribe((): void => {
      this.removeDraggedDevice();
    });
  }

  private fetchAllDevices(): void {
    this.sinks = [];
    this.anchors = [];
    this.deviceService.setUrl('sinks/');
    this.deviceService.getAll().subscribe((sinks: Sink[]): void => {
      sinks.forEach((sink: Sink): void => {
        this.sinks.push(sink);
      });
    });
    this.deviceService.setUrl('anchors/');
    this.deviceService.getAll().subscribe((anchors: Anchor[]): void => {
      anchors.forEach((anchor: Anchor): void => {
        this.anchors.push(anchor);
      });
    });
    // TODO: check what devices needs to be set as displayed
    this.displayedDevices = this.sinks;
  }

  private removeDraggedDevice(): void {
    if (!!this.draggedDevice) {
      const index: number = this.displayedDevices.indexOf(this.draggedDevice);
      this.displayedDevices.splice(index, 1);
    }
  }

}

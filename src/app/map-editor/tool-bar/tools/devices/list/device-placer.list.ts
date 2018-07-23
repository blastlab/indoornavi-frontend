import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DeviceDto, DevicePlacerService, DeviceType} from '../device-placer.service';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {DeviceService} from '../../../../../device/device.service';
import {DeviceInEditor} from '../../../../../map/models/device';
import {SinkInEditor} from '../../../../../map/models/sink';
import {AnchorInEditor} from '../../../../../map/models/anchor';


@Component({
  selector: 'app-device-placer-list',
  templateUrl: './device-placer.list.html'
})
export class DevicePlacerListComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;
  public displayedDevices: Array<Anchor | Sink> = [];
  public queryString: string;
  public heightInMeters: number = 2;
  private activeList: DeviceType;
  private activationSubscription: Subscription;
  private deviceDragging: Subscription;
  private deviceDroppingInside: Subscription;
  private deviceDroppingOutside: Subscription;
  private mapClickEvent: Subscription;
  private deviceActivation: Subscription;
  private deviceRemoveInEditor: Subscription;
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
    this.listenToMapClick();
    this.listenToActiveDeviceInEditor();
    this.listenToRemovedDeviceInEditor();
    this.fetchAllDevices();
  }

  ngOnDestroy() {
    this.activationSubscription.unsubscribe();
    this.deviceDragging.unsubscribe();
    this.deviceDroppingOutside.unsubscribe();
    this.deviceDroppingInside.unsubscribe();
    this.mapClickEvent.unsubscribe();
    this.deviceActivation.unsubscribe();
    this.deviceRemoveInEditor.unsubscribe();
  }

  deviceDragStarted(device: Anchor | Sink): void {
    const deviceDto: DeviceDto = {
      device: device,
      type: this.activeList
    };
    this.devicePlacerService.emitDragStarted(deviceDto);
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
    this.deviceDragging = this.devicePlacerService.onDragStarted.subscribe((deviceDto: DeviceDto): void => {
      this.draggedDevice = deviceDto.device;
    });
    this.deviceDroppingOutside = this.devicePlacerService.onDroppedOutside.subscribe((): void => {
      this.draggedDevice = null;
    });
    this.deviceDroppingInside = this.devicePlacerService.onDroppedInside.subscribe((): void => {
      this.removeDraggedDevice();
      if (this.activeList === DeviceType.SINK) {
        this.activeList = DeviceType.ANCHOR;
      }
      this.setDisplayedDevices();
    });
  }

  private listenToMapClick(): void {
    this.mapClickEvent = this.devicePlacerService.onMapClick.subscribe((): void => {
      this.activeList = DeviceType.SINK;
      this.setDisplayedDevices();
    });
  }

  private listenToActiveDeviceInEditor(): void {
    this.deviceActivation = this.devicePlacerService.onActive.subscribe((device: DeviceInEditor): void => {
      const type = (<AnchorInEditor | SinkInEditor>device).type;
      if (type === DeviceType.SINK) {
        this.activeList = DeviceType.ANCHOR;
        this.setDisplayedDevices();
      } else if (type === DeviceType.ANCHOR) {
        this.activeList = null;
        this.setDisplayedDevices();
      }
    });
  }

  private listenToRemovedDeviceInEditor(): void {
    this.deviceRemoveInEditor = this.devicePlacerService.onRemovedFromMap.subscribe((device: DeviceInEditor): void => {
      // TODO: change for device type SINK | ANCHOR
      const type: DeviceType = (<SinkInEditor | AnchorInEditor>device).type;
      if (type === DeviceType.SINK) {
        const sink = <SinkInEditor>device;
        console.log('removed device should to be added back to corresponding list and displayed');
      }
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
    this.activeList = DeviceType.SINK;
    this.setDisplayedDevices();
  }

  private removeDraggedDevice(): void {
    if (!!this.draggedDevice) {
      const index: number = this.displayedDevices.indexOf(this.draggedDevice);
      this.displayedDevices.splice(index, 1);
    }
  }

  private setDisplayedDevices() {
    if (this.activeList === DeviceType.ANCHOR) {
      this.displayedDevices = this.anchors;
    } else if (this.activeList === DeviceType.SINK) {
      this.displayedDevices = this.sinks;
    } else {
      this.displayedDevices = [];
    }
  }

}

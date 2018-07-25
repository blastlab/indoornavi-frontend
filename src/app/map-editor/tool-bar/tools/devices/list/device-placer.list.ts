import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DevicePlacerService,} from '../device-placer.service';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {DeviceService} from '../../../../../device/device.service';
import {DeviceInEditor} from '../../../../../map/models/device';
import {AnchorBag, DeviceDto, DeviceType, SinkBag} from '../device-placer/device-placer.types';


@Component({
  selector: 'app-device-placer-list',
  templateUrl: './device-placer.list.html'
})
export class DevicePlacerListComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;
  public activeList: Array<Anchor | Sink> = [];
  public queryString: string;
  public heightInMeters: number = 2;
  public activeListType: DeviceType;
  private activationSubscription: Subscription;
  private tableRenderedSubscription: Subscription;
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
    this.listenOnToolActivation();
    this.listenOnDeviceDragAndDrop();
    this.listenOnMapClick();
    this.listenOnActiveDeviceInEditor();
    this.listenOnUnsetDeviceInEditor();
    this.listenOnTableRendered();
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
    this.tableRenderedSubscription.unsubscribe();
  }


  deviceDragStarted(device: Anchor | Sink): void {
    const deviceDto: DeviceDto = {
      device: device,
      type: this.activeListType
    };
    this.devicePlacerService.emitDragStarted(deviceDto);
  }

  deviceDragEnded(): void {
    this.devicePlacerService.emitDroppedOutside();
  }

  private listenOnTableRendered(): void {
    this.tableRenderedSubscription = this.devicePlacerService.onTableRendered.subscribe((): void => {
      this.toolDetails.updateContainersShifts();
    });
  }

  private listenOnToolActivation(): void {
    this.activationSubscription = this.devicePlacerService.onListVisibility.subscribe((visible: boolean): void => {
      visible ? this.toolDetails.show() : this.toolDetails.hide();
    });
  }

  private listenOnDeviceDragAndDrop(): void {
    this.deviceDragging = this.devicePlacerService.onDragStarted.subscribe((deviceDto: DeviceDto): void => {
      this.draggedDevice = deviceDto.device;
    });
    this.deviceDroppingOutside = this.devicePlacerService.onDroppedOutside.subscribe((): void => {
      this.draggedDevice = null;
    });
    this.deviceDroppingInside = this.devicePlacerService.onDroppedInside.subscribe((): void => {
      this.removeDraggedDevice();
      if (this.activeListType === DeviceType.SINK) {
        this.activeListType = DeviceType.ANCHOR;
      }
    });
  }

  private listenOnMapClick(): void {
    this.mapClickEvent = this.devicePlacerService.onMapClick.subscribe((): void => {
      this.activeListType = DeviceType.SINK;
      this.setActiveDevices();
    });
  }

  private listenOnActiveDeviceInEditor(): void {
    this.deviceActivation = this.devicePlacerService.onActive.subscribe((device: DeviceInEditor): void => {
      this.activeListType = DeviceType.ANCHOR;
      this.setActiveDevices();
    });
  }

  private listenOnUnsetDeviceInEditor(): void {
    this.deviceRemoveInEditor = this.devicePlacerService.onRemovedFromMap.subscribe((device: AnchorBag | SinkBag): void => {
      const type: DeviceType = (<AnchorBag | SinkBag>device).deviceInEditor.type;
      if (type === DeviceType.SINK) {
        const sink: SinkBag = <SinkBag>device;
        this.sinks.push(sink.deviceInList);
        sink.deviceInEditor.anchors.forEach((anchor: AnchorBag): void => {
          this.anchors.push(anchor.deviceInList);
        });
      } else if (type === DeviceType.ANCHOR) {
        const anchor: AnchorBag = <AnchorBag>(device);
        this.anchors.push(anchor.deviceInList);
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
    this.activeListType = DeviceType.SINK;
    this.setActiveDevices();
  }

  private removeDraggedDevice(): void {
    if (!!this.draggedDevice) {
      const index: number = this.activeList.indexOf(this.draggedDevice);
      this.activeList.splice(index, 1);
    }
  }

  private setActiveDevices() {
    if (this.activeListType === DeviceType.ANCHOR) {
      this.activeList = this.anchors;
    } else if (this.activeListType === DeviceType.SINK) {
      this.activeList = this.sinks;
    }
  }

}

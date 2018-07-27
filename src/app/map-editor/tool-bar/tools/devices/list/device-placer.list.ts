import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DevicePlacerService} from '../device-placer.service';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {DeviceService} from '../../../../../device/device.service';
import {AnchorBag, DeviceDto, DeviceType, SinkBag} from '../device-placer/device-placer.types';
import {ActionBarService} from '../../../../action-bar/actionbar.service';
import {Configuration} from '../../../../action-bar/actionbar.type';


@Component({
  selector: 'app-device-placer-list',
  templateUrl: './device-placer.list.html'
})
export class DevicePlacerListComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;
  public activeList: Array<Anchor | Sink> = [];
  public queryString: string;
  public queryFields: string[] = ['shortId', 'longId', 'name'];
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
    private configurationService: ActionBarService
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
    device.z = this.heightInMeters;
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
    this.activationSubscription = this.devicePlacerService.onListVisibilityChanged.subscribe((visible: boolean): void => {
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
    this.mapClickEvent = this.devicePlacerService.onMapClicked.subscribe((): void => {
      this.activeListType = DeviceType.SINK;
      this.setActiveDevices();
    });
  }

  private listenOnActiveDeviceInEditor(): void {
    this.deviceActivation = this.devicePlacerService.onActivated.subscribe((): void => {
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
    this.fetchDevicesFromBackend().then(() => {
      this.filterDuplicatesFromConfiguration().then(() => {
        this.activeListType = DeviceType.SINK;
        this.setActiveDevices();
      });
    });
  }

  private fetchDevicesFromBackend(): Promise<[{}, {}]> {
    const sinksFetched = new Promise((resolve) => {
      this.deviceService.setUrl('sinks/');
      this.deviceService.getAll().subscribe((sinks: Sink[]): void => {
        sinks.forEach((sink: Sink): void => {
          this.sinks.push(sink);
        });
        resolve();
      });
    });

    const anchorsFetched = new Promise((resolve) => {
      this.deviceService.setUrl('anchors/');
      this.deviceService.getAll().subscribe((anchors: Anchor[]): void => {
        anchors.forEach((anchor: Anchor): void => {
          this.anchors.push(anchor);
        });
        resolve();
      });
    });

    return Promise.all([sinksFetched, anchorsFetched]);
  }

  private filterDuplicatesFromConfiguration(): Promise<void> {
    return new Promise((resolve) => {
      this.configurationService.configurationLoaded().first().subscribe((configuration: Configuration) => {
        this.sinks = this.sinks.filter((sink: Sink) => {
          return configuration.data.sinks.findIndex((s: Sink) => {
            return sink.shortId === s.shortId;
          }) < 0;
        });
        this.anchors = this.anchors.filter((anchor: Anchor) => {
          let isNotDuplicated = true;
          configuration.data.sinks.forEach((sink: Sink) => {
            isNotDuplicated = sink.anchors.findIndex((a: Anchor) => {
              return anchor.shortId === a.shortId;
            }) < 0;
          });
          return isNotDuplicated;
        });
        resolve();
      });
    });
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

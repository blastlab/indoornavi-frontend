import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DevicePlacerService} from '../device-placer.service';
import {Subscription} from 'rxjs/Subscription';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {DeviceService} from '../../../../../device/device.service';
import {AnchorBag, DeviceDto, DeviceType, SinkBag} from '../device-placer.types';
import {ActionBarService} from '../../../../action-bar/actionbar.service';
import {Configuration} from '../../../../action-bar/actionbar.type';
import * as Collections from 'typescript-collections';

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
  private listVisibilityChanged: Subscription;
  private tableRendered: Subscription;
  private dragStarted: Subscription;
  private droppedInside: Subscription;
  private droppedOutside: Subscription;
  private mapClicked: Subscription;
  private activated: Subscription;
  private removedFromMap: Subscription;
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
    this.listenOnVisibilityChanged();
    this.listenOnDeviceDragAndDrop();
    this.listenOnMapClick();
    this.listenOnDeviceActivated();
    this.listenOnDeviceRemovedFromMap();
    this.listenOnTableRendered();
    this.fetchAllDevices();
  }

  ngOnDestroy() {
    this.listVisibilityChanged.unsubscribe();
    this.dragStarted.unsubscribe();
    this.droppedOutside.unsubscribe();
    this.droppedInside.unsubscribe();
    this.mapClicked.unsubscribe();
    this.activated.unsubscribe();
    this.removedFromMap.unsubscribe();
    this.tableRendered.unsubscribe();
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
    this.tableRendered = this.devicePlacerService.onTableRendered.subscribe((): void => {
      this.toolDetails.updateContainersShifts();
    });
  }

  private listenOnVisibilityChanged(): void {
    this.listVisibilityChanged = this.devicePlacerService.onListVisibilityChanged.subscribe((visible: boolean): void => {
      visible ? this.toolDetails.show() : this.toolDetails.hide();
    });
  }

  private listenOnDeviceDragAndDrop(): void {
    this.dragStarted = this.devicePlacerService.onDragStarted.subscribe((deviceDto: DeviceDto): void => {
      this.draggedDevice = deviceDto.device;
    });
    this.droppedOutside = this.devicePlacerService.onDroppedOutside.subscribe((): void => {
      this.draggedDevice = null;
    });
    this.droppedInside = this.devicePlacerService.onDroppedInside.subscribe((): void => {
      this.removeDraggedDevice();
      if (this.activeListType === DeviceType.SINK) {
        this.activeListType = DeviceType.ANCHOR;
      }
    });
  }

  private listenOnMapClick(): void {
    this.mapClicked = this.devicePlacerService.onMapClicked.subscribe((): void => {
      this.activeListType = DeviceType.SINK;
      this.setActiveDevices();
    });
  }

  private listenOnDeviceActivated(): void {
    this.activated = this.devicePlacerService.onActivated.subscribe((): void => {
      this.activeListType = DeviceType.ANCHOR;
      this.setActiveDevices();
    });
  }

  private listenOnDeviceRemovedFromMap(): void {
    this.removedFromMap = this.devicePlacerService.onRemovedFromMap.subscribe((device: AnchorBag | SinkBag): void => {
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
        const anchorsSet: Collections.Set<Anchor> = new Collections.Set<Anchor>((a: Anchor) => {
          return `${a.shortId}`;
        });
        this.anchors.forEach((anchor: Anchor) => {
          anchorsSet.add(anchor);
          configuration.data.sinks.forEach((sink: Sink) => {
            sink.anchors.forEach((sinkAnchor: Anchor) => {
              if (anchorsSet.contains(sinkAnchor)) {
                anchorsSet.remove(anchor);
              }
            });
          });
        });
        this.anchors = anchorsSet.toArray();
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

import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DevicePlacerService} from '../device-placer.service';
import {ToolDetailsComponent} from '../../../shared/details/tool-details';
import {DeviceService} from '../../../../../device/device.service';
import {AnchorBag, DeviceDto, DeviceType, SinkBag} from '../device-placer.types';
import {ActionBarService} from '../../../../action-bar/actionbar.service';
import {Configuration} from '../../../../action-bar/actionbar.type';
import * as Collections from 'typescript-collections';
import {Subject} from 'rxjs/Subject';
import {DeviceInEditor} from '../../../../../map/models/device';

@Component({
  selector: 'app-device-placer-list',
  templateUrl: './device-placer.list.html'
})
export class DevicePlacerListComponent implements OnInit, OnDestroy {
  @ViewChild('toolDetails') private toolDetails: ToolDetailsComponent;
  public activeList: Array<Anchor | Sink> = [];
  public queryString: string;
  public queryFields: string[] = ['shortId', 'longId', 'name'];
  public activeListType: DeviceType;
  private subscriptionDestroyer: Subject<void> = new Subject<void>();
  private anchors: Array<Anchor> = [];
  private sinks: Array<Sink> = [];
  private draggedDevice: Sink | Anchor;

  private static isOnMap(device: Anchor): boolean {
    return !!device.floor;
  }

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
    this.listenOnDeviceInActiveConfiguration();
  }

  ngOnDestroy() {
    this.subscriptionDestroyer.next();
    this.subscriptionDestroyer.unsubscribe();
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
    this.devicePlacerService.onTableRendered.takeUntil(this.subscriptionDestroyer).subscribe((): void => {
      this.toolDetails.updateContainersShifts();
    });
  }

  private listenOnVisibilityChanged(): void {
    this.devicePlacerService.onListVisibilityChanged.takeUntil(this.subscriptionDestroyer).subscribe((visible: boolean): void => {
      visible ? this.toolDetails.show() : this.toolDetails.hide();
    });
  }

  private listenOnDeviceDragAndDrop(): void {
    this.devicePlacerService.onDragStarted.takeUntil(this.subscriptionDestroyer).subscribe((deviceDto: DeviceDto): void => {
      this.draggedDevice = deviceDto.device;
    });
    this.devicePlacerService.onDroppedOutside.takeUntil(this.subscriptionDestroyer).subscribe((): void => {
      this.draggedDevice = null;
    });
    this.devicePlacerService.onDroppedInside.takeUntil(this.subscriptionDestroyer).subscribe((): void => {
      this.removeDraggedDevice();
      if (this.activeListType === DeviceType.SINK) {
        this.activeListType = DeviceType.ANCHOR;
      }
    });
  }

  private listenOnMapClick(): void {
    this.devicePlacerService.onMapClicked.takeUntil(this.subscriptionDestroyer).subscribe((): void => {
      this.activeListType = DeviceType.SINK;
      this.setActiveDevices();
    });
  }

  private listenOnDeviceActivated(): void {
    this.devicePlacerService.onActivated.takeUntil(this.subscriptionDestroyer).subscribe((device: DeviceInEditor): void => {
      this.activeListType = DeviceType.ANCHOR;
      this.setActiveDevices();
    });
  }

  private listenOnDeviceRemovedFromMap(): void {
    this.devicePlacerService.onRemovedFromMap.takeUntil(this.subscriptionDestroyer).subscribe((device: AnchorBag | SinkBag): void => {
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

  private listenOnDeviceInActiveConfiguration(): void {
    this.devicePlacerService.onDeviceInActiveConfiguration.takeUntil(this.subscriptionDestroyer).subscribe((device: Sink | Anchor) => {
      if (!!(<Sink>device).anchors) {
        const index: number = this.sinks.findIndex((sink: Sink): boolean => {
          return device.shortId === sink.shortId;
        });
        if (index > -1) {
          this.sinks.splice(index, 1)
        }
      } else {
        const index: number = this.anchors.findIndex((anchors: Anchor): boolean => {
          return device.shortId === anchors.shortId;
        });
        if (index > -1) {
          this.anchors.splice(index, 1)
        }
      }
    });
  }

  private fetchDevicesFromBackend(): Promise<[{}, {}]> {
    const sinksFetched = new Promise((resolve) => {
      this.deviceService.setUrl('sinks/');
      this.deviceService.getAll().takeUntil(this.subscriptionDestroyer).subscribe((sinks: Sink[]): void => {
        this.sinks = sinks.filter(sink => !DevicePlacerListComponent.isOnMap(sink));
        resolve();
      });
    });

    const anchorsFetched = new Promise((resolve) => {
      this.deviceService.setUrl('anchors/');
      this.deviceService.getAll().takeUntil(this.subscriptionDestroyer).subscribe((anchors: Anchor[]): void => {
        this.anchors = anchors.filter(anchor => !DevicePlacerListComponent.isOnMap(anchor));
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

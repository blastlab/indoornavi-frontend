import {Component, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../../tool';
import {ToolName} from '../../tools.enum';
import {Subscription} from 'rxjs/Subscription';
import * as d3 from 'd3';
import {MapLoaderInformerService} from '../../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {Scale, ScaleCalculations, ScaleDto} from '../../scale/scale.type';
import {Geometry} from '../../../../../shared/utils/helper/geometry';
import {Configuration} from '../../../../action-bar/actionbar.type';
import {ActionBarService} from '../../../../action-bar/actionbar.service';
import {ScaleService} from '../../../../../shared/services/scale/scale.service';
import {SinkInEditor} from '../../../../../map/models/sink';
import {Anchor, Sink} from '../../../../../device/device.type';
import {DeviceInEditor} from '../../../../../map/models/device';
import {Point} from '../../../../map.type';
import {AnchorInEditor} from '../../../../../map/models/anchor';
import {DevicePlacerService} from '../device-placer.service';
import {ContextMenuService} from '../../../../../shared/wrappers/editable/editable.service';
import {TranslateService} from '@ngx-translate/core';
import {ZoomService} from '../../../../../shared/services/zoom/zoom.service';
import {AnchorBag, DeviceCallbacks, DeviceDto, DeviceInEditorConfiguration, DeviceType, SinkBag} from './device-placer.types';
import {ToolbarService} from '../../../toolbar.service';
import {Helper} from '../../../../../shared/utils/helper/helper';

@Component({
  selector: 'app-device-placer',
  templateUrl: './device-placer.html'
})
export class DevicePlacerComponent implements Tool, OnInit, OnDestroy {
  active: boolean = false;
  disabled: boolean = true;

  private mapLoadedSubscription: Subscription;
  private scaleChanged: Subscription;
  private deviceActivation: Subscription;
  private contextMenuListener: Subscription;
  private deviceDragging: Subscription;
  private deviceDroppingOutside: Subscription;
  private deviceDroppingInside: Subscription;
  private map: d3.selection;
  private scale: Scale;
  private floorId: number;
  private scaleCalculations: ScaleCalculations;
  private sinks: SinkBag[] = [];
  private activeDevice: SinkBag | AnchorBag;
  private draggedDevice: DeviceDto;
  private contextMenu: DeviceCallbacks;

  constructor(
    private toolbarService: ToolbarService,
    private mapLoaderInformer: MapLoaderInformerService,
    private configurationService: ActionBarService,
    private scaleService: ScaleService,
    private devicePlacerService: DevicePlacerService,
    private contextMenuService: ContextMenuService,
    private translateService: TranslateService,
    private zoomService: ZoomService
  ) {
  }

  ngOnInit() {
    this.contextMenu = {
      unset: () => {
        this.removeFromMap();
      }
    };
    this.bindMapSelection();
    this.captureScaleChanges();
    this.fetchConfiguredDevices();
    this.listenToDevicesOnMapEvents();
    this.listenToContextMenu();
    this.listenToDeviceDragAndDrop();
    this.listenOnPositionChanged();
  }

  ngOnDestroy() {
    this.contextMenu = null;
    this.mapLoadedSubscription.unsubscribe();
    this.scaleChanged.unsubscribe();
    this.deviceActivation.unsubscribe();
    this.contextMenuListener.unsubscribe();
    this.deviceDragging.unsubscribe();
    this.deviceDroppingOutside.unsubscribe();
    this.deviceDroppingInside.unsubscribe();
    //  TODO: unset context menu for all devices
  }

  getToolName(): ToolName {
    return ToolName.DEVICES;
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  toggleActivity(): void {
    if (this.active) {
      this.toolbarService.emitToolChanged(null);
    } else {
      this.toolbarService.emitToolChanged(this);
    }
  }

  setActive(): void {
    this.activatePlacerEvents();
    this.devicePlacerService.emitListVisibility(true);
    this.devicePlacerService.emitMapModeActivated();
    this.active = true;
  }

  setInactive(): void {
    this.deactivatePlacerEvents();
    this.devicePlacerService.emitListVisibility(false);
    this.active = false;
  }

  getHintMessage(): string {
    return 'devices.hint.first';
  }

  private bindMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapLoaded): void => {
      this.map = mapLoaded.container;
    });
  }

  private captureScaleChanges(): void {
    this.scaleChanged = this.scaleService.scaleChanged.subscribe((scale: ScaleDto): void => {
      this.scale = new Scale(scale);
      if (this.scale.isReady()) {
        this.scaleCalculations = {
          scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
          scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
        };
      }
    });
  }

  private fetchConfiguredDevices(): void {
    this.configurationService.configurationLoaded().first().subscribe((configuration: Configuration): void => {
      this.floorId = configuration.floorId;
      if (!!configuration.data.sinks) {
        configuration.data.sinks.forEach((sink: Sink): void => {
          const sinkBag: SinkBag = this.placeSinkOnMap(Helper.deepCopy(sink));
          sink.anchors.forEach((anchor: Anchor): void => {
            this.placeAnchorOnMap(sinkBag, Helper.deepCopy(anchor));
          });
        });
      }
    });
  }

  private listenToDevicesOnMapEvents(): void {
    this.deviceActivation = this.devicePlacerService.onActivated.subscribe((device: DeviceInEditor) => {
      this.setActiveDevice(device);
      this.sinks.forEach((sinkBag: SinkBag): void => {
        this.setSinkGroupOutOfScope(sinkBag);
      });
      if (this.activeDevice.deviceInEditor.type === DeviceType.SINK) {
        this.setSinkGroupInScope(<SinkBag>this.activeDevice);
      } else {
        const sinkWithAnchor: SinkBag = this.sinks.find((sinkBag: SinkBag): boolean => {
          return sinkBag.deviceInEditor.hasAnchor(<AnchorBag>this.activeDevice);
        });
        this.setSinkGroupInScope(sinkWithAnchor);
      }
      this.activeDevice.deviceInEditor.setActive();
    });
  }

  private listenToDeviceDragAndDrop(): void {
    this.deviceDragging = this.devicePlacerService.onDragStarted.subscribe((deviceDto: DeviceDto): void => {
      this.draggedDevice = deviceDto;
    });
    this.deviceDroppingOutside = this.devicePlacerService.onDroppedOutside.subscribe((): void => {
      this.draggedDevice = null;
    });
    this.deviceDroppingInside = this.devicePlacerService.onDroppedInside.subscribe((coordinates: Point): void => {
      const dropTransitionCoordinates = this.zoomService.calculateTransition(coordinates);
      if (!!this.draggedDevice) {
        if (this.draggedDevice.type === DeviceType.SINK) {
          const sinkBag: SinkBag = this.placeSinkOnMap(<Sink>this.draggedDevice.device, dropTransitionCoordinates);
          sinkBag.deviceInEditor.activateForMouseEvents();
          sinkBag.deviceInEditor.contextMenuOn(this.contextMenu);
          this.devicePlacerService.emitActivated(sinkBag.deviceInEditor);
          this.configurationService.addSink(<Sink>this.updateDevicePosition(sinkBag));
        } else if (this.draggedDevice.type === DeviceType.ANCHOR) {
          if (this.activeDevice.deviceInEditor.type === DeviceType.ANCHOR) {
            const index: number = this.sinks.findIndex((sink: SinkBag): boolean => {
              return sink.deviceInEditor.hasAnchor(<AnchorBag>this.activeDevice);
            });
            this.activeDevice = this.sinks[index];
          }
          const sinkBag: SinkBag = <SinkBag>this.activeDevice;
          const anchorBag: AnchorBag = this.placeAnchorOnMap(sinkBag, <Anchor>this.draggedDevice.device, dropTransitionCoordinates);
          anchorBag.deviceInEditor.activateForMouseEvents();
          anchorBag.deviceInEditor.contextMenuOn(this.contextMenu);
          this.devicePlacerService.emitActivated(anchorBag.deviceInEditor);
          this.configurationService.addAnchor(<Sink>sinkBag.deviceInList, <Anchor>this.updateDevicePosition(anchorBag));
        }
      }
    });
  }

  private listenToContextMenu(): void {
    this.contextMenuListener = this.devicePlacerService.onSelected.subscribe((device: DeviceInEditor): void => {
      this.setActiveDevice(device);
    });
  }

  private setActiveDevice(device: DeviceInEditor): void {
    const deviceInEditor: SinkInEditor | AnchorInEditor = <SinkInEditor | AnchorInEditor>(device);
    if (deviceInEditor.type === DeviceType.SINK) {
      const index: number = this.sinks.findIndex((sinkBag: SinkBag): boolean => {
        return sinkBag.deviceInEditor === deviceInEditor;
      });
      if (index > -1) {
        this.activeDevice = this.sinks[index];
      }
    } else if (deviceInEditor.type === DeviceType.ANCHOR) {
      this.sinks.forEach((sink: SinkBag): void => {
        const index: number = sink.deviceInEditor.anchors.findIndex((anchorBag: AnchorBag): boolean => {
          return anchorBag.deviceInEditor === deviceInEditor;
        });
        if (index > -1) {
          this.activeDevice = sink.deviceInEditor.anchors[index];
        }
      });
    }
  }

  private listenOnPositionChanged() {
    this.devicePlacerService.onDevicePositionChanged.subscribe(() => {
      if (!!this.activeDevice) {
        const deviceCalculatedInCentimeters: Sink | Anchor = this.updateDevicePosition(this.activeDevice);
        if (this.activeDevice.deviceInEditor.type === DeviceType.SINK) {
          this.configurationService.updateSink(<Sink>deviceCalculatedInCentimeters);
        } else {
          this.configurationService.updateAnchor(<Anchor>deviceCalculatedInCentimeters);
        }
      }
    });
  }

  private placeSinkOnMap(sink: Sink, coordinates?: Point): SinkBag {
    const sinkDrawConfiguration: DeviceInEditorConfiguration = {
      id: `${sink.shortId}`,
      clazz: `sink`,
      heightInMeters: sink.z
    };
    const sinkOnMap: SinkInEditor = new SinkInEditor(
      !!coordinates ? coordinates : {x: sink.xInPixels, y: sink.yInPixels},
      this.map,
      sinkDrawConfiguration,
      this.devicePlacerService,
      this.contextMenuService,
      this.translateService
    );
    sinkOnMap.setOutOfGroupScope();
    sinkOnMap.contextMenuOff();
    const sinkBag: SinkBag = {
      deviceInList: sink,
      deviceInEditor: sinkOnMap
    };
    this.addSink(sinkBag);
    return sinkBag;
  }

  private placeAnchorOnMap(sinkBag: SinkBag, anchor: Anchor, coordinates?: Point): AnchorBag {
    const anchorDrawConfiguration: DeviceInEditorConfiguration = {
      id: `${anchor.shortId}`,
      clazz: `anchor`,
      heightInMeters: anchor.z
    };
    const anchorInEditor: AnchorInEditor = new AnchorInEditor(
      !!coordinates ? coordinates : {x: anchor.xInPixels, y: anchor.yInPixels},
      this.map,
      anchorDrawConfiguration,
      this.devicePlacerService,
      this.contextMenuService,
      this.translateService
    );
    anchorInEditor.setOutOfGroupScope();
    anchorInEditor.contextMenuOff();
    const anchorBag: AnchorBag = {
      deviceInEditor: anchorInEditor,
      deviceInList: anchor
    };
    this.addAnchorToSink(sinkBag, anchorBag);
    return anchorBag;
  }

  private removeFromMap(): void {
    const deletedDevice: AnchorBag | SinkBag = Object.assign({}, this.activeDevice);
    if (deletedDevice.deviceInEditor.type === DeviceType.SINK) {
      const sink = <Sink>(deletedDevice.deviceInList);
      sink.anchors = [];
    }
    this.devicePlacerService.emitRemovedFromMap(deletedDevice);
    if (this.activeDevice.deviceInEditor.type === DeviceType.SINK) {
      const sinkBag: SinkBag = <SinkBag>this.activeDevice;
      this.removeSinkWithAnchors(sinkBag);
      this.configurationService.removeSink2(sinkBag.deviceInList)
    } else {
      const anchorBag: AnchorBag = <AnchorBag>this.activeDevice;
      const sinkWithAnchor: SinkBag = this.sinks.find((sink: SinkBag): boolean => {
        return sink.deviceInEditor.hasAnchor(anchorBag);
      });
      this.removeAnchorFromSink(sinkWithAnchor, anchorBag);
      this.configurationService.removeAnchor2(anchorBag.deviceInList);
    }
    this.devicePlacerService.emitMapModeActivated();
    this.sinks.forEach((sinkBag: SinkBag) => {
      this.setSinkGroupOutOfScope(sinkBag);
    });
  }

  private addSink(sinkBag: SinkBag): void {
    this.sinks.push(sinkBag);
  }

  private addAnchorToSink(sink: SinkBag, anchor: AnchorBag): void {
    const sinkToUpdate: SinkBag = this.sinks.find((sinkBag: SinkBag): boolean => {
      return sink === sinkBag;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.deviceInEditor.addAnchor(anchor);
    }
  }

  private removeAnchorFromSink(sink: SinkBag, anchor: AnchorBag): void {
    anchor.deviceInEditor.remove();
    const sinkToUpdate: SinkBag = this.sinks.find((sinkBag: SinkBag): boolean => {
      return sink === sinkBag;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.deviceInEditor.removeAnchor(anchor);
    }
  }

  private removeSinkWithAnchors(sinkBag: SinkBag): void {
    sinkBag.deviceInEditor.removeAllAnchors();
    sinkBag.deviceInEditor.remove();
    const index = this.sinks.indexOf(sinkBag);
    if (index > -1) {
      this.sinks.splice(index, 1);
    }
  }

  private setSinkGroupInScope(sinkBag: SinkBag): void {
    const sinkToUpdate: SinkBag = this.sinks.find((sink: SinkBag): boolean => {
      return sinkBag === sink;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.deviceInEditor.setInGroupScope();
      sinkToUpdate.deviceInEditor.setSinkGroupScope();
    }
  }

  private setSinkGroupOutOfScope(sink: SinkBag): void {
    const sinkToUpdate: SinkBag = this.sinks.find((sinkBag: SinkBag): boolean => {
      return sink === sinkBag;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.deviceInEditor.setOutOfGroupScope();
      sinkToUpdate.deviceInEditor.setSinkGroupOutOfScope();
    }
  }

  private activatePlacerEvents(): void {
    if (!!this.map) {
      this.map
        .on('click', (): void => {
          this.sinks.forEach((sink: SinkBag): void => {
            this.setSinkGroupOutOfScope(sink);
          });
          this.devicePlacerService.emitMapModeActivated();
        })
        .on('contextmenu', () => {
          d3.event.preventDefault();
        });
    }
    this.sinks.forEach((sink: SinkBag): void => {
      sink.deviceInEditor.contextMenuOn(this.contextMenu);
      sink.deviceInEditor.activateForMouseEvents();
      sink.deviceInEditor.activateAnchors(this.contextMenu);
    });
  }

  private deactivatePlacerEvents(): void {
    if (!!this.map) {
      this.map.on('click', null).on('contextmenu', null);
    }
    this.sinks.forEach((sink: SinkBag): void => {
      sink.deviceInEditor.contextMenuOff();
      sink.deviceInEditor.deactivate();
      sink.deviceInEditor.deactivateAnchors();
    });
  }

  private updateDevicePosition(deviceBag: SinkBag | AnchorBag): Sink | Anchor {
    const positionInPixels: Point = deviceBag.deviceInEditor.getPosition();
    const positionInCentimeters: Point = Geometry.calculatePointPositionInCentimeters(
      this.scaleCalculations.scaleLengthInPixels,
      this.scaleCalculations.scaleInCentimeters,
      positionInPixels);
    deviceBag.deviceInList.x = positionInCentimeters.x;
    deviceBag.deviceInList.y = positionInCentimeters.y;
    deviceBag.deviceInList.xInPixels = positionInPixels.x;
    deviceBag.deviceInList.yInPixels = positionInPixels.y;
    return deviceBag.deviceInList;
  }
}

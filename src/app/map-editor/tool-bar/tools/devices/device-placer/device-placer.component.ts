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
import {DeviceCallbacks, DeviceInEditorConfiguration} from '../../../../../map/models/device';
import {Point} from '../../../../map.type';
import {AnchorInEditor} from '../../../../../map/models/anchor';
import {DeviceDto, DevicePlacerService, DeviceType} from '../device-placer.service';
import {ContextMenuService} from '../../../../../shared/wrappers/editable/editable.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-device-placer',
  templateUrl: './device-placer.html'
})
export class DevicePlacerComponent implements Tool, OnInit, OnDestroy {
  active: boolean = false;
  disabled: boolean = false;

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
  private sinks: SinkInEditor[] = [];
  private activeDevice: SinkInEditor | AnchorInEditor;
  private draggedDevice: DeviceDto;
  private contextMenu: DeviceCallbacks;

  constructor(
    private mapLoaderInformer: MapLoaderInformerService,
    private configurationService: ActionBarService,
    private scaleService: ScaleService,
    private devicePlacerService: DevicePlacerService,
    private contextMenuService: ContextMenuService,
    private translateService: TranslateService
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

  getHintMessage(): string {
    return '';
  }

  getToolName(): ToolName {
    return ToolName.DEVICES;
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  setActive(): void {
    if (this.active) {
      this.setInactive();
    } else {
      this.activatePlacerEvents();
      this.devicePlacerService.emitListVisibility(true);
    }
    this.active = !this.active;
  }

  setInactive(): void {
    this.deactivatePlacerEvents();
    this.devicePlacerService.emitListVisibility(false);
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
          const sinkOnMapCoordinates: Point = Geometry.calculatePointPositionInPixels(
            this.scaleCalculations.scaleLengthInPixels,
            this.scaleCalculations.scaleInCentimeters,
            {x: sink.x, y: sink.y});
          const sinkOnMap: SinkInEditor = this.placeSinkOnMap(sink, sinkOnMapCoordinates);
          sink.anchors.forEach((anchor: Anchor): void => {
            const anchorOnMapCoordinates: Point = Geometry.calculatePointPositionInPixels(
              this.scaleCalculations.scaleLengthInPixels,
              this.scaleCalculations.scaleInCentimeters,
              {x: anchor.x, y: anchor.y});
            this.placeAnchorOnMap(sinkOnMap, anchor, anchorOnMapCoordinates);
          });
        });
      }
    });
  }

  private listenToDevicesOnMapEvents(): void {
    this.deviceActivation = this.devicePlacerService.onActive.subscribe((device: AnchorInEditor | SinkInEditor) => {
      this.activeDevice = device;
      this.sinks.forEach((sink: SinkInEditor): void => {
        this.setSinkGroupOutOfScope(sink);
      });
      if (device.type === DeviceType.SINK) {
        this.setSinkGroupInScope(<SinkInEditor>device);
      } else {
        const sinkWithAnchor: SinkInEditor = this.sinks.find((sink: SinkInEditor): boolean => {
          return sink.hasAnchor(<AnchorInEditor>device);
        });
        this.setSinkGroupInScope(sinkWithAnchor);
      }
      device.setActive();
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
      if (!!this.draggedDevice) {
        if (this.draggedDevice.type === DeviceType.SINK) {
          const sinkInMapEditor: SinkInEditor = this.placeSinkOnMap(<Sink>this.draggedDevice.device, coordinates);
          sinkInMapEditor.activateForMouseEvents();
          sinkInMapEditor.on(this.contextMenu);
          this.devicePlacerService.emitActive(sinkInMapEditor);
        } else if (this.draggedDevice.type === DeviceType.ANCHOR && this.activeDevice.type === DeviceType.SINK) {
          const anchorInMapEditor: AnchorInEditor = this.placeAnchorOnMap(<SinkInEditor>this.activeDevice, <Anchor>this.draggedDevice.device, coordinates);
          anchorInMapEditor.activateForMouseEvents();
          anchorInMapEditor.on(this.contextMenu);
          this.devicePlacerService.emitActive(anchorInMapEditor);
        }
      }
    });
  }

  private listenToContextMenu() {
    this.contextMenuListener = this.devicePlacerService.onSelected.subscribe((device: AnchorInEditor | SinkInEditor): void => {
      this.activeDevice = device;
    });
  }

  private placeSinkOnMap(sink: Sink, sinkOnMapCoordinates: Point): SinkInEditor {
    const sinkDrawConfiguration: DeviceInEditorConfiguration = {
      id: `sink-${sink.shortId}`,
      clazz: `sink`,
      heightInMeters: Geometry.calculateDistanceInPixels(this.scaleCalculations.scaleLengthInPixels, this.scaleCalculations.scaleInCentimeters, sink.z)
    };
    const sinkOnMap: SinkInEditor = new SinkInEditor(
      sinkOnMapCoordinates,
      this.map,
      sinkDrawConfiguration,
      this.devicePlacerService,
      this.contextMenuService,
      this.translateService
    );
    sinkOnMap.setOutOfGroupScope();
    sinkOnMap.off();
    this.addSink(sinkOnMap);
    return sinkOnMap;
  }

  private placeAnchorOnMap(sinkInEditor: SinkInEditor, anchor: Anchor, anchorOnMapCoordinates: Point): AnchorInEditor {
    const anchorDrawConfiguration: DeviceInEditorConfiguration = {
      id: `anchor-${anchor.shortId}`,
      clazz: `anchor`,
      heightInMeters: Geometry.calculateDistanceInPixels(this.scaleCalculations.scaleLengthInPixels, this.scaleCalculations.scaleInCentimeters, anchor.z)
    };
    const anchorInEditor: AnchorInEditor = new AnchorInEditor(
      anchorOnMapCoordinates,
      this.map,
      anchorDrawConfiguration,
      this.devicePlacerService,
      this.contextMenuService,
      this.translateService
    );
    anchorInEditor.setOutOfGroupScope();
    anchorInEditor.off();
    this.addAnchorToSink(sinkInEditor, anchorInEditor);
    return anchorInEditor;
  }

  private removeFromMap(): void {
    const deletedDevice: AnchorInEditor | SinkInEditor = Object.assign({}, this.activeDevice);
    this.devicePlacerService.emitRemovedFromMap(deletedDevice);
    if (this.activeDevice.type === DeviceType.SINK) {
      this.removeSinkWithAnchors(<SinkInEditor>this.activeDevice);
    } else {
      const sinkWithAnchor: SinkInEditor = this.sinks.find((sink: SinkInEditor): boolean => {
        return sink.hasAnchor(<AnchorInEditor>this.activeDevice)
      });
      this.removeAnchorFromSink(sinkWithAnchor, <AnchorInEditor>this.activeDevice)
    }
  }

  private addSink(sink: SinkInEditor): void {
    this.sinks.push(sink);
  }

  private addAnchorToSink(sink: SinkInEditor, anchor: AnchorInEditor): void {
    const sinkToUpdate: SinkInEditor = this.sinks.find((sinkInEditor: SinkInEditor): boolean => {
      return sink === sinkInEditor;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.addAnchor(anchor);
    }
  }

  private removeAnchorFromSink(sink: SinkInEditor, anchor: AnchorInEditor): void {
    anchor.remove();
    const sinkToUpdate: SinkInEditor = this.sinks.find((sinkInEditor: SinkInEditor): boolean => {
      return sink === sinkInEditor;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.removeAnchor(anchor);
    }
  }

  private removeSinkWithAnchors(sink: SinkInEditor): void {
    sink.removeAllAnchors();
    sink.remove();
    const index = this.sinks.indexOf(sink);
    if (index > -1) {
      this.sinks.splice(index, 1);
    }
  }

  private setSinkGroupInScope(sink: SinkInEditor): void {
    const sinkToUpdate: SinkInEditor = this.sinks.find((sinkInEditor: SinkInEditor): boolean => {
      return sink === sinkInEditor;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.setInGroupScope();
      sinkToUpdate.setSinkGroupScope();
    }
  }

  private setSinkGroupOutOfScope(sink: SinkInEditor): void {
    const sinkToUpdate: SinkInEditor = this.sinks.find((sinkInEditor: SinkInEditor): boolean => {
      return sink === sinkInEditor;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.setOutOfGroupScope();
      sinkToUpdate.setSinkGroupOutOfScope();
    }
  }

  private activatePlacerEvents(): void {
    if (!!this.map) {
      this.map
        .on('click', (): void => {
          this.sinks.forEach((sink: SinkInEditor) => {
            this.setSinkGroupInScope(sink);
          });
          this.devicePlacerService.emitMapClick();
      })
        .on('contextmenu', () => {
          d3.event.preventDefault();
        });
    }
    this.sinks.forEach((sink: SinkInEditor): void => {
      sink.on(this.contextMenu);
      sink.activateForMouseEvents();
      sink.activateAnchors(this.contextMenu);
    });
  }

  private deactivatePlacerEvents(): void {
    if (!!this.map) {
      this.map.on('click', null).on('contextmenu', null);
    }
    this.sinks.forEach((sink: SinkInEditor): void => {
      sink.off();
      sink.deactivate();
      sink.deactivateAnchors();
    });
  }

}

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
import {DeviceInEditor, DeviceInEditorConfiguration, DeviceInEditorType} from '../../../../../map/models/device';
import {Point} from '../../../../map.type';
import {AnchorInEditor} from '../../../../../map/models/anchor';
import {DevicePlacerService} from '../device-placer.service';
import {ContextMenuService} from '../../../../../shared/wrappers/editable/editable.service';

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
  private map: d3.selection;
  private scale: Scale;
  private floorId: number;
  private scaleCalculations: ScaleCalculations;
  private activeDevice: DeviceInEditor;
  private sinks: SinkInEditor[] = [];

  constructor(
    private mapLoaderInformer: MapLoaderInformerService,
    private configurationService: ActionBarService,
    private scaleService: ScaleService,
    private devicePlacerService: DevicePlacerService,
    private contextMenuService: ContextMenuService
  ) { }

  ngOnInit() {
    this.bindMapSelection();
    this.captureScaleChanges();
    this.fetchConfiguredDevices();
    this.listenToDevicesOnMapEvents();
    this.listenToContextMenu();
  }

  ngOnDestroy() {
    this.mapLoadedSubscription.unsubscribe();
    this.scaleChanged.unsubscribe();
    this.deviceActivation.unsubscribe();
    this.contextMenuListener.unsubscribe();
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
    console.log(this.scale);
  }
  setInactive(): void {

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
      const contextMenu = {
        unset: () => {
          this.removeFromMap();
        }
      };
      this.floorId = configuration.floorId;
      if (!!configuration.data.sinks) {
        configuration.data.sinks.forEach((sink: Sink): void => {
          const sinkOnMapCoordinates: Point = Geometry.calculatePointPositionInPixels(
            this.scaleCalculations.scaleLengthInPixels,
            this.scaleCalculations.scaleInCentimeters,
            {x: sink.x, y: sink.y});
          const sinkDrawConfiguration: DeviceInEditorConfiguration = {
            id: `sink-${sink.shortId}`,
            clazz: `sink`,
            heightInMeters: Geometry.calculateDistanceInPixels(this.scaleCalculations.scaleLengthInPixels, this.scaleCalculations.scaleInCentimeters, sink.z)
          };
          const sinkOnMap: SinkInEditor = new SinkInEditor(sinkOnMapCoordinates , this.map, sinkDrawConfiguration, this.devicePlacerService, this.contextMenuService);
          sinkOnMap.setActive();
          sinkOnMap.on(contextMenu);
          this.addSink(sinkOnMap);
          sink.anchors.forEach((anchor: Anchor): void => {
            const anchorOnMapCoordinates: Point = Geometry.calculatePointPositionInPixels(
              this.scaleCalculations.scaleLengthInPixels,
              this.scaleCalculations.scaleInCentimeters,
              {x: anchor.x, y: anchor.y});
            const anchorDrawConfiguration: DeviceInEditorConfiguration = {
              id: `anchor-${anchor.shortId}`,
              clazz: `anchor`,
              heightInMeters: Geometry.calculateDistanceInPixels(this.scaleCalculations.scaleLengthInPixels, this.scaleCalculations.scaleInCentimeters, anchor.z)
            };
            const anchorOnMap: AnchorInEditor = new AnchorInEditor(anchorOnMapCoordinates , this.map, anchorDrawConfiguration, this.devicePlacerService, this.contextMenuService);
            anchorOnMap.setInGroupScope();
            anchorOnMap.on(contextMenu);
            this.addAnchorToSink(sinkOnMap, anchorOnMap);
          });
        });
      }
    });
  }

  private listenToDevicesOnMapEvents(): void {
    this.deviceActivation = this.devicePlacerService.onActive.subscribe((device: AnchorInEditor | SinkInEditor) => {
      this.sinks.forEach((sink: SinkInEditor): void => {
        this.setSinkGroupOutOfScope(sink);
      });
      if (device.type === DeviceInEditorType.SINK) {
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

  private listenToContextMenu() {
    this.contextMenuListener = this.devicePlacerService.onSelected.subscribe((device: DeviceInEditor): void => {
      console.log(device);
      this.activeDevice = device;
    });
  }

  private removeFromMap(): void {
    console.log(`removing ${this.activeDevice}`);
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
    const sinkToUpdate: SinkInEditor = this.sinks.find((sinkInEditor: SinkInEditor): boolean => {
      return sink === sinkInEditor;
    });
    if (!!sinkToUpdate) {
      sinkToUpdate.removeAnchor(anchor);
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

}

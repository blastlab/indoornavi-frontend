import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {HintBarService} from '../../../hint-bar/hintbar.service';
import {ZoomService} from '../../../../shared/services/zoom/zoom.service';
import {ToolbarService} from '../../toolbar.service';
import {MapLoaderInformerService} from '../../../../shared/services/map-loader-informer/map-loader-informer.service';
import {ActionBarService} from '../../../action-bar/actionbar.service';
import {DeviceService} from '../../../../device/device.service';
import {AcceptButtonsService} from '../../../../shared/components/accept-buttons/accept-buttons.service';
import {DevicePlacerController} from './device-placer.controller';
import {TranslateService} from '@ngx-translate/core';
import {Configuration} from '../../../action-bar/actionbar.type';
import * as d3 from 'd3';
import {Subscription} from 'rxjs/Subscription';
import {Point, Transform} from '../../../map.type';
import {Expandable} from '../../../../shared/utils/drawing/drawables/expandable';
import {ConnectingLine} from '../../../../shared/utils/drawing/drawables/draggables/connectables/connection';
import {SelectableDevice} from '../../../../shared/utils/drawing/drawables/selectables/selectableDevice';
import {ConnectableDevice} from '../../../../shared/utils/drawing/drawables/draggables/connectables/connectableDevice';
import {Selectable} from '../../../../shared/utils/drawing/drawables/selectables/selectable';
import {DrawBuilder} from '../../../../shared/utils/drawing/drawing.builder';
import {Anchor, Sink} from '../../../../device/device.type';
import {DrawConfiguration} from '../../../../map-viewer/publication.type';
import {MapEditorService} from '../../../map.editor.service';
import {CommonDevice} from '../../../../shared/utils/drawing/common/device.common';
import {IconService} from '../../../../shared/services/drawing/icon.service';
import {Scale, ScaleCalculations, ScaleDto} from '../scale/scale.type';
import {ScaleService} from '../../../../shared/services/scale/scale.service';
import {Geometry} from '../../../../shared/utils/helper/geometry';
import {Helper} from '../../../../shared/utils/helper/helper';

@Component({
  selector: 'app-devices',
  templateUrl: './devices.html',
  styleUrls: ['../tool.css', './devices.css']
})
export class DevicesComponent extends CommonDevice implements Tool, OnInit, OnDestroy {
  active: boolean = false;
  disabled: boolean = true;
  sinkRemoval: Sink;
  private scale: Scale;
  private draggedDevice: Anchor | Sink;
  private deviceDrop: Subscription;
  private listEvents: Subscription[];
  private hintMessage: string;
  private configuration: Configuration;
  private floorId: number;
  private mapLoadedSubscription: Subscription;
  private handledSelection: Subscription;
  private map: d3.selection;
  private mapDevices: Expandable[] = [];
  private blockedDevices: Expandable[] = [];
  private verifiedDevices: Array<Anchor | Sink>;
  private placementDone: boolean = true;
  private managedSelectableDevices: Subscription[];
  private chosenSink: Sink;
  private selectedDevice: Anchor | Sink;
  private modifyingConnectionsFlag: boolean;
  private creatingConnection: d3.selection;
  private selectedLine: ConnectingLine;
  private connectingLines: ConnectingLine[] = [];
  private managedSelectableLines: Subscription[] = [];
  private scaleFactor: number;
  private scaleFactorChanged: Subscription;
  private scaleCalculations: ScaleCalculations;
  private scaleChanged: Subscription;
  private wizardConfiguration: Subscription;

  static getShortIdFromGroupSelection(selection: d3.selection): number {
    return parseInt(selection.attr('id'), 10);
  }

  static isSinkType(checkType: any): boolean {
    if (!!checkType) {
      return (<Sink>checkType.anchors) !== undefined;
    } else {
      throw new Error(`${checkType} was sent into isSinkType static method.`);
    }
  }

  static hasSameShortId(device: Sink | Anchor, id: number): boolean {
    return device.shortId === id;
  }

  static getMouseCoordinates(): Point {
    return {x: d3.event.offsetX, y: d3.event.offsetY};
  }

  static updateDeviceCoordinatesFromGroupSelection(device: Sink | Anchor, group: d3.selecton): Sink | Anchor {
    device.x = group.attr('x');
    device.y = group.attr('y');
    return device;
  }

  static eraseDevicePublicationData(device: Anchor | Sink): Anchor | Sink {
    device.x = null;
    device.y = null;
    if (DevicesComponent.isSinkType(device)) {
      const sink = <Sink>device;
      sink.anchors = [];
      return sink;
    }
    return device;
  }

  static unblockSelectableBehavior(expandable: Expandable): void {
    expandable.connectable.handleHovering();
    expandable.selectable.handleHovering();
    expandable.selectable.selectOn();
    expandable.groupCreated.resetColor();
  }

  static markSinkSubselection(connectingLine: ConnectingLine): void {
    DevicesComponent.showSingleConnection(connectingLine);
  }

  static showSingleConnection(connectingLine: ConnectingLine): void {
    connectingLine.show();
    connectingLine.lock();
  }

  static hideSingleConnection(connectingLine: ConnectingLine): void {
    connectingLine.unlock();
    connectingLine.hide();
  }

  constructor(public translate: TranslateService,
              protected icons: IconService,
              private devicePlacerController: DevicePlacerController,
              private accButtons: AcceptButtonsService,
              private deviceService: DeviceService,
              private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private toolbarService: ToolbarService,
              private zoomService: ZoomService,
              private mapEditorService: MapEditorService,
              private hintBarService: HintBarService,
              private scaleService: ScaleService) {
    super(icons);
    this.setTranslations();
  }

  @HostListener('document:keydown.escape', [])
  private handleEscapeKey(): void {
    if (!this.selectedDevice && this.modifyingConnectionsFlag && !this.selectedLine) {
      this.endModifyingConnections();
      this.devicePlacerController.setConnectingMode(false);
    }
    if (this.selectedDevice) {
      if (!!this.creatingConnection) {
        this.resetConnecting();
      }
      this.clearSelections();
      this.handleSelectableConnections();
    }
    if (!!this.selectedLine) {
      this.clearSelectedLine();
    }

  }

  @HostListener('document:keydown.delete', [])
  private handleDeleteKey(): void {
    if (!!this.selectedDevice) {
      this.removeSelectedDevice();
      this.clearSelections();
    }
    if (!!this.selectedLine) {
      this.disconnectBySelectedLine();
    }
  }

  public onClick(): void {
    if (this.modifyingConnectionsFlag) {
      if (!!this.creatingConnection) {
        this.removeDashedLine()
      }
      this.endModifyingConnections();
      this.devicePlacerController.setConnectingMode(false);
    } else {
      this.toolbarService.emitToolChanged(this);
    }
  }

  private removeSelectedDevice(): void {
    if (!!this.creatingConnection) {
      this.resetConnecting()
    }
    if (DevicesComponent.isSinkType(this.selectedDevice) && (<Sink>this.selectedDevice).anchors.length !== 0) {
      this.sinkRemoval = <Sink>this.selectedDevice
    } else {
      this.removeFromConfiguration(this.selectedDevice);
      const mapDevice = this.findMapDevice(this.selectedDevice.shortId);
      mapDevice.groupCreated.remove();
      this.clearSelections();
      this.removeFromMapDevices(mapDevice);
    }
  }

  private modifyConnections(): void {
    this.translate.get('connections.manipulationTurnedOn').subscribe((value: string) => {
      this.hintBarService.sendHintMessage(value);
    });
    if (!!this.selectedDevice) {
      const selectedMapDevice = this.findMapDevice(this.selectedDevice.shortId);
      if (!!selectedMapDevice && !selectedMapDevice.connectable.anchorConnection) {
        this.map.on('mousemove', () => {
          this.map.on('mousemove', null);
          this.startCreatingConnection(selectedMapDevice, DevicesComponent.getMouseCoordinates());
        });
      } else {
        this.clearSelections();
      }
    }
    this.startModifyingConnections();
  }

  getHintMessage(): string {
    return this.hintMessage;
  }

  ngOnInit(): void {
    this.bindMapSelection();
    this.captureScaleFactorChanges();
    this.captureScaleChanges();
    this.captureWizardConfigurations();
    this.fetchConfiguredDevices();
    this.subscribeForDroppedDevice();
  }

  ngOnDestroy(): void {
    this.mapLoadedSubscription.unsubscribe();
    this.scaleFactorChanged.unsubscribe();
    this.scaleChanged.unsubscribe();
    this.wizardConfiguration.unsubscribe();
    this.deviceDrop.unsubscribe();
  }

  setActive(): void {
    this.active = true;
    this.subscribeForListEvents();
    this.showAllDevicesOnMap();
    if (!this.placementDone) {
      this.accButtons.publishVisibility(true);
    } else {
      this.devicePlacerController.setListVisibility(true);
    }
    this.allowToDragAllAnchorsOnMap();
    this.activateAllSelectablesBahavior();
  }

  setInactive(): void {
    this.removeDragFromAllAnchorsOnMap();
    this.devicePlacerController.setListVisibility(false);
    this.active = false;
    this.unsubscribeFromAllListEvents();
    if (!this.placementDone) {
      this.accButtons.publishVisibility(false);
    }
    this.deactivateAllSelectablesBahavior();
    this.hideAllDevicesOnMap();
    this.hideAllConnections();
  }

  getToolName(): ToolName {
    return ToolName.DEVICES;
  }

  setDisabled(value: boolean): void {
    this.disabled = value;
  }

  private lockWizard(disable: boolean): void {
    this.toolbarService.setWizardDisabled(disable);
  }

  private subscribeForListEvents(): void {
    this.listEvents = [];
    this.listEvents.push(this.devicePlacerController.draggingDevice.subscribe((device: Anchor | Sink) => {
      this.draggedDevice = device;
      this.devicePlacerController.setListVisibility(false);
    }));
    this.listEvents.push(this.devicePlacerController.dragEnded.subscribe(() => {
      if (this.draggedDevice && this.placementDone) {
        this.devicePlacerController.setListVisibility(true);
      }
      this.draggedDevice = null;
    }));
    this.listEvents.push(this.devicePlacerController.connectingMode.subscribe((on: boolean) => {
      on ? this.modifyConnections() : this.endModifyingConnections();
    }));
    this.listEvents.push(this.devicePlacerController.deleteClicked.subscribe(() => {
      this.removeSelectedDevice();
    }));
  }

  private unsubscribeFromAllListEvents(): void {
    this.listEvents.forEach((listEventSubscription) => {
      listEventSubscription.unsubscribe();
    });
    this.listEvents = null;
  }

  private showAllDevicesOnMap(): void {
    this.mapDevices.forEach((mapDevice: Expandable) => {
      mapDevice.groupCreated.setVisibility(true);
    })
  }

  private hideAllDevicesOnMap(): void {
    this.mapDevices.forEach((mapDevice: Expandable) => {
      mapDevice.groupCreated.setVisibility(false);
    })
  }

  private bindMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapLoaded) => {
      this.map = mapLoaded.container;
    });
  }

  private captureScaleFactorChanges(): void {
    this.scaleFactorChanged = this.mapEditorService.mapIsTransformed().subscribe((mapTransform: Transform) => {
      this.scaleFactor = mapTransform.k;
    });
  }

  private captureScaleChanges(): void {
    this.scaleChanged = this.scaleService.scaleChanged.subscribe((scale: ScaleDto) => {
      this.scale = new Scale(scale);
      if (!!this.scale.start && !!this.scale.stop) {
        this.scaleCalculations = {
          scaleLengthInPixels: Geometry.getDistanceBetweenTwoPoints(this.scale.start, this.scale.stop),
          scaleInCentimeters: this.scale.getRealDistanceInCentimeters()
        };
      }
    })
  }

  private captureWizardConfigurations(): void {
    this.wizardConfiguration = this.devicePlacerController.wizardSavesConfiguration.subscribe((devicesConfiguredInWizard) => {
      const sinkShortId: number = DevicesComponent.getShortIdFromGroupSelection(devicesConfiguredInWizard[0].groupCreated.getGroup());
      const isSinkPresentInMapDevices: boolean = !!this.findMapDevice(sinkShortId);
      this.mapDevices.concat(devicesConfiguredInWizard);
      const sink: Sink = <Sink>this.findVerifiedDevice(sinkShortId);
      DevicesComponent.updateDeviceCoordinatesFromGroupSelection(sink, devicesConfiguredInWizard[0].groupCreated.getGroup());
      const firstAnchor: Anchor = <Anchor>this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(devicesConfiguredInWizard[1].groupCreated.getGroup()));
      DevicesComponent.updateDeviceCoordinatesFromGroupSelection(firstAnchor, devicesConfiguredInWizard[1].groupCreated.getGroup());
      const secondAnchor: Anchor = <Anchor>this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(devicesConfiguredInWizard[2].groupCreated.getGroup()));
      DevicesComponent.updateDeviceCoordinatesFromGroupSelection(secondAnchor, devicesConfiguredInWizard[2].groupCreated.getGroup());
      sink.anchors.push(firstAnchor, secondAnchor);
      if (!isSinkPresentInMapDevices) {
        this.drawSinksAndConnectedAnchors([sink]);
        this.devicePlacerController.removeFromRemainingDevicesList(sink);
        this.devicePlacerController.removeFromRemainingDevicesList(firstAnchor);
        this.devicePlacerController.removeFromRemainingDevicesList(secondAnchor);
      }
    })
  }

  private fetchConfiguredDevices(): void {
    this.configurationService.configurationLoaded().first().subscribe((configuration) => {
      const config = Helper.deepCopy(configuration);
      this.floorId = config.floorId;
      if (!!config.data.sinks) {
        const sinks: Sink[] = [];
        config.data.sinks.forEach((sink: Sink) => {
          sinks.push(<Sink>this.recalculateDeviceCoordinatesFromCentimetersToPixels(sink))
        });
        this.drawSinksAndConnectedAnchors(sinks);
      }
      if (!!config.data.anchors) {
        const anchors: Anchor[] = [];
        config.data.anchors.forEach((anchor: Anchor) => {
          anchors.push(this.recalculateDeviceCoordinatesFromCentimetersToPixels(anchor));
        });
        this.drawAnchorsWithoutConnection(anchors);
      }
      this.configuration = config;
      this.fetchDevices();
    });
  }

  private recalculateDeviceCoordinatesFromCentimetersToPixels(device: Sink | Anchor): Sink | Anchor {
    const recalculated = Helper.deepCopy(device);
    const coordinates: Point = {x: recalculated.x, y: recalculated.y};
    const positionInPixels: Point = Geometry.calculatePointPositionInPixels(
      this.scaleCalculations.scaleLengthInPixels, this.scaleCalculations.scaleInCentimeters, coordinates);
    recalculated.x = positionInPixels.x;
    recalculated.y = positionInPixels.y;
    return recalculated;
  }

  private recalculateDeviceCoordinatesFromPixelsToCentimeters(device: Sink | Anchor): Sink | Anchor {
    const recalculated = Helper.deepCopy(device);
    const coordinates: Point = {x: recalculated.x, y: recalculated.y};
    const positionInCentimeters: Point = Geometry.calculatePointPositionInCentimeters(
      this.scaleCalculations.scaleLengthInPixels, this.scaleCalculations.scaleInCentimeters, coordinates);
    recalculated.x = positionInCentimeters.x;
    recalculated.y = positionInCentimeters.y;
    return recalculated;
  }

  private subscribeForDroppedDevice(): void {
    this.deviceDrop = this.devicePlacerController.droppedDevice.subscribe(() => {
      if (!!this.draggedDevice) {
        this.placementDone = false;
        this.lockWizard(true);
        this.devicePlacerController.newCoordinates.first().subscribe((coords) => {
          let coordinates: Point;
          if (!coords) {
            this.map.style('cursor', 'crosshair');
            this.map.on('click', () => {
              coordinates = this.zoomService.calculateTransition({x: d3.event.offsetX, y: d3.event.offsetY});
              this.map.on('click', null);
              this.map.style('cursor', 'default');
            });
          } else {
            coordinates = this.zoomService.calculateTransition(coords);
          }
          this.placeDeviceOnMap(this.draggedDevice, coordinates);
        });
      }
    });
  }

  private fetchDevices(): void {
    this.verifiedDevices = [];
    this.deviceService.setUrl('sinks/');
    this.deviceService.getAll().subscribe((sinks: Sink[]) => {
      sinks.forEach((sink: Sink) => {
        if (sink.verified) {
          if (!sink.floorId || sink.floorId === this.configuration.floorId) {
            if (this.getIndexOfSinkInConfiguration(sink) >= 0) {
              sink = this.updateSinkFromConfiguration(sink);
            } else {
              sink = <Sink>DevicesComponent.eraseDevicePublicationData(sink);
              this.devicePlacerController.addToRemainingDevicesList(sink);
            }
          }
          this.verifiedDevices.push(sink);
        }
      });
    });
    this.deviceService.setUrl('anchors/');
    this.deviceService.getAll().subscribe((anchors: Anchor[]) => {
      anchors.forEach((anchor: Anchor) => {
        if (anchor.verified) {
          if (!anchor.floorId || anchor.floorId === this.configuration.floorId) {
            if (this.getIndexOfAnchorInConfiguration(anchor) >= 0) {
              anchor = this.updateAnchorFromConfiguration(anchor);
            } else {
              anchor = <Sink>DevicesComponent.eraseDevicePublicationData(anchor);
              this.devicePlacerController.addToRemainingDevicesList(anchor);
            }
          }
          this.verifiedDevices.push(anchor);
        }
      });
    });
  }

  private updateSinkFromConfiguration(sink: Sink): Sink {
    let updated = sink;
    this.configuration.data.sinks.forEach((configSink) => {
      if (DevicesComponent.hasSameShortId(sink, configSink.shortId)) {
        updated = configSink;
      }
    });
    return updated;
  }

  private updateAnchorFromConfiguration(anchor: Anchor): Anchor {
    let updated = anchor;
    this.configuration.data.anchors.forEach((configAnchor) => {
      if (DevicesComponent.hasSameShortId(anchor, configAnchor.shortId)) {
        updated = configAnchor;
      }
    });
    return updated;
  }

  private updateDeviceCoordinatesFromMap(device: Anchor | Sink): Anchor | Sink {
    const updated = device;
    this.mapDevices.forEach(mapDevice => {
      const identificator = DevicesComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.getGroup());
      if (DevicesComponent.hasSameShortId(device, identificator)) {
        updated.x = mapDevice.groupCreated.getGroup().attr('x');
        updated.y = mapDevice.groupCreated.getGroup().attr('y');
      }
    });
    return updated
  }

  private getIndexOfSinkInConfiguration(sink: Sink): number {
    return this.configuration.data.sinks.findIndex(s => s.shortId === sink.shortId);
  }

  private getIndexOfAnchorInConfiguration(anchor: Anchor): number {
    let index = this.configuration.data.anchors.findIndex(a => a.shortId === anchor.shortId);
    if (index >= 0) {
      return index;
    } else {
      this.configuration.data.sinks.forEach((configSink) => {
        const i = this.getIndexOfAnchorInSinkArray(anchor, configSink);
        if (i >= 0) {
          index = i;
        }
      });
    }
    return index;
  }

  private getIndexOfAnchorInSinkArray(anchor: Anchor, sink: Sink): number {
    return sink.anchors.findIndex(a => a.shortId === anchor.shortId);
  }

  private manageSingleSelectable(mapDevice: Expandable): void {
    mapDevice.selectable.selectOn();
    const managedSelectable: Subscription = mapDevice.selectable.onSelected()
      .subscribe((selectedMapDevice): d3.selection => {
        const deviceShortId = DevicesComponent.getShortIdFromGroupSelection(selectedMapDevice);
        this.devicePlacerController.setSelectedDevice(this.findMapDevice(deviceShortId));
      });
    this.managedSelectableDevices.push(managedSelectable);
  }

  private activateAllSelectablesBahavior(): void {
    this.managedSelectableDevices = [];
    this.mapDevices.forEach((mapDevice: Expandable) => {
      this.manageSingleSelectable(mapDevice);
    });
    this.handleSelectedDevices();
  }

  private showAllConnections(): void {
    this.connectingLines.forEach(connectingLine => {
      DevicesComponent.showSingleConnection(connectingLine);
    });
  }

  private hideAllConnections(): void {
    this.connectingLines.forEach(connectingLine => {
      DevicesComponent.hideSingleConnection(connectingLine);
    });
  }

  private handleSelectedDevices(): void {
    this.handledSelection = this.devicePlacerController.getSelectedDevice()
      .subscribe((selectedDevice) => {
        const lastSelected = this.selectedDevice;
        const handledDevice = this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(selectedDevice.groupCreated.getGroup()));
        let preserveLine: boolean;
        if (!!handledDevice && DevicesComponent.isSinkType(handledDevice)) {
          if (!!lastSelected && this.getIndexOfAnchorInSinkArray(lastSelected, <Sink>handledDevice) > -1) {
            preserveLine = true;
          }
        }
        if (!!lastSelected && !DevicesComponent.hasSameShortId(lastSelected, handledDevice.shortId)) {
          this.clearSelections(preserveLine);
        }
        this.setSelectedDevice(handledDevice);
        if (!!handledDevice && DevicesComponent.isSinkType(handledDevice)) {
          this.chosenSink = <Sink>handledDevice;
        } else if (!!selectedDevice.connectable.anchorConnection) {
          const sinkAsConnectable = selectedDevice.connectable.anchorConnection.connectedSink();
          this.chosenSink = <Sink>this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(sinkAsConnectable.group));
          DevicesComponent.markSinkSubselection(selectedDevice.connectable.anchorConnection);
        }
        const selectableDevice = <SelectableDevice>selectedDevice.selectable;
        selectableDevice.setBorderBox(this.scaleFactor);
        if (this.modifyingConnectionsFlag) {
          if (!this.creatingConnection) {
            this.startCreatingConnection(selectedDevice, DevicesComponent.getMouseCoordinates());
          } else {
            if (!DevicesComponent.hasSameShortId(lastSelected, this.selectedDevice.shortId)) {
              let sink: Sink;
              let anchor: Anchor;
              if (DevicesComponent.isSinkType(lastSelected)) {
                sink = <Sink>lastSelected;
                anchor = handledDevice;
              } else {
                sink = <Sink>handledDevice;
                anchor = lastSelected;
              }
              const identifier = '' + sink.shortId + anchor.shortId;
              const connectingLine = this.createConnection(this.findMapDevice(sink.shortId), this.findMapDevice(anchor.shortId),
                DrawBuilder.buildConnectingLineConfiguration(identifier));
              this.connectingLines.push(connectingLine);
              this.handleSelectableConnections();
              DevicesComponent.showSingleConnection(connectingLine);
              this.configurationService.setAnchorInSink(anchor, sink);
              this.clearSelections();
              this.resetConnecting();
            }
          }
        }
      });
  }

  private blockSelectableBehavior(expandable: Expandable): void {
    expandable.selectable.selectOff();
    expandable.groupCreated.changeColor(`gray`);
    this.blockedDevices.push(expandable);
  }

  private turnOnSelectInAllBlockedDevices(): void {
    this.blockedDevices.forEach(blockedDevice => {
      DevicesComponent.unblockSelectableBehavior(blockedDevice);
    });
    this.blockedDevices = [];
  }

  private turnOffSelectInMapDevicesByType(devicePassed: Expandable): void {
    const verifiedDevice = this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(devicePassed.groupCreated.getGroup()));
    if (DevicesComponent.isSinkType(verifiedDevice)) {
      this.mapDevices.forEach((mapDevice) => {
        const connectable = <ConnectableDevice>mapDevice.connectable;
        const device = this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.getGroup()));
        if (DevicesComponent.isSinkType(device) || !!connectable.anchorConnection) {
          this.blockSelectableBehavior(mapDevice);
        }
      });
    } else {
      this.mapDevices.forEach((mapDevice) => {
        const device = this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.getGroup()));
        if (!DevicesComponent.isSinkType(device)) {
          this.blockSelectableBehavior(mapDevice);
        }
      });
    }
  }

  private turnOffSelectInUnconnectableDevices(): void {
    let notConnectedAnchors = 0;
    const sinks: Expandable[] = [];
    this.mapDevices.forEach((mapDevice) => {
      const device = this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.getGroup()));
      if (!DevicesComponent.isSinkType(device)) {
        notConnectedAnchors++;
        const connectable = <ConnectableDevice>mapDevice.connectable;
        if (!!connectable.anchorConnection) {
          this.blockSelectableBehavior(mapDevice);
          notConnectedAnchors--;
        }
      } else {
        sinks.push(mapDevice)
      }
    });
    if (notConnectedAnchors === 0) {
      sinks.forEach(sink => {
        this.blockSelectableBehavior(sink);
      })
    }
  }

  private startModifyingConnections(): void {
    this.modifyingConnectionsFlag = true;
    this.turnOffSelectInUnconnectableDevices();
    this.removeDragFromAllAnchorsOnMap();
    this.showAllConnections();
    this.handleSelectableConnections();
  }

  private endModifyingConnections(): void {
    if (!!this.creatingConnection) {
      this.removeDashedLine()
    }
    this.modifyingConnectionsFlag = false;
    this.translate.get('connections.manipulationTurnedOff').subscribe((value: string) => {
      this.hintBarService.sendHintMessage(value);
    });
    this.turnOffSelectInConnectingLines();
    this.turnOnSelectInAllBlockedDevices();
    this.hideAllConnections();
    this.allowToDragAllAnchorsOnMap();
  }

  private startCreatingConnection(firstSelection: d3.selection, mousePosition: Point): void {
    const coordinates = this.zoomService.calculateTransition(mousePosition);
    this.creatingConnection = this.createDashedLineAttachedToDevice(firstSelection, coordinates);
    this.turnOffSelectInMapDevicesByType(firstSelection);
    this.turnOffSelectInConnectingLines();
    this.map.on('mousemove', () => {
      const mouseMapOffset = DevicesComponent.getMouseCoordinates();
      const delta = this.zoomService.calculateTransition(mouseMapOffset);
      this.creatingConnection.attr('x2', delta.x);
      this.creatingConnection.attr('y2', delta.y);
    });
  }

  private findConnectingLine(searchedLine: d3.selection): ConnectingLine {
    return this.connectingLines.find((line: ConnectingLine) => {
      return searchedLine.attr(`id`) === line.id;
    });
  }

  private handleSingleConnection(line: ConnectingLine): void {
    line.selectOn();
    const subscribeSelectedLine = line.onSelected().subscribe((selectedLine: d3.selection) => {
      this.setSelectedLine(this.findConnectingLine(selectedLine));
    });
    this.managedSelectableLines.push(subscribeSelectedLine);
  }

  private handleSelectableConnections(): void {
    this.connectingLines.forEach((line: ConnectingLine) => {
      this.handleSingleConnection(line);
    })
  }

  private setSelectedLine(newSelectedLine: ConnectingLine): void {
    this.clearSelectedLine();
    const line = (<Selectable>newSelectedLine);
    this.clearSelections();
    line.highlightSet();
    line.lockHovering();
    this.selectedLine = newSelectedLine;
    this.selectedLine.connection.on('dblclick', () => {
      this.disconnectBySelectedLine();
      event.stopPropagation();
    });
    this.map.on('click', () => {
      this.clearSelectedLine();
      this.map.on('click', null);
    });
  }

  private clearSelectedLine(): void {
    if (!!this.selectedLine) {
      (<Selectable>this.selectedLine).unlockHovering();
      (<Selectable>this.selectedLine).highlightReset();
      this.selectedLine.connection.on('dblclick', null);
    }
    this.selectedLine = null;
  }

  private turnOffSelectInConnectingLines(): void {
    this.connectingLines.forEach((line: ConnectingLine) => {
      line.selectOff();
    });
    this.managedSelectableLines.forEach((subscription: Subscription) => {
      subscription.unsubscribe();
    });
  }

  private disconnectBySelectedLine() {
    const anchorAsConnectable: ConnectableDevice = this.selectedLine.connectedAnchor();
    const sinkAsConnectable: ConnectableDevice = this.selectedLine.connectedSink();
    let anchor = this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(anchorAsConnectable.group));
    const sink = <Sink>this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(sinkAsConnectable.group));
    this.removeConnectingLine(this.selectedLine);
    this.clearSelectedLine();
    this.configurationService.removeAnchorFromSink(anchor, sink);
    anchor = this.updateDeviceCoordinatesFromMap(anchor);
    this.setNotConnectedAnchorInConfiguration(anchor);
    this.turnOnSelectInAllBlockedDevices();
    this.turnOffSelectInUnconnectableDevices();
  }

  private createConnection(sink: Expandable, anchor: Expandable, lineConfig: DrawConfiguration): ConnectingLine {
    const drawBuilder = new DrawBuilder(this.map, lineConfig);
    const connectingLine = new ConnectingLine(drawBuilder.createGroup(), sink.connectable, anchor.connectable);
    sink.connectable.sinkConnections.push(connectingLine);
    anchor.connectable.anchorConnection = connectingLine;
    return connectingLine;
  }

  private createDashedLineAttachedToDevice(device: Expandable, mousePosition: Point): d3.selection {
    return this.map.append('line')
      .attr('id', DevicesComponent.getShortIdFromGroupSelection(device.groupCreated.getGroup()))
      .attr('x1', device.groupCreated.getGroup().attr('x'))
      .attr('y1', device.groupCreated.getGroup().attr('y'))
      .attr('x2', mousePosition.x)
      .attr('y2', mousePosition.y)
      .attr('pointer-events', 'none')
      .attr('stroke', 'orange')
      .style('stroke-dasharray', '5, 5');
  }

  private setSelectedDevice(selectedDevice: Anchor | Sink) {
    this.selectedDevice = selectedDevice;
    this.clearSelectedLine();
    this.map.on('click.deselect', () => {
      if (!!this.creatingConnection) {
        this.resetConnecting()
      }
      this.clearSelections();
    });
  }

  private deselectDevice(device: Expandable, preserveLine: boolean): void {
    if (!this.modifyingConnectionsFlag && !!device && !!device.connectable && !!device.connectable.anchorConnection) {
      device.connectable.unlockConnections();
      if (!preserveLine) {
        device.connectable.anchorConnection.hide()
      }
    }
    if (!!device) {
      const selectableDevice = <SelectableDevice>device.selectable;
      selectableDevice.removeBorderBox();
      this.devicePlacerController.deselected(device);
    } else {
      throw new Error(`Device has been not found and border cannot be removed.`);
    }
  }

  private clearSelections(preserveLine?: boolean): void {
    if (!!this.selectedDevice) {
      const mapDevice = this.findMapDevice(this.selectedDevice.shortId);
      if (!!mapDevice) {
        this.deselectDevice(mapDevice, preserveLine);
      }
    }
    if (!!this.chosenSink) {
      this.chosenSink = null;
    }
    this.selectedDevice = null;
    this.map.on('click.deselect', null);
  }

  private resetConnecting(): void {
    this.removeDashedLine();
    this.turnOnSelectInAllBlockedDevices();
    this.turnOffSelectInUnconnectableDevices();
  }

  private removeDashedLine(): void {
    this.creatingConnection.remove();
    this.creatingConnection = null;
    this.map.on('mousemove', null);
  }

  private deactivateAllSelectablesBahavior(): void {
    this.mapDevices.forEach((mapDevice: Expandable) => {
      mapDevice.selectable.selectOff();
    });
    this.managedSelectableDevices.forEach((selectableSubscription) => {
      selectableSubscription.unsubscribe();
    });
    this.handledSelection.unsubscribe();
    this.clearSelections();
  }

  private findMapDevice(shortId: number): Expandable {
    return this.mapDevices.find((mapDevice: Expandable) => {
      return shortId === DevicesComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.getGroup());
    });
  }

  private findVerifiedDevice(shortId: number): Sink | Anchor {
    return this.verifiedDevices.find((verifiedDevice: Sink | Anchor) => {
      return shortId === verifiedDevice.shortId;
    });
  }

  private drawSinksAndConnectedAnchors(sinks: Array<Sink>): void {
    sinks.forEach((sink) => {
      const mapSink = this.drawDevice(DrawBuilder.buildSinkDrawConfiguration(sink),
        {x: sink.x, y: sink.y});
      sink.anchors.forEach((anchor) => {
        const deviceRecalculatedToPixels = this.recalculateDeviceCoordinatesFromCentimetersToPixels(Helper.deepCopy(anchor));
        const mapAnchor = this.drawDevice(DrawBuilder.buildAnchorDrawConfiguration(anchor),
          {x: deviceRecalculatedToPixels.x, y: deviceRecalculatedToPixels.y});
        const identifier = '' + sink.shortId + anchor.shortId;
        const connectingLine = this.createConnection(mapSink, mapAnchor, DrawBuilder.buildConnectingLineConfiguration(identifier));
        this.connectingLines.push(connectingLine);
      });
    });
  }

  private drawAnchorsWithoutConnection(anchors: Array<Anchor>): void {
    anchors.forEach((anchor) => {
      this.drawDevice(DrawBuilder.buildAnchorDrawConfiguration(anchor), {x: anchor.x, y: anchor.y});
    });
  }

  private allowToDragAllAnchorsOnMap(): void {
    this.mapDevices.forEach((expandable) => {
      expandable.connectable.dragOn();
    });
  }

  private removeDragFromAllAnchorsOnMap(): void {
    this.mapDevices.forEach((expandable) => {
      expandable.connectable.dragOff();
    });
  }

  private removeChosenAnchor(mapAnchor: Expandable): void {
    mapAnchor.groupCreated.remove();
    this.selectedDevice = null;
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('devices.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private drawDevice(deviceConfig: DrawConfiguration,
                     coordinates: Point): Expandable {
    const drawBuilder = new DrawBuilder(this.map, deviceConfig);
    const droppedDevice = this.drawEditorDevice(drawBuilder, deviceConfig, coordinates);
    const mapDevice = DevicesComponent.createConnectableDevice(droppedDevice);
    this.mapDevices.push(mapDevice);
    this.subscribeForDraggedOnMapEvent(mapDevice);
    return mapDevice;
  }

  private subscribeForDraggedOnMapEvent(expandable: Expandable): void {
    expandable.connectable.afterDragEvent().subscribe((draggedDevice: d3.selection) => {
      let device = this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(draggedDevice));
      device = this.updateDeviceCoordinatesFromMap(device);
      if (DevicesComponent.isSinkType(device)) {
        this.setSinkInConfiguration(<Sink>device)
      } else if (!!expandable.connectable.anchorConnection) {
        const sinkAsConnectable = expandable.connectable.anchorConnection.connectedSink();
        const sink = <Sink>this.findVerifiedDevice(DevicesComponent.getShortIdFromGroupSelection(sinkAsConnectable.group));
        const draggedAnchor = sink.anchors.find((anchor) => {
          return anchor.shortId === device.shortId;
        });
        this.updateDeviceCoordinatesFromMap(draggedAnchor);
        this.configurationService.setAnchorInSink(this.recalculateDeviceCoordinatesFromPixelsToCentimeters(draggedAnchor), sink);
      } else {
        this.setNotConnectedAnchorInConfiguration(device);
      }
    });
  }

  private placeDeviceOnMap(device: Anchor | Sink, coordinates: Point): void {
    const drawOptions = (DevicesComponent.isSinkType(device))
      ? DrawBuilder.buildSinkDrawConfiguration(<Sink>device)
      : DrawBuilder.buildAnchorDrawConfiguration(<Anchor>device);
    drawOptions.display = `block`;
    const expandableMapObject = this.drawDevice(drawOptions, coordinates);
    let connectingLine: ConnectingLine;
    if (!!this.chosenSink && !DevicesComponent.isSinkType(device)) {
      const identifier = '' + this.chosenSink.shortId + device.shortId;
      const mapSink = this.findMapDevice(this.chosenSink.shortId);
      connectingLine = this.createConnection(mapSink, expandableMapObject, DrawBuilder.buildConnectingLineConfiguration(identifier));
      DevicesComponent.showSingleConnection(connectingLine);
      this.connectingLines.push(connectingLine);
    }
    this.openAcceptanceButtons(device, coordinates, expandableMapObject, connectingLine);
  }

  private openAcceptanceButtons(device: Sink | Anchor, coordinates: Point, asExpandable: Expandable, connection: ConnectingLine): void {
    this.accButtons.publishVisibility(true);
    asExpandable.connectable.dragOn();
    asExpandable.connectable.toggleDragEmitLock();
    this.removeFromRemainingDevices(device);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      if (decision) {
        device.x = coordinates.x;
        device.y = coordinates.y;
        if (DevicesComponent.isSinkType(device)) {
          this.setSinkInConfiguration(<Sink>device);
        } else if (!!this.chosenSink) {
          this.configurationService.setAnchorInSink(this.recalculateDeviceCoordinatesFromPixelsToCentimeters(device), this.chosenSink);
          DevicesComponent.hideSingleConnection(connection)
        } else {
          this.setNotConnectedAnchorInConfiguration(device);
        }
        this.manageSingleSelectable(asExpandable);
        asExpandable.selectable.select();
        asExpandable.connectable.toggleDragEmitLock();
        this.finishPlacement();
      } else {
        if (!!connection) {
          this.removeConnectingLine(connection)
        }
        this.removeFromMapDevices(asExpandable);
        this.removeChosenAnchor(asExpandable);
        this.addToRemainingDevices(device);
        this.finishPlacement();
      }
    });
  }

  private finishPlacement(): void {
    this.devicePlacerController.resetCoordinates();
    this.placementDone = true;
    this.lockWizard(false);
    this.devicePlacerController.setListVisibility(true);
  }

  private addToRemainingDevices(device: Sink | Anchor): void {
    this.devicePlacerController.addToRemainingDevicesList(device);
  }

  private removeFromRemainingDevices(device: Sink | Anchor): void {
    this.devicePlacerController.removeFromRemainingDevicesList(device);
  }

  private removeFromMapDevices(device: Expandable): void {
    const index = this.mapDevices.findIndex(d => d.groupCreated.getGroup() === device.groupCreated.getGroup());
    if (index >= 0) {
      this.mapDevices.splice(index, 1);
    } else {
      throw new Error(`Device has been not found in map devices and cannot be removed.`);
    }
  }

  private setSinkInConfiguration(sink: Sink): void {
    this.configurationService.setSink(<Sink>
      this.recalculateDeviceCoordinatesFromPixelsToCentimeters(sink));
  }

  private setNotConnectedAnchorInConfiguration(anchor: Anchor): void {
    this.configurationService.setAnchor(
      this.recalculateDeviceCoordinatesFromPixelsToCentimeters(anchor));
  }

  private removeFromConfiguration(device: Sink | Anchor): void {
    const mapDevice = this.findMapDevice(device.shortId);
    if (DevicesComponent.isSinkType(this.selectedDevice)) {
      this.removeSinkFromConfiguration(<Sink>device);
    }
    if (!!mapDevice.connectable.anchorConnection) {
      this.removeConnectingLine(mapDevice.connectable.anchorConnection);
      this.removeAnchorFromConfiguredSink(device, this.chosenSink);
      this.devicePlacerController.addToRemainingDevicesList(device);
    } else {
      this.removeAnchorFromConfiguration(device);
    }
  }

  public removeSinkContainingAnchors(withAnchors: boolean): void {
    const mapSink = this.findMapDevice(this.sinkRemoval.shortId);
    this.sinkRemoval.anchors.forEach((connectedAnchor) => {
      const anchorOnMap = this.findMapDevice(connectedAnchor.shortId);
      this.removeConnectingLine(anchorOnMap.connectable.anchorConnection);
      anchorOnMap.connectable.anchorConnection = null;
      if (withAnchors) {
        const mapAnchor = this.findMapDevice(connectedAnchor.shortId);
        mapAnchor.groupCreated.remove();
        this.removeFromMapDevices(mapAnchor);
        this.addToRemainingDevices(connectedAnchor);
      } else {
        this.setNotConnectedAnchorInConfiguration(connectedAnchor)
      }
    });
    mapSink.connectable.sinkConnections.forEach((sinkConnection) => {
      this.removeConnectingLine(sinkConnection);
      sinkConnection = null;
    });
    mapSink.groupCreated.remove();
    this.removeFromMapDevices(mapSink);
    this.removeSinkFromConfiguration(this.sinkRemoval);
    this.sinkRemoval = null;
  }

  public cancelRemoval(): void {
    this.sinkRemoval = null;
  }

  private removeConnectingLine(connectingLine: ConnectingLine): void {
    const connectedSink = connectingLine.connectedSink();
    const connectedAnchor = connectingLine.connectedAnchor();
    connectedAnchor.anchorConnection = null;
    let index = connectedSink.sinkConnections.findIndex(l => l.id === connectingLine.id);
    if (index >= 0) {
      connectedSink.sinkConnections.splice(index, 1);
    } else {
      throw new Error(`Connection with id: ${connectingLine.id} has been not found in sink and cannot be removed.`);
    }
    index = this.connectingLines.findIndex(l => l.id === connectingLine.id);
    if (index >= 0) {
      this.connectingLines.splice(index, 1);
      connectingLine.removeConnection();
    } else {
      throw new Error(`Connection with id: ${connectingLine.id} has been not found and cannot be removed.`);
    }
  }

  private removeSinkFromConfiguration(sink: Sink): void {
    this.configurationService.removeSink(sink);
    this.devicePlacerController.addToRemainingDevicesList(sink);
  }

  private removeAnchorFromConfiguredSink(anchor: Anchor, sink: Sink): Sink {
    const index = sink.anchors.findIndex(a => a.shortId === anchor.shortId);
    if (index >= 0) {
      sink.anchors.splice(index, 1);
      this.configurationService.setSink(sink);
    } else {
      throw new Error(`Anchor with id: ${anchor.shortId} has been not found in Sink connected anchors.`);
    }
    return sink;
  }

  private removeAnchorFromConfiguration(anchor: Anchor): void {
    this.configurationService.removeAnchor(anchor);
    this.devicePlacerController.addToRemainingDevicesList(anchor);
  }
}

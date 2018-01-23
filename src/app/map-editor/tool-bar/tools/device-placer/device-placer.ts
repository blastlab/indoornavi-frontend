import {Component, EventEmitter, HostListener, OnInit, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from '@angular/animations';
import {Tool} from '../tool';
import {ToolName} from '../tools.enum';
import {TranslateService} from '@ngx-translate/core';
import {DevicePlacerController} from './device-placer.controller';
import {Point} from '../../../map.type';
import {IconService, NaviIcons} from '../../../../utils/drawing/icon.service';
import {AcceptButtonsService} from '../../../../utils/accept-buttons/accept-buttons.service';
import * as d3 from 'd3';
import {Sink} from '../../../../device/sink.type';
import {Anchor} from '../../../../device/anchor.type';
import {DrawBuilder, DrawConfiguration} from '../../../../utils/builder/draw.builder';
import {Subscription} from 'rxjs/Subscription';
import {MapLoaderInformerService} from 'app/utils/map-loader-informer/map-loader-informer.service';
import {Configuration} from '../../../action-bar/actionbar.type';
import {ConnectingLine} from '../../../../utils/builder/draggables/connectables/connection';
import {ConnectableDevice} from 'app/utils/builder/draggables/connectables/connectableDevice';
import {Expandable} from '../../../../utils/builder/expandable';
import {ActionBarService} from 'app/map-editor/action-bar/actionbar.service';
import {ToolbarService} from '../../toolbar.service';
import {DeviceService} from '../../../../device/device.service';
import {HintBarService} from 'app/map-editor/hint-bar/hintbar.service';
import {SelectableDevice} from '../../../../utils/builder/selectables/selectableDevice';
import {Selectable} from '../../../../utils/builder/selectables/selectable';

@Component({
  selector: 'app-device-placer',
  templateUrl: './device-placer.html',
  styleUrls: ['../tool.css', './device-placer.css'],
  animations: [
    trigger('slideInOut', [
      state('in', style({
        transform: 'translate3d(125%, 0, 0)'
      })),
      state('out', style({
        transform: 'translate3d(0, 0, 0)'
      })),
      transition('in <=> out', animate('400ms easeInOut'))
    ]),
  ]
})
export class DevicePlacerComponent implements Tool, OnInit {
  @Output() clicked: EventEmitter<Tool> = new EventEmitter<Tool>();
  public active: boolean = false;
  public remainingDevices: Array<Anchor | Sink> = [];
  public queryString: string;
  private draggedDevice: Anchor | Sink;
  private listState: string = 'out';
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
  private managedSelectableLines: Subscription[];
  private chosenSink: Sink;
  private selectedDevice: Anchor | Sink;
  private selectedLine: ConnectingLine;
  private connectingLines: ConnectingLine[] = [];
  private modifyingConnectionsFlag: boolean;
  private creatingConnection: d3.selection;

  static getShortIdFromGroupSelection(selection: d3.selection): number {
    return parseInt(selection.attr('id'), 10);
  }

  static isSinkType(checkType: any): boolean {
    return (<Sink>checkType.anchors) !== undefined;
  }

  static hasSameShortId(device: Sink | Anchor, id: number): boolean {
    return device.shortId === id;
  }

  static getMouseCoordinates(): Point {
    return {x: d3.event.offsetX, y: d3.event.offsetY};
  }

  static buildAnchorDrawConfiguration(anchor: Anchor): DrawConfiguration {
    return {
      id: `${anchor.shortId}`,
      clazz: `anchor`,
      name: `${anchor.name}`,
      cursor: `pointer`,
      color: `green`
    };
  }

  static buildSinkDrawConfiguration(sink: Sink): DrawConfiguration {
    return {
      id: `${sink.shortId}`,
      clazz: `sink anchor`,
      name: `${sink.name}`,
      cursor: `pointer`,
      color: `orange`
    };
  }

  static buildConnectingLineConfiguration(id: string | number): DrawConfiguration {
    return {
      id: `${id}`,
      clazz: `connection`,
      cursor: `inherit`,
      color: `orange`
    };
  }

  static unblockSelectableBehavior(expandable: Expandable): void {
    expandable.connectable.handleHovering();
    expandable.selectable.handleHovering();
    expandable.selectable.selectOn();
    expandable.groupCreated.resetColor();
  }

  static markSinkSubselection(connectingLine: ConnectingLine): void {
    DevicePlacerComponent.showSingleConnection(connectingLine);
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
              private devicePlacerController: DevicePlacerController,
              private accButtons: AcceptButtonsService,
              private deviceService: DeviceService,
              private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private toolbarService: ToolbarService,
              private icons: IconService,
              private hintBarService: HintBarService) {
    this.setTranslations();
  }

  @HostListener('document:keydown.escape', [])
  private handleEscapeKey(): void {
    if (!this.selectedDevice && this.modifyingConnectionsFlag && !this.selectedLine) {
      this.translate.get('connections.manipulationTurnedOff').subscribe((value: string) => {
        this.hintBarService.emitHintMessage(value);
      });
      this.endModificationConnections();
    }
    if (this.selectedDevice) {
      if (!!this.creatingConnection) {
        this.resetConnecting()
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
      this.endModificationConnections();
    } else {
      this.toolbarService.emitToolChanged(this);
    }
  }

  public removeSelectedDevice(): void {
    if (!!this.creatingConnection) {
      this.resetConnecting()
    }
    this.removeFromConfiguration(this.selectedDevice);
    const mapDevice = this.findMapDevice(this.selectedDevice.shortId);
    mapDevice.groupCreated.remove();
    this.clearSelections();
    this.removeFromMapDevices(mapDevice);
  }

  public modifyConnections(): void {
    this.translate.get('connections.manipulationTurnedOn').subscribe((value: string) => {
      this.hintBarService.emitHintMessage(value);
    });
    // this.clearSelections();
    // hintbar -> select (click) a device to connect | translate
    if (!!this.selectedDevice) {
      const selectedMapDevice = this.findMapDevice(this.selectedDevice.shortId);
      if (!selectedMapDevice.connectable.anchorConnection) {
        this.map.on('mousemove', () => {
          this.map.on('mousemove', null);
          this.startCreatingConnection(selectedMapDevice, DevicePlacerComponent.getMouseCoordinates());
        });
      } else {
        this.clearSelections();
      }
    }
    this.startModifyingConnections();
  }

  public dragDeviceStarted(device: Anchor | Sink, event): void {
    this.draggedDevice = device;
    const dragImage = document.createElementNS(`http://www.w3.org/200/svg`, `svg`);
    dragImage.setAttributeNS(null, `id`, `dragImage`);
    dragImage.setAttributeNS(null, `x`, event.x);
    dragImage.setAttributeNS(null, `y`, event.y);
    dragImage.setAttributeNS(null, `stroke`, `black`);
    dragImage.setAttributeNS(null, `fill`, `black`);
    dragImage.innerHTML = this.icons.getIcon(NaviIcons.POINTER);
    document.documentElement.appendChild(dragImage);
    // this.map.append(dragImage);
    event.dataTransfer.setDragImage(dragImage, event.x, event.y);
    this.toggleList();
  }

  public dragDeviceEnded(): void {
    if (this.draggedDevice && this.placementDone) {
      this.toggleList();
    }
    this.draggedDevice = null;
  }

  getHintMessage(): string {
    return this.hintMessage;
  }

  ngOnInit(): void {
    this.getMapSelection();
    this.getConfiguredDevices();
    this.subscribeForDroppedDevice();
  }

  setActive(): void {
    this.active = true;
    this.allowToDragAllAnchorsOnMap();
    this.toggleList();
    this.activateAllSelectablesBahavior();
  }

  setInactive(): void {
    this.removeDragFromAllAnchorsOnMap();
    this.toggleList();
    this.active = false;
    if (!this.placementDone) {
      this.accButtons.publishDecision(false);
      this.accButtons.publishVisibility(false);
    }
    this.deactivateAllSelectablesBahavior();
  }

  getToolName(): ToolName {
    return ToolName.ANCHOR;
  }

  private getMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapLoaded) => {
      this.map = mapLoaded;
    });
  }

  private getConfiguredDevices(): void {
    this.configurationService.configurationLoaded().first().subscribe((configuration) => {
      this.floorId = configuration.floorId;
      if (!!configuration.data.sinks) {
        this.drawSinksAndConnectedAnchors(configuration.data.sinks);
      }
      if (!!configuration.data.anchors) {
        this.drawAnchorsWithoutConnection(configuration.data.anchors);
      }
      this.configuration = configuration;
      this.fetchDevices();
    });
  }

  private subscribeForDroppedDevice(): void {
    this.devicePlacerController.droppedDevice.subscribe(() => {
      if (!!this.draggedDevice) {
        this.placementDone = false;
        this.devicePlacerController.newCoordinates.first().subscribe((coords) => {
          let coordinates: Point;
          const map = d3.select('#map');
          if (!coords) {
            map.style('cursor', 'crosshair');
            map.on('click', () => {
              coordinates = {x: d3.event.offsetX, y: d3.event.offsetY};
              map.on('click', null);
              map.style('cursor', 'default');
            });
          } else {
            coordinates = coords;
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
              this.remainingDevices.push(sink);
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
              this.remainingDevices.push(anchor);
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
      if (DevicePlacerComponent.hasSameShortId(sink, configSink.shortId)) {
        updated = configSink;
      }
    });
    return updated;
  }

  private updateAnchorFromConfiguration(anchor: Anchor): Anchor {
    let updated = anchor;
    this.configuration.data.anchors.forEach((configAnchor) => {
      if (DevicePlacerComponent.hasSameShortId(anchor, configAnchor.shortId)) {
        updated = configAnchor;
      }
    });
    return updated;
  }

  private updateDeviceCoordinatesFromMap(device: Anchor | Sink): Anchor | Sink {
    const updated = device;
    this.mapDevices.forEach( mapDevice => {
      const identificator = DevicePlacerComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.domGroup);
      if (DevicePlacerComponent.hasSameShortId(device, identificator)) {
        updated.x = mapDevice.groupCreated.domGroup.attr('x');
        updated.y = mapDevice.groupCreated.domGroup.attr('y');
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
        const deviceShortId = DevicePlacerComponent.getShortIdFromGroupSelection(selectedMapDevice);
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
      DevicePlacerComponent.showSingleConnection(connectingLine);
    });
  }

  private hideAllConnections(): void {
    this.connectingLines.forEach(connectingLine => {
      DevicePlacerComponent.hideSingleConnection(connectingLine);
    });
  }

  private handleSelectedDevices(): void {
    this.handledSelection = this.devicePlacerController.getSelectedDevice()
      .subscribe((selectedDevice) => {
        const lastSelected = this.selectedDevice;
        this.clearSelections();
        const handledDevice = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(selectedDevice.groupCreated.domGroup));
        this.setSelectedDevice(handledDevice);
        if (DevicePlacerComponent.isSinkType(handledDevice)) {
          this.chosenSink = <Sink>handledDevice;
        } else if (!!selectedDevice.connectable.anchorConnection) {
          const sinkAsConnectable = selectedDevice.connectable.anchorConnection.connectedSink();
          this.chosenSink = <Sink>this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(sinkAsConnectable.domGroup));
          DevicePlacerComponent.markSinkSubselection(selectedDevice.connectable.anchorConnection);
        }
        const selectableDevice = <SelectableDevice>selectedDevice.selectable;
        selectableDevice.setBorderBox('red');
        if (this.modifyingConnectionsFlag) {
          if (!this.creatingConnection) {
            this.startCreatingConnection(selectedDevice, DevicePlacerComponent.getMouseCoordinates());
          } else {
            if (lastSelected.shortId !== this.selectedDevice.shortId) {
              let sink: Sink;
              let anchor: Anchor;
              if (DevicePlacerComponent.isSinkType(lastSelected)) {
                sink = <Sink>lastSelected;
                anchor = handledDevice;
              } else {
                sink = <Sink>handledDevice;
                anchor = lastSelected;
              }
              const identifier = '' + sink.shortId + anchor.shortId;
              const connectingLine = this.createConnection(this.findMapDevice(sink.shortId), this.findMapDevice(anchor.shortId),
                DevicePlacerComponent.buildConnectingLineConfiguration(identifier));
              this.connectingLines.push(connectingLine);
              this.handleSelectableConnections();
              DevicePlacerComponent.showSingleConnection(connectingLine);
              this.setAnchorInConfiguredSink(anchor, sink);
              // TODO modify configuration
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
      DevicePlacerComponent.unblockSelectableBehavior(blockedDevice);
    });
    this.blockedDevices = [];
  }

  private turnOffSelectInMapDevicesByType(devicePassed: Expandable): void {
    const verifiedDevice = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(devicePassed.groupCreated.domGroup));
    if (DevicePlacerComponent.isSinkType(verifiedDevice)) {
      this.mapDevices.forEach((mapDevice) => {
        const connectable = <ConnectableDevice>mapDevice.connectable;
        const device = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.domGroup));
        if (DevicePlacerComponent.isSinkType(device) || !!connectable.anchorConnection) {
          this.blockSelectableBehavior(mapDevice);
        }
      });
    } else {
      this.mapDevices.forEach((mapDevice) => {
        const device = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.domGroup));
        if (!DevicePlacerComponent.isSinkType(device)) {
          this.blockSelectableBehavior(mapDevice);
        }
      });
    }
  }

  private turnOffSelectInUnconnectableDevices(): void {
    let notConnectedAnchors = 0;
    const sinks: Expandable[] = [];
    this.mapDevices.forEach((mapDevice) => {
      const device = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.domGroup));
      if (!DevicePlacerComponent.isSinkType(device)) {
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
    this.toggleList();
  }

  private endModificationConnections(): void {
    this.modifyingConnectionsFlag = false;
    this.turnOffSelectInConnectingLines();
    this.turnOnSelectInAllBlockedDevices();
    this.hideAllConnections();
    this.allowToDragAllAnchorsOnMap();
    this.toggleList();
  }

  private startCreatingConnection(firstSelection: d3.selection, mousePosition: Point): void {
    this.creatingConnection = this.createDashedLineAttachedToDevice(firstSelection, mousePosition);
    this.turnOffSelectInMapDevicesByType(firstSelection);
    this.turnOffSelectInConnectingLines();
    this.map.on('mousemove', () => {
      const mouseMapOffset = DevicePlacerComponent.getMouseCoordinates();
      this.creatingConnection.attr('x2', mouseMapOffset.x);
      this.creatingConnection.attr('y2', mouseMapOffset.y);
    });
  }

  private findConnectingLine(searchedLine: d3.selection): ConnectingLine {
    return this.connectingLines.find((line: ConnectingLine) => {
      return searchedLine.attr(`id`) === line.connection.attr(`id`);
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
    this.managedSelectableLines = [];
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
    this.managedSelectableLines = [];
  }

  private disconnectBySelectedLine() {
    const anchorAsConnectable: ConnectableDevice = this.selectedLine.connectedAnchor();
    const sinkAsConnectable: ConnectableDevice = this.selectedLine.connectedSink();
    const mapAnchor = this.findMapDevice(DevicePlacerComponent.getShortIdFromGroupSelection(anchorAsConnectable.domGroup));
    let anchor = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(anchorAsConnectable.domGroup));
    let sink = <Sink>this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(sinkAsConnectable.domGroup));
    DevicePlacerComponent.unblockSelectableBehavior(mapAnchor);
    this.removeConnectingLine(this.selectedLine);
    this.clearSelectedLine();
    sink = this.removeAnchorFromConfiguredSink(anchor, sink);
    anchor = this.updateDeviceCoordinatesFromMap(anchor);
    this.setNotConnectedAnchorInConfiguration(anchor);
    this.setSinkInConfiguration(sink);
  }

  private createConnection(sink: Expandable, anchor: Expandable, lineConfig: DrawConfiguration): ConnectingLine {
    const drawBuilder = new DrawBuilder(this.map, lineConfig);
    const connectingLine = new ConnectingLine(drawBuilder.createGroup(), sink.connectable, anchor.connectable, lineConfig.id);
    sink.connectable.sinkConnections.push(connectingLine);
    anchor.connectable.anchorConnection = connectingLine;
    return connectingLine;
  }

  private createDashedLineAttachedToDevice(device: Expandable, mousePosition: Point): d3.selection {
    return this.map.append('line')
      .attr('id', DevicePlacerComponent.getShortIdFromGroupSelection(device.groupCreated.domGroup))
      .attr('x1', device.groupCreated.domGroup.attr('x'))
      .attr('y1', device.groupCreated.domGroup.attr('y'))
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
      this.handleSelectableConnections();
    });
  }

  private deselectDevice(device: Expandable): void {
    if (!!device.connectable.anchorConnection && !this.modifyingConnectionsFlag) { // unlock bug when creating a line then deselecting
      device.connectable.unlockConnections();
      device.connectable.anchorConnection.hide();
    }
    const selectableDevice = <SelectableDevice>device.selectable;
    selectableDevice.removeBorderBox();
  }

  private clearSelections(): void {
    if (!!this.selectedDevice) {
      this.deselectDevice(this.findMapDevice(this.selectedDevice.shortId));
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
      return shortId === DevicePlacerComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.domGroup);
    });
  }

  private findVerifiedDevice(shortId: number): Sink | Anchor {
    return this.verifiedDevices.find((verifiedDevice: Sink | Anchor) => {
      return shortId === verifiedDevice.shortId;
    });
  }

  private drawSinksAndConnectedAnchors(sinks: Array<Sink>): void {
    sinks.forEach((sink) => {
      const mapSink = this.drawDevice(DevicePlacerComponent.buildSinkDrawConfiguration(sink),
        {x: sink.x, y: sink.y});
      sink.anchors.forEach((anchor) => {
        const mapAnchor = this.drawDevice(DevicePlacerComponent.buildAnchorDrawConfiguration(anchor),
          {x: anchor.x, y: anchor.y});
        const identifier = '' + sink.shortId + anchor.shortId;
        const connectingLine = this.createConnection(mapSink, mapAnchor, DevicePlacerComponent.buildConnectingLineConfiguration(identifier));
        this.connectingLines.push(connectingLine);
      });
    });
  }

  private drawAnchorsWithoutConnection(anchors: Array<Anchor>): void {
    anchors.forEach((anchor) => {
      this.drawDevice(DevicePlacerComponent.buildAnchorDrawConfiguration(anchor), {x: anchor.x, y: anchor.y});
    });
  }

  private toggleList(): void {
    this.listState = this.listState === 'out' ? 'in' : 'out';
  }

  private allowToDragAllAnchorsOnMap(): void {
    this.mapDevices.forEach((expandable) => {
      expandable.connectable.dragOn(false);
    });
  }

  private removeDragFromAllAnchorsOnMap(): void {
    this.mapDevices.forEach((expandable) => {
      expandable.connectable.dragOff();
    });
  }

  private removeChosenAnchor(mapAnchor: Expandable): void {
    mapAnchor.connectable.domGroup.remove();
    this.selectedDevice = null;
  }

  private setTranslations(): void {
    this.translate.setDefaultLang('en');
    this.translate.get('anchor.first.message').subscribe((value: string) => {
      this.hintMessage = value;
    });
  }

  private drawDevice(deviceConfig: DrawConfiguration,
                     coordinates: Point): Expandable {
    const drawBuilder = new DrawBuilder(this.map, deviceConfig);
    const text = (deviceConfig.name !== null)
      ? `${deviceConfig.name}-${deviceConfig.id}`
      : `${deviceConfig.clazz}-${deviceConfig.id}`;
    const droppedDevice = drawBuilder.createGroup()
      .place(coordinates)
      .addPointer({x: -12, y: -12}, this.icons.getIcon(NaviIcons.POINTER))
      .addText({x: 5, y: -5}, text);
    if (deviceConfig.clazz.includes(`sink`)) {
      droppedDevice.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.SINK));
    } else if (deviceConfig.clazz.includes(`anchor`)) {
      droppedDevice.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.ANCHOR));
    }
    const mapDevice: Expandable = {
      groupCreated: droppedDevice,
      selectable: new SelectableDevice(droppedDevice),
      connectable: new ConnectableDevice(droppedDevice)
    };
    this.mapDevices.push(mapDevice);
    this.subscribeForDraggedEvent(mapDevice);
    return mapDevice;
  }

  private subscribeForDraggedEvent(expandable: Expandable): void {
    expandable.connectable.afterDragEvent().subscribe( (draggedDevice: d3.selection) => {
      let device = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(draggedDevice));
      device = this.updateDeviceCoordinatesFromMap(device);
      if (DevicePlacerComponent.isSinkType(device)) {
        this.setSinkInConfiguration(<Sink>device)
      } else if (!!expandable.connectable.anchorConnection) {
        const sinkAsConnectable = expandable.connectable.anchorConnection.connectedSink();
        const sink = <Sink>this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(sinkAsConnectable.domGroup));
        sink.anchors.forEach( anchor => {this.updateDeviceCoordinatesFromMap(anchor)});
        this.setSinkInConfiguration(sink);
      } else {
        this.setNotConnectedAnchorInConfiguration(device);
      }
    });
  }

  private placeDeviceOnMap(device: Anchor | Sink, coordinates: Point): void {
    const drawOptions = (DevicePlacerComponent.isSinkType(device))
      ? DevicePlacerComponent.buildSinkDrawConfiguration(<Sink>device)
      : DevicePlacerComponent.buildAnchorDrawConfiguration(<Anchor>device);
    const expandableMapObject = this.drawDevice(drawOptions, coordinates);
    let connectingLine: ConnectingLine;
    if (!!this.chosenSink && !DevicePlacerComponent.isSinkType(device)) {
      const identifier = '' + this.chosenSink.shortId + device.shortId;
      const mapSink = this.findMapDevice(this.chosenSink.shortId);
      connectingLine = this.createConnection(mapSink, expandableMapObject, DevicePlacerComponent.buildConnectingLineConfiguration(identifier));
      DevicePlacerComponent.showSingleConnection(connectingLine);
      this.connectingLines.push(connectingLine);
    }
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    expandableMapObject.connectable.dragOn(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      if (decision) {
        device.x = coordinates.x;
        device.y = coordinates.y;
        if (DevicePlacerComponent.isSinkType(device)) {
          this.setSinkInConfiguration(<Sink>device);
        } else if (!!this.chosenSink) {
          this.setAnchorInConfiguredSink(device, this.chosenSink);
          DevicePlacerComponent.hideSingleConnection(connectingLine)
        } else {
          this.setNotConnectedAnchorInConfiguration(device);
        }
        this.manageSingleSelectable(expandableMapObject);
        expandableMapObject.selectable.select();
        this.removeFromRemainingDevices(device);
      } else {
        if (!!connectingLine) {
          this.removeConnectingLine(connectingLine)
        }
        this.removeChosenAnchor(expandableMapObject);
      }
      this.devicePlacerController.resetCoordinates();
      this.placementDone = true;
      this.toggleList();
    });
  }

  private removeFromRemainingDevices(device: Sink | Anchor) {
    const index = this.remainingDevices.findIndex(d => d.shortId === device.shortId);
    if (index >= 0) {
      this.remainingDevices.splice(index, 1);
    } else {
      throw new Error(`Device with id: ${device.shortId} has been not found in remaining devices and cannot be removed.`);
    }
  }

  private removeFromMapDevices(device: Expandable) {
    const index = this.mapDevices.findIndex(d => d.groupCreated.domGroup === device.groupCreated.domGroup);
    if (index >= 0) {
      this.mapDevices.splice(index, 1);
    } else {
      throw new Error(`Device has been not found in map devices and cannot be removed.`);
    }
  }

  private setSinkInConfiguration(sink: Sink): void {
    this.configurationService.setSink(sink);
  }

  private setAnchorInConfiguredSink(anchor: Anchor, sink: Sink): void {
    sink.anchors.push(anchor);
    this.configurationService.removeAnchor(anchor);
    this.configurationService.setSink(sink);
  }

  private setNotConnectedAnchorInConfiguration(anchor: Anchor): void {
    this.configurationService.setAnchor(anchor);
  }

  private removeFromConfiguration(device: Sink | Anchor): void {
    const mapDevice = this.findMapDevice(device.shortId);
    const isConnectedFlag = (!!mapDevice.connectable.anchorConnection || !!mapDevice.connectable.sinkConnections.length);
    if (DevicePlacerComponent.isSinkType(device)) {
      if ((<Sink>device).anchors.length !== 0) {
        // ask user about deletion decision
        // option where anchors stay on map
        const sinkWithConnections = <Sink>device;
        sinkWithConnections.anchors.forEach((connectedAnchor) => {
          const anchorOnMap = this.findMapDevice(connectedAnchor.shortId);
          this.removeConnectingLine(anchorOnMap.connectable.anchorConnection);
          anchorOnMap.connectable.anchorConnection = null;
          this.setNotConnectedAnchorInConfiguration(connectedAnchor);
        });
        mapDevice.connectable.sinkConnections.forEach((sinkConnection) => {
          this.removeConnectingLine(sinkConnection);
          sinkConnection = null;
        })
      }
      this.removeSinkFromConfiguration(<Sink>device)
    } else {
      if (!!mapDevice.connectable.anchorConnection) {
        this.removeConnectingLine(mapDevice.connectable.anchorConnection);
        this.removeAnchorFromConfiguredSink(device, this.chosenSink);
      } else {
        this.removeAnchorFromConfiguration(device);
      }
    }
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
    this.remainingDevices.push(sink);
  }

  private removeAnchorFromConfiguredSink(anchor: Anchor, sink: Sink): Sink {
    const index = sink.anchors.findIndex(a => a.shortId === anchor.shortId);
    if (index >= 0) {
      sink.anchors.splice(index, 1);
      this.configurationService.setSink(sink);
      this.remainingDevices.push(anchor);
    } else {
      throw new Error(`Anchor with id: ${anchor.shortId} has been not found in Sink connected anchors.`);
    }
    return sink;
  }

  private removeAnchorFromConfiguration(anchor: Anchor): void {
    this.configurationService.removeAnchor(anchor);
    this.remainingDevices.push(anchor);
  }
}

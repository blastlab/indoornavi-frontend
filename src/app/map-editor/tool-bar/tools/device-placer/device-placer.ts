import {Component, EventEmitter, OnInit, Output} from '@angular/core';
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
import {ConnectingLine} from '../../../../utils/builder/connection';
import {ConnectableDevice} from 'app/utils/builder/connectableDevice';
import {Selectable} from '../../../../utils/builder/selectable';
import {Expandable} from '../../../../utils/builder/expandable';
import {ActionBarService} from 'app/map-editor/action-bar/actionbar.service';
import {ToolbarService} from '../../toolbar.service';
import {DeviceService} from '../../../../device/device.service';

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
  public remainingDevices: Array<Anchor|Sink> = [];
  public draggedDevice: Anchor|Sink;
  public queryString;
  private listState: string = 'out';
  private hintMessage: string;
  private floorId: number;
  private mapLoadedSubscription: Subscription;
  private handledSelection: Subscription;
  private map: d3.selection;
  private mapDevices: Expandable[] = [];
  private verifiedDevices: Array<Anchor|Sink>;
  private placementDone: boolean = true;
  private managedSelectables: Subscription[];
  private chosenSink: Sink;
  private selectedDevice: Anchor|Sink;
  private connectingLines: ConnectingLine[] = [];

  static getShortIdFromGroupSelection(selection: d3.selection): number {
    return parseInt(selection._groups[0][0].id, 10);
  }

  static isSinkType(checkType: any): boolean {
    return (<Sink>checkType.anchors) !== undefined;
  }

  static buildAnchorDrawConfiguration(anchor: Anchor): DrawConfiguration {
    return {
      id: `${anchor.shortId}`,
      clazz: `anchor`,
      cursor: `pointer`,
      color: `green`
    };
  }

  static buildSinkDrawConfiguration(sink: Sink): DrawConfiguration {
    return {
      id: `${sink.shortId}`,
      clazz: `sink anchor`,
      cursor: `pointer`,
      color: `orange`
    };
  }

  static createConnection(sink: Expandable, anchor: Expandable, id: string): ConnectingLine {
    const connectingLine = new ConnectingLine(sink.connectable, anchor.connectable, id);
    sink.connectable.sinkConnections.push(connectingLine);
    anchor.connectable.anchorConnection = connectingLine;
    return connectingLine;
  }

  static deselectDevice(device: Expandable): void {
    device.selectable.deselect();
  }

  static markSinkSubselection(mapSink: Expandable, connectingLine: ConnectingLine): void {
    mapSink.selectable.setBorderBox('orange');
    connectingLine.toggleLock();
  }

  constructor(public translate: TranslateService,
              private devicePlacerController: DevicePlacerController,
              private accButtons: AcceptButtonsService,
              private deviceService: DeviceService,
              private configurationService: ActionBarService,
              private mapLoaderInformer: MapLoaderInformerService,
              private toolbarService: ToolbarService,
              private icons: IconService) {
    this.setTranslations();
  }

  public onClick(): void {
    this.toolbarService.emitToolChanged(this);
  }

  getHintMessage(): string {
    return this.hintMessage;
  }

  ngOnInit(): void {
    this.getMapSelection();
    this.getConfiguredDevices();
    this.subscribeForDroppedDevice();
    this.fetchDevices();
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

  private getMapSelection(): void {
    this.mapLoadedSubscription = this.mapLoaderInformer.loadCompleted().subscribe((mapLoaded) => {
      this.map = mapLoaded;
    });
  }

  private getConfiguredDevices(): void {
    this.configurationService.configurationLoaded().first().subscribe((configuration) => {
      this.floorId = configuration.floorId;
      if (!!configuration.data.sinks) {
        this.drawConfiguredDevices(configuration.data.sinks);
      }
      if (!!configuration.data.anchors) {
        this.drawAnchorsWithoutConnection(configuration.data.anchors);
      }
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
    this.deviceService.setUrl('anchors/');
    this.deviceService.getAll().subscribe((anchors: Anchor[]) => {
      anchors.forEach((anchor: Anchor) => {
        if (anchor.verified) {
          this.verifiedDevices.push(anchor);
          if (!anchor.floorId) {
            this.remainingDevices.push(anchor);
          }
        }
      });
    });
    this.deviceService.setUrl('sinks/');
    this.deviceService.getAll().subscribe((sinks: Sink[]) => {
      sinks.forEach((sink: Sink) => {
        if (sink.verified) {
          this.verifiedDevices.push(sink);
          if (!sink.floorId) {
            this.remainingDevices.push(sink);
          }
        }
      });
    });
  }

  public dragDeviceStarted(device: Anchor | Sink): void {
    this.draggedDevice = device;
    this.toggleList();
  }

  public dragDeviceEnded(): void {
    if (this.draggedDevice && this.placementDone) {
      this.toggleList();
    }
    this.draggedDevice = null;
  }


  private manageSingleSelectable(mapDevice: Expandable): void {
    mapDevice.selectable.selectOn();
    const managedSelectable: Subscription = mapDevice.selectable.onSelected().subscribe((selectedMapDevice): d3.selection => {
      const deviceShortId = DevicePlacerComponent.getShortIdFromGroupSelection(selectedMapDevice);
      const selectedDevice = this.findMapDevice(deviceShortId);
      this.devicePlacerController.setSelectedDevice(selectedDevice);
    });
    this.managedSelectables.push(managedSelectable);
  }

  private activateAllSelectablesBahavior(): void {
    this.managedSelectables = [];
    this.mapDevices.forEach((mapDevice: Expandable) => {
      this.manageSingleSelectable(mapDevice);
    });
    this.handleSelectedDevices();
  }

  private handleSelectedDevices(): void {
    this.handledSelection = this.devicePlacerController.getSelectedDevice()
      .subscribe( (selectedDevice) => {
        this.clearSelections();
        const handledDevice = this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(selectedDevice.groupCreated.domGroup));
        this.setSelectedDevice(handledDevice);
        if (DevicePlacerComponent.isSinkType(handledDevice)) {
          this.chosenSink = <Sink>handledDevice;
        } else if (!!selectedDevice.connectable.anchorConnection) {
          const sinkAsConnectable = selectedDevice.connectable.anchorConnection.connectedSink();
          this.chosenSink = <Sink>this.findVerifiedDevice(DevicePlacerComponent.getShortIdFromGroupSelection(sinkAsConnectable.domGroup));
          DevicePlacerComponent.markSinkSubselection(this.findMapDevice(this.chosenSink.shortId), selectedDevice.connectable.anchorConnection);
        }
      selectedDevice.selectable.setBorderBox('red');
    });
  }

  private setSelectedDevice(selectedDevice: Anchor|Sink) {
    this.selectedDevice = selectedDevice;
    this.map.on('click.deselect', () => {
      this.clearSelections();
    });
  }

  private clearSelections(): void {
    if (!!this.selectedDevice && this.chosenSink !== this.selectedDevice) {
      DevicePlacerComponent.deselectDevice(this.findMapDevice(this.selectedDevice.shortId));
      const mapDevice = this.findMapDevice(this.selectedDevice.shortId);
      if (!!mapDevice.connectable.anchorConnection) {
        mapDevice.connectable.lockConnectionsToggle();
        mapDevice.connectable.anchorConnection.hide();
      }
    }
    if (!!this.chosenSink) {
      DevicePlacerComponent.deselectDevice(this.findMapDevice(this.chosenSink.shortId));
      this.chosenSink = null;
    }
    this.selectedDevice = null;
    this.map.on('click.deselect', null);
  }

  private deactivateAllSelectablesBahavior(): void {
    this.mapDevices.forEach((mapDevice: Expandable) => {
      mapDevice.selectable.selectOff();
    });
    this.managedSelectables.forEach( (selectableSubscription) => {
      selectableSubscription.unsubscribe();
    });
    this.handledSelection.unsubscribe();
    this.clearSelections();
  }

  private findMapDevice(shortId: number): Expandable {
    return this.mapDevices.find( (mapDevice: Expandable) => {
      return shortId === DevicePlacerComponent.getShortIdFromGroupSelection(mapDevice.groupCreated.domGroup);
    });
  }
  private findVerifiedDevice(shortId: number): Sink|Anchor {
    return this.verifiedDevices.find( (verifiedDevice: Sink|Anchor) => {
      return shortId === verifiedDevice.shortId;
    });
  }

  private drawConfiguredDevices(sinks: Array<Sink>): void {
    sinks.forEach((sink) => {
      const mapSink = this.drawDevice(DevicePlacerComponent.buildSinkDrawConfiguration(sink),
        {x: sink.x, y: sink.y});
      sink.anchors.forEach((anchor) => {
        const mapAnchor = this.drawDevice(DevicePlacerComponent.buildAnchorDrawConfiguration(anchor),
          {x: anchor.x, y: anchor.y});
        const identifier = '' + sink.shortId + anchor.shortId;
        const connectingLine = DevicePlacerComponent.createConnection(mapSink, mapAnchor, identifier);
        this.connectingLines.push(connectingLine);
      });
    });
  }

  private drawAnchorsWithoutConnection(anchors: Array<Anchor>): void {
    anchors.forEach((anchor) => {
      this.drawDevice(DevicePlacerComponent.buildAnchorDrawConfiguration(anchor), {x: anchor.x, y: anchor.y});
    });
  }

  public getToolName(): ToolName {
    return ToolName.ANCHOR;
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
    const droppedDevice = drawBuilder.createGroup()
      .place(coordinates)
      .addPointer({x: -12, y: -12}, this.icons.getIcon(NaviIcons.POINTER))
      .addText({x: 5, y: -5}, `${deviceConfig.clazz}-${deviceConfig.id}`);
      if (deviceConfig.clazz.includes(`sink`)) {
        droppedDevice.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.SINK));
      } else if (deviceConfig.clazz.includes(`anchor`)) {
        droppedDevice.addIcon({x: 5, y: 5}, this.icons.getIcon(NaviIcons.ANCHOR));
    }
    const mapDevice: Expandable = {
      groupCreated: droppedDevice,
      selectable: new Selectable(droppedDevice),
      connectable: new ConnectableDevice(droppedDevice)
    };
    this.mapDevices.push(mapDevice);
    return mapDevice;
  }

  private placeDeviceOnMap(device: Anchor | Sink, coordinates: Point): void {
    const drawOptions = (DevicePlacerComponent.isSinkType(device))
      ? DevicePlacerComponent.buildSinkDrawConfiguration(<Sink>device)
      : DevicePlacerComponent.buildAnchorDrawConfiguration(<Anchor>device);
    const expandableMapObject = this.drawDevice(drawOptions, coordinates);
    // condition for marked connection
    this.accButtons.publishCoordinates(coordinates);
    this.accButtons.publishVisibility(true);
    expandableMapObject.connectable.dragOn(true);
    this.accButtons.decisionMade.first().subscribe((decision) => {
      // TODO Change after decision logic to allow adding anchors alone GET THIS LOGIC DONE ~!
      if (decision) {
        if (DevicePlacerComponent.isSinkType(device)) {
          // TODO selection -> this.selectSink(<Sink>device);
        } else {
          // this.chosenSink.anchors.push(device);
        }
        // TODO subscribe on selected event and push to managedArray
        this.manageSingleSelectable(expandableMapObject);
        expandableMapObject.selectable.select();
        // ->  this.configurationService.setSink(this.chosenSink);
      } else {
        this.removeChosenAnchor(expandableMapObject);
      }
      this.devicePlacerController.resetCoordinates();
      this.placementDone = true;
      this.toggleList();
    });
  }

}
